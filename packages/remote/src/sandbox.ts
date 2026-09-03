import {elanorElementContracts, type ElementContract} from './contracts.js';
import {createRemoteElement, RemoteRootElement} from '@remote-dom/core/elements';
import type {RemoteConnection} from '@remote-dom/core';

const typeConstructors = {boolean: Boolean, string: String} as const;

for (const [tag, rawContract] of Object.entries(elanorElementContracts)) {
  if (customElements.get(tag)) continue;
  const contract: ElementContract = rawContract;
  const properties = Object.fromEntries(Object.entries(contract.properties).map(([name, property]) => [name, {type: typeConstructors[property.type]}]));
  const Element = createRemoteElement({
    properties,
    attributes: contract.attributes ? Object.keys(contract.attributes) : undefined,
    events: contract.events,
    methods: contract.methods,
    slots: contract.slots,
  });
  customElements.define(tag, Element);
}

const rootTag = 'elnr-remote-root';
if (!customElements.get(rootTag)) customElements.define(rootTag, RemoteRootElement);

export type ElanorRemoteRoot = RemoteRootElement & {connect(connection: RemoteConnection): void};

export function createElanorRemoteRoot(connection: RemoteConnection): ElanorRemoteRoot {
  const root = document.createElement(rootTag) as ElanorRemoteRoot;
  root.connect(connection);
  document.body.append(root);
  return root;
}
