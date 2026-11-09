import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';

import {tarballName} from '../release/packages.mjs';
import {publishTarballs} from '../release/publish.mjs';

const tokens = '@earendil-works/design-tokens';
const fonts = '@earendil-works/elanor-fonts';

function tarball(directory, name, {manifest = {}, setup, entries = ['package']} = {}) {
  const version = '1.0.0';
  const source = mkdtempSync(join(tmpdir(), 'elanor-publish-test-'));
  mkdirSync(join(source, 'package'));
  writeFileSync(
    join(source, 'package/package.json'),
    JSON.stringify({name, version, publishConfig: {access: 'public'}, ...manifest}),
  );
  setup?.(join(source, 'package'));
  const file = tarballName(name, version);
  const result = spawnSync('tar', ['-czf', join(directory, file), '-C', source, ...entries]);
  assert.equal(result.status, 0, String(result.stderr));
  return {name, version, tarball: file};
}

function recorder(status = 0) {
  const calls = [];
  return {calls, publish: (path) => calls.push(path) && {status}};
}

test('publishes tarballs in plan order and stops at the first failure', () => {
  const dir = mkdtempSync(join(tmpdir(), 'elanor-publish-'));
  const plan = [tarball(dir, tokens), tarball(dir, fonts)];
  const succeeded = recorder();
  publishTarballs(plan, dir, succeeded.publish);
  assert.deepEqual(
    succeeded.calls,
    plan.map(({tarball: file}) => join(dir, file)),
  );
  const failed = recorder(1);
  assert.throws(() => publishTarballs(plan, dir, failed.publish), /npm publish failed/);
  assert.equal(failed.calls.length, 1);
});

test('rejects unsafe tarballs before publishing any', () => {
  const cases = [
    (dir) =>
      tarball(dir, fonts, {
        manifest: {publishConfig: {access: 'public', registry: 'https://evil.test'}},
      }),
    (dir) =>
      tarball(dir, fonts, {setup: (root) => symlinkSync('package.json', join(root, 'link'))}),
    // A second package.json entry could replace the manifest checked here.
    (dir) => tarball(dir, fonts, {entries: ['package', 'package/package.json']}),
  ];
  for (const unsafe of cases) {
    const dir = mkdtempSync(join(tmpdir(), 'elanor-publish-'));
    const {calls, publish} = recorder();
    assert.throws(() => publishTarballs([tarball(dir, tokens), unsafe(dir)], dir, publish));
    assert.deepEqual(calls, []);
  }
});
