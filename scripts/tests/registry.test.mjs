import assert from 'node:assert/strict';
import test from 'node:test';

import {discoverUnpublished} from '../release/registry.mjs';

const found = (version) => ({status: 0, stdout: JSON.stringify(version), stderr: ''});
const missing = {status: 1, stdout: JSON.stringify({error: {code: 'E404'}}), stderr: ''};
const failed = {status: 1, stdout: JSON.stringify({error: {code: 'E403'}}), stderr: ''};

test('discoverUnpublished plans only missing versions', () => {
  const manifests = [
    {name: '@earendil-works/a', version: '1.0.0'},
    {name: '@earendil-works/b', version: '0.2.0'},
  ];
  const plan = discoverUnpublished(manifests, (name) =>
    name === '@earendil-works/a' ? found('1.0.0') : missing,
  );
  assert.deepEqual(plan, [
    {name: '@earendil-works/b', version: '0.2.0', tarball: 'earendil-works-b-0.2.0.tgz'},
  ]);
});

test('discoverUnpublished fails on registry errors and lower versions', () => {
  const manifests = [{name: '@earendil-works/a', version: '1.0.0'}];
  assert.throws(() => discoverUnpublished(manifests, () => failed), /npm view failed/);
  assert.throws(
    () =>
      discoverUnpublished(manifests, (_name, range) =>
        range === '1.0.0' ? missing : found(['1.1.0']),
      ),
    /higher stable version/,
  );
});
