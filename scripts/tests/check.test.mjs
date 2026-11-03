import assert from 'node:assert/strict';
import test from 'node:test';

import {consumerSpecs, validatePackage} from '../release/check.mjs';

test('validatePackage rejects leaked sources and unresolved dependencies', () => {
  const entry = ['@earendil-works/elanor-react', 'packages/react', []];
  const manifest = {
    name: entry[0],
    version: '1.0.0',
    license: 'MIT',
    repository: {directory: entry[1]},
    publishConfig: {access: 'public'},
    exports: './dist/index.js',
  };
  const files = new Set(['README.md', 'dist/index.js']);
  validatePackage(manifest, files, entry);
  assert.throws(() => validatePackage(manifest, new Set([...files, 'dist/index.js.map']), entry));
  for (const version of ['workspace:*', 'https://pkg.earendil.com/a@main']) {
    assert.throws(() => validatePackage({...manifest, dependencies: {a: version}}, files, entry));
  }
});

test('consumerSpecs installs planned packages from tarballs and the rest from npm', () => {
  const manifests = [
    {name: '@earendil-works/a', version: '1.0.0'},
    {name: '@earendil-works/b', version: '2.0.0'},
  ];
  const planned = {
    name: '@earendil-works/b',
    version: '2.0.0',
    tarball: 'earendil-works-b-2.0.0.tgz',
  };
  assert.deepEqual(consumerSpecs(manifests, '/out', [planned]), [
    '@earendil-works/a@1.0.0',
    '/out/earendil-works-b-2.0.0.tgz',
  ]);
  assert.throws(() => consumerSpecs(manifests, '/out', [{...planned, version: '1.9.0'}]), /Stale/);
});
