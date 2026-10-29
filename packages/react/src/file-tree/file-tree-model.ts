export interface FileTreeNode {
  /** Unique, stable id (for example the path). */
  id: string;
  /** Display name. Also used for type-ahead. */
  name: string;
  /** Present on folders, even when empty. */
  children?: ReadonlyArray<FileTreeNode> | undefined;
}

export interface FileTreeNodeMeta<Node extends FileTreeNode> {
  node: Node;
  parentId: string | null;
  level: number;
}

export interface FileTreeRow<Node extends FileTreeNode> {
  node: Node;
  level: number;
  posInSet: number;
  setSize: number;
  isFolder: boolean;
  expanded: boolean;
}

/** One pass over all nodes; gives O(1) parent and level lookups. */
export function indexNodes<Node extends FileTreeNode>(
  items: ReadonlyArray<Node>,
): Map<string, FileTreeNodeMeta<Node>> {
  const index = new Map<string, FileTreeNodeMeta<Node>>();
  const visit = (nodes: ReadonlyArray<Node>, parentId: string | null, level: number) => {
    for (const node of nodes) {
      index.set(node.id, {node, parentId, level});
      if (node.children) visit(node.children as ReadonlyArray<Node>, node.id, level + 1);
    }
  };
  visit(items, null, 1);
  return index;
}

/** The rows a user can see, in order: closed folders hide their descendants. */
export function flattenVisible<Node extends FileTreeNode>(
  items: ReadonlyArray<Node>,
  expanded: ReadonlySet<string>,
): Array<FileTreeRow<Node>> {
  const rows: Array<FileTreeRow<Node>> = [];
  const visit = (nodes: ReadonlyArray<Node>, level: number) => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]!;
      const isFolder = node.children !== undefined;
      const isExpanded = isFolder && expanded.has(node.id);
      rows.push({
        node,
        level,
        posInSet: index + 1,
        setSize: nodes.length,
        isFolder,
        expanded: isExpanded,
      });
      if (isExpanded) visit(node.children as ReadonlyArray<Node>, level + 1);
    }
  };
  visit(items, 1);
  return rows;
}

export function ancestorIds<Node extends FileTreeNode>(
  index: ReadonlyMap<string, FileTreeNodeMeta<Node>>,
  id: string,
): string[] {
  const ids: string[] = [];
  let parentId = index.get(id)?.parentId ?? null;
  while (parentId !== null) {
    ids.push(parentId);
    parentId = index.get(parentId)?.parentId ?? null;
  }
  return ids;
}

/** Holds the roving tab stop outside React state, so a focus move re-renders only two rows. */
export interface TabStopStore {
  get: () => string | null;
  set: (id: string | null) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createTabStopStore(initial: string | null): TabStopStore {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(id) {
      if (id === value) return;
      value = id;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
