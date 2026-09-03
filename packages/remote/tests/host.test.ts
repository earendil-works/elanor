// @vitest-environment jsdom
import {
  MUTATION_TYPE_INSERT_CHILD,
  NODE_TYPE_ELEMENT,
  ROOT_ID,
  UPDATE_PROPERTY_TYPE_PROPERTY,
  MUTATION_TYPE_UPDATE_PROPERTY,
} from '@remote-dom/core';
import {describe, expect, it} from 'vitest';
import {createValidatedElanorHost, RemoteUiPolicyError} from '../src/host.ts';

function createHost() {
  const root = document.createElement('div');
  return {root, host: createValidatedElanorHost({root})};
}

const button = (properties: Record<string, unknown> = {}) => ({
  id: 'button-1',
  type: NODE_TYPE_ELEMENT,
  element: 'elnr-button',
  properties,
  children: [],
} as const);

describe('validated Elanor host receiver', () => {
  it('materializes an allowlisted element', () => {
    const {root, host} = createHost();
    host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, button({variant: 'primary'}), 0]]);
    expect(root.firstElementChild?.tagName).toBe('ELNR-BUTTON');
    expect((root.firstElementChild as HTMLElement & {variant: string}).variant).toBe('primary');
  });

  it('rejects arbitrary element names before touching the DOM', () => {
    const {root, host} = createHost();
    expect(() => host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, {...button(), element: 'div'}, 0]])).toThrow(RemoteUiPolicyError);
    expect(root.childElementCount).toBe(0);
  });

  it.each(['style', 'class', 'data-theme', '--semantic-color-background-fill-primary'])('rejects the %s styling escape', (name) => {
    const {host} = createHost();
    expect(() => host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, button({[name]: 'red'}), 0]])).toThrow(/forbidden|Unknown/);
  });

  it('rejects unknown values and later property mutations', () => {
    const {host} = createHost();
    expect(() => host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, button({variant: 'rainbow'}), 0]])).toThrow(/Invalid value/);
    host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, button(), 0]]);
    expect(() => host.connection.mutate([[MUTATION_TYPE_UPDATE_PROPERTY, 'button-1', 'style', 'color:red', UPDATE_PROPERTY_TYPE_PROPERTY]])).toThrow(/forbidden/);
  });

  it('enforces resource limits', () => {
    const root = document.createElement('div');
    const host = createValidatedElanorHost({root, limits: {maxNodes: 1}});
    const nested = {...button(), children: [{...button(), id: 'button-2'}]};
    expect(() => host.connection.mutate([[MUTATION_TYPE_INSERT_CHILD, ROOT_ID, nested, 0]])).toThrow(/exceeds 1 nodes/);
  });
});
