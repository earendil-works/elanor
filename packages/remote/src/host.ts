import {
  MUTATION_TYPE_INSERT_CHILD,
  MUTATION_TYPE_REMOVE_CHILD,
  MUTATION_TYPE_UPDATE_PROPERTY,
  MUTATION_TYPE_UPDATE_TEXT,
  NODE_TYPE_COMMENT,
  NODE_TYPE_ELEMENT,
  NODE_TYPE_TEXT,
  ROOT_ID,
  UPDATE_PROPERTY_TYPE_ATTRIBUTE,
  UPDATE_PROPERTY_TYPE_EVENT_LISTENER,
  UPDATE_PROPERTY_TYPE_PROPERTY,
  type RemoteConnection,
  type RemoteMutationRecord,
  type RemoteNodeSerialization,
} from '@remote-dom/core';
import {DOMRemoteReceiver} from '@remote-dom/core/receivers';
import {
  elanorElementContracts,
  isElanorElementName,
  validateContractValue,
  type ElanorElementName,
  type ElementContract,
} from './contracts.js';

export interface RemoteHostLimits {
  readonly maxBatchMutations: number;
  readonly maxMutationsPerSecond: number;
  readonly maxNodes: number;
  readonly maxDepth: number;
  readonly maxTextLength: number;
}

export const defaultRemoteHostLimits: RemoteHostLimits = {
  maxBatchMutations: 500,
  maxMutationsPerSecond: 5_000,
  maxNodes: 5_000,
  maxDepth: 32,
  maxTextLength: 100_000,
};

export class RemoteUiPolicyError extends Error {
  override readonly name = 'RemoteUiPolicyError';
}

interface TrackedNode {
  readonly id: string;
  readonly type: typeof NODE_TYPE_ELEMENT | typeof NODE_TYPE_TEXT;
  readonly element?: ElanorElementName;
  parent: string | null;
  children: string[];
}

export interface ValidatedElanorHostOptions {
  readonly root: Element;
  readonly limits?: Partial<RemoteHostLimits>;
  readonly onViolation?: (error: RemoteUiPolicyError) => void;
}

export interface ValidatedElanorHost {
  readonly connection: RemoteConnection;
  readonly root: Element;
  disconnect(): DocumentFragment;
}

