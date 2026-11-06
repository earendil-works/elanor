/*
 * Problems found while rendering, such as broken links: printed once each, and kept on
 * `globalThis` for the integration, which fails the build on them in strict mode. The routes run
 * in a module graph of their own, so a module-level list would not reach the integration.
 */

const key = Symbol.for('@earendil-works/elanor-docs-kit/warnings');

type WarningStore = {[key]?: Set<string>};

export function warnings(): Set<string> {
  const store = globalThis as WarningStore;
  store[key] ??= new Set();
  return store[key];
}

export function warn(message: string): void {
  if (warnings().has(message)) return;
  warnings().add(message);
  console.warn(`[elanor-docs] ${message}`);
}
