import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {describe, expect, test} from 'vitest';

const file = resolve(import.meta.dirname, '../dist/pencil/radius.surface.css');

describe('optional surface skin', () => {
  test('targets explicit consumer classes, not ancestor-based appearance', async () => {
    const css = await readFile(file, 'utf8');
    expect(css).toContain('.elanor-pencil-surface:is([data-outline="box-small"]');
    expect(css).toContain('outline: none');
    expect(css).not.toContain('[data-strokes');
    expect(css).not.toContain('--outline-plain-');
    expect(css).not.toContain('--mark-');
    expect(css).not.toContain('padding:');
  });

  test('ships every SVG mask referenced by the skin', async () => {
    const css = await readFile(file, 'utf8');
    const masks = [...new Set([...css.matchAll(/url\("\.\/([^"]+)"\)/g)].map(match => match[1]!))];
    expect(masks.length).toBeGreaterThan(0);
    await Promise.all(masks.map(async mask => {
      expect(await readFile(resolve(import.meta.dirname, '../dist/pencil', mask), 'utf8')).toContain('<svg');
    }));
  });

  test('keeps all generated geometry local to the pseudo-element', async () => {
    const css = await readFile(file, 'utf8');
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*--stroke-[\w-]+\s*:[^{}]*)\}/g)];
    expect(rules.length).toBe(46); // 11 shapes × 4 variants, plus two pseudo-local inset defaults
    for (const [, selector] of rules) expect(selector!.trim()).toMatch(/::after$/);
  });

  test('falls back to ordinary rendering for forced colors or unsupported masking', async () => {
    const css = await readFile(file, 'utf8');
    expect(css).toContain('@supports (mask-image: none) and selector(:has(> input:focus-visible))');
    expect(css).toContain('@media not (forced-colors: active)');
    expect(css).toContain('[data-outline-focus="self"]:focus-visible');
    expect(css).toContain('[data-outline-focus="control"]:has(> [data-surface-control]:focus-visible)');
    expect(css).toContain('[data-outline-focus="parent"]');
    expect(css).toContain('[data-outline="line-vertical"]');
    expect(css).toContain('[data-outline-edge="block-end"]');
    expect(css).toContain('.elanor-pencil-indicator[data-indicator="check"][data-indeterminate]');
    expect(css).not.toContain(':has(:focus-visible)');
  });
});
