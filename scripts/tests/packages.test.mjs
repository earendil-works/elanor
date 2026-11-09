import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {previewPackages} from '../release/packages.mjs';

test('every listed directory contains the listed package', () => {
  for (const [name, directory] of previewPackages) {
    const manifest = JSON.parse(
      readFileSync(new URL(`../../${directory}/package.json`, import.meta.url), 'utf8'),
    );
    assert.equal(manifest.name, name);
  }
});
