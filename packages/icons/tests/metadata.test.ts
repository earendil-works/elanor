import {readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {describe, expect, test} from 'vitest';

import {validateMetadata} from '../scripts/lib/metadata.js';

const packageDirectory = resolve(import.meta.dirname, '..');

describe('search metadata', () => {
  test('covers every vendored icon', async () => {
    const sources = (await readdir(resolve(packageDirectory, 'sources'))).filter((name) =>
      name.endsWith('.svg'),
    );
    const metadata: unknown = JSON.parse(
      await readFile(resolve(packageDirectory, 'metadata.json'), 'utf8'),
    );
    expect(() => validateMetadata(metadata, sources)).not.toThrow();
    expect(Object.keys(metadata as Record<string, unknown>)).toHaveLength(sources.length);
  });

  test('allows future fields in entries', () => {
    expect(() =>
      validateMetadata({search: {tags: ['find'], note: 'future field'}}, ['search.svg']),
    ).not.toThrow();
  });

  test.each([
    [{}, /missing tags for search/],
    [{search: {tags: []}}, /nonempty/],
    [{search: {tags: ['find', 'find']}}, /distinct/],
    [{search: {tags: ['Find']}}, /lowercase/],
    [{search: {tags: [' find']}}, /lowercase/],
    [{search: {tags: [12]}}, /nonempty/],
    [{search: {tags: ['find']}, missing: {tags: ['nope']}}, /no source SVG/],
  ])('rejects invalid or incomplete entries', (metadata, message) => {
    expect(() => validateMetadata(metadata, ['search.svg'])).toThrow(message);
  });
});