export function createValidatedElanorHost(options: ValidatedElanorHostOptions): ValidatedElanorHost {
  const limits = {...defaultRemoteHostLimits, ...options.limits};
  const nodes = new Map<string, TrackedNode>([[ROOT_ID, {id: ROOT_ID, type: NODE_TYPE_ELEMENT, parent: null, children: []}]]);
  let windowStartedAt = performance.now();
  let windowMutations = 0;

  const violation = (message: string): never => {
    const error = new RemoteUiPolicyError(message);
    options.onViolation?.(error);
    throw error;
  };

  const contractFor = (tag: string): ElementContract => {
    if (!isElanorElementName(tag)) return violation(`Element ${JSON.stringify(tag)} is not allowed`);
    return elanorElementContracts[tag];
  };

  const validateNamedValue = (contract: ElementContract, name: string, value: unknown, kind: 'attribute' | 'property'): void => {
    if (name === 'style' || name === 'class' || name.startsWith('data-') || name.startsWith('--')) {
      violation(`${kind} ${JSON.stringify(name)} is forbidden`);
    }
    const definition = kind === 'property'
      ? contract.properties[name]
      : contract.attributes?.[name] ?? contract.properties[name];
    if (!definition) violation(`Unknown ${kind} ${JSON.stringify(name)}`);
    if (!validateContractValue(definition!, value)) violation(`Invalid value for ${kind} ${JSON.stringify(name)}`);
  };

  const validateSlot = (parent: TrackedNode, value: unknown): void => {
    if (typeof value !== 'string' || !parent.element) violation('A slot requires an Elanor parent');
    const parentContract = contractFor(parent.element!);
    if (!parentContract.slots?.includes(value as string)) violation(`Slot ${JSON.stringify(value)} is not allowed on ${parent.element}`);
  };

  const cloneNodes = (): Map<string, TrackedNode> => new Map([...nodes].map(([id, node]) => [id, {...node, children: [...node.children]}]));

  const removeSubtree = (state: Map<string, TrackedNode>, id: string): void => {
    const node = state.get(id);
    if (!node) return;
    for (const child of node.children) removeSubtree(state, child);
    state.delete(id);
  };

  const validateSerializedNode = (state: Map<string, TrackedNode>, serialized: RemoteNodeSerialization, parent: TrackedNode, depth: number): TrackedNode => {
    if (depth > limits.maxDepth) return violation(`Remote tree exceeds depth ${limits.maxDepth}`);
    if (state.has(serialized.id)) return violation(`Duplicate remote node id ${serialized.id}`);
    if (serialized.type === NODE_TYPE_COMMENT) return violation('Remote comments are not allowed');
    if (serialized.type === NODE_TYPE_TEXT) {
      if (serialized.data.length > limits.maxTextLength) return violation(`Remote text exceeds ${limits.maxTextLength} characters`);
      const text: TrackedNode = {id: serialized.id, type: NODE_TYPE_TEXT, parent: parent.id, children: []};
      state.set(text.id, text);
      return text;
    }
    if (serialized.type !== NODE_TYPE_ELEMENT) return violation('Unknown remote node type');

    if (!isElanorElementName(serialized.element)) return violation(`Element ${JSON.stringify(serialized.element)} is not allowed`);
    const contract = contractFor(serialized.element);
    const element: TrackedNode = {id: serialized.id, type: NODE_TYPE_ELEMENT, element: serialized.element, parent: parent.id, children: []};
    state.set(element.id, element);

    for (const [name, value] of Object.entries(serialized.properties ?? {})) validateNamedValue(contract, name, value, 'property');
    for (const [name, value] of Object.entries(serialized.attributes ?? {})) {
      if (name === 'slot') validateSlot(parent, value);
      else validateNamedValue(contract, name, value, 'attribute');
    }
    for (const [name, listener] of Object.entries(serialized.eventListeners ?? {})) {
      if (!contract.events?.includes(name) || typeof listener !== 'function') violation(`Event ${JSON.stringify(name)} is not allowed on ${serialized.element}`);
    }

    for (const child of serialized.children) {
      const tracked = validateSerializedNode(state, child, element, depth + 1);
      element.children.push(tracked.id);
    }
    return element;
  };

  const validateRecords = (records: readonly RemoteMutationRecord[]): Map<string, TrackedNode> => {
    if (records.length > limits.maxBatchMutations) violation(`Mutation batch exceeds ${limits.maxBatchMutations}`);
    const now = performance.now();
    if (now - windowStartedAt >= 1_000) {
      windowStartedAt = now;
      windowMutations = 0;
    }
    windowMutations += records.length;
    if (windowMutations > limits.maxMutationsPerSecond) violation(`Mutation rate exceeds ${limits.maxMutationsPerSecond} per second`);

    const next = cloneNodes();
    for (const record of records) {
      const [type, id] = record;
      if (type === MUTATION_TYPE_INSERT_CHILD) {
        const [, , child, index] = record;
        const parent = next.get(id);
        if (!parent || parent.type !== NODE_TYPE_ELEMENT) violation(`Unknown insertion parent ${id}`);
        if (index < 0 || index > parent!.children.length) violation(`Invalid insertion index ${index}`);
        const depth = depthOf(next, parent!.id);
        const tracked = validateSerializedNode(next, child, parent!, depth + 1);
        parent!.children.splice(index, 0, tracked.id);
      } else if (type === MUTATION_TYPE_REMOVE_CHILD) {
        const [, , index] = record;
        const parent = next.get(id);
        if (!parent || index < 0 || index >= parent.children.length) violation(`Invalid removal from ${id}`);
        const removed = parent!.children.splice(index, 1)[0];
        if (removed) removeSubtree(next, removed);
      } else if (type === MUTATION_TYPE_UPDATE_TEXT) {
        const [, , text] = record;
        const node = next.get(id);
        if (!node || node.type !== NODE_TYPE_TEXT) violation(`Unknown text node ${id}`);
        if (text.length > limits.maxTextLength || node!.type !== NODE_TYPE_TEXT) violation(`Remote text exceeds ${limits.maxTextLength} characters`);
      } else if (type === MUTATION_TYPE_UPDATE_PROPERTY) {
        const [, , name, value, updateType = UPDATE_PROPERTY_TYPE_PROPERTY] = record;
        const node = next.get(id);
        if (!node?.element) violation(`Unknown element ${id}`);
        const contract = contractFor(node!.element!);
        if (updateType === UPDATE_PROPERTY_TYPE_EVENT_LISTENER) {
          if (!contract.events?.includes(name) || (value !== null && typeof value !== 'function')) violation(`Event ${JSON.stringify(name)} is not allowed on ${node!.element}`);
        } else if (updateType === UPDATE_PROPERTY_TYPE_ATTRIBUTE && name === 'slot') {
          const parent = node!.parent ? next.get(node!.parent) : undefined;
          if (!parent) violation('Slotted element has no parent');
          validateSlot(parent!, value);
        } else if (updateType === UPDATE_PROPERTY_TYPE_ATTRIBUTE) {
          validateNamedValue(contract, name, value, 'attribute');
        } else if (updateType === UPDATE_PROPERTY_TYPE_PROPERTY) {
          validateNamedValue(contract, name, value, 'property');
        } else {
          violation(`Unknown property update type ${String(updateType)}`);
        }
      } else {
        violation(`Unknown mutation type ${String(type)}`);
      }
      if (next.size - 1 > limits.maxNodes) violation(`Remote tree exceeds ${limits.maxNodes} nodes`);
    }
    return next;
  };

  const validateCall = (id: string, method: string): void => {
    const node = nodes.get(id);
    if (!node?.element) violation(`Unknown method target ${id}`);
    if (!contractFor(node!.element!).methods?.includes(method)) violation(`Method ${JSON.stringify(method)} is not allowed on ${node!.element}`);
  };

  const receiver = new DOMRemoteReceiver({
    root: options.root,
    call(element, method, ...args) {
      const callable = (element as unknown as Record<string, unknown>)[method];
      if (typeof callable !== 'function') return violation(`Host method ${JSON.stringify(method)} is unavailable`);
      return callable.apply(element, args);
    },
  });

  const connection: RemoteConnection = {
    mutate(records) {
      const next = validateRecords(records);
      receiver.connection.mutate(records);
      nodes.clear();
      for (const [id, node] of next) nodes.set(id, node);
    },
    call(id, method, ...args) {
      validateCall(id, method);
      return receiver.connection.call(id, method, ...args);
    },
  };

  return {connection, root: options.root, disconnect: () => receiver.disconnect()};
}

function depthOf(nodes: ReadonlyMap<string, TrackedNode>, id: string): number {
  let depth = 0;
  let current = nodes.get(id);
  while (current?.parent) {
    depth += 1;
    current = nodes.get(current.parent);
  }
  return depth;
}

