import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';

import {packages, tarballName} from './packages.mjs';

function npmPublish(tarball) {
  return spawnSync(
    'npm',
    [
      'publish',
      tarball,
      '--access',
      'public',
      '--provenance',
      '--ignore-scripts',
      '--registry=https://registry.npmjs.org',
    ],
    {stdio: 'inherit'},
  );
}

function readPackedManifest(path) {
  const list = (flags) => {
    const result = spawnSync('tar', ['--ignore-zeros', flags, path], {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `Cannot inspect tarball: ${path}`);
    return result.stdout.trimEnd().split('\n');
  };
  // npm strips the first path component; reject aliases that could replace the checked manifest.
  const entries = list('-tzf');
  const seen = new Set();
  for (const entry of entries) {
    assert.match(entry, /^package\/[A-Za-z0-9_@.+/-]*$/);
    const normalized = entry.replace(/\/$/, '');
    assert.ok(normalized.split('/').every((part) => part && part !== '.' && part !== '..'));
    assert.ok(!seen.has(normalized), `Duplicate archive path: ${entry}`);
    seen.add(normalized);
  }
  assert.ok(seen.has('package/package.json'), 'Missing packed manifest');
  assert.ok(
    list('-tvzf').every((entry) => /^[-d]/.test(entry)),
    'Archive links are not allowed',
  );
  const result = spawnSync('tar', ['--ignore-zeros', '-xOzf', path, 'package/package.json'], {
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Cannot read packed manifest: ${path}`);
  return JSON.parse(result.stdout);
}

export function publishTarballs(plan, directory, publish = npmPublish) {
  const tarballs = plan.map(({name, version, tarball}) => {
    assert.ok(
      packages.some(([allowed]) => allowed === name),
      `Package not allowed: ${name}`,
    );
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.equal(tarball, tarballName(name, version));
    const path = join(directory, tarball);
    assert.ok(statSync(path).isFile(), `Missing tested tarball: ${path}`);
    const manifest = readPackedManifest(path);
    assert.equal(manifest.name, name);
    assert.equal(manifest.version, version);
    // npm applies publishConfig to authenticated requests, including proxy/TLS settings.
    for (const key of Object.keys(manifest.publishConfig ?? {})) {
      assert.ok(['access', 'exports'].includes(key), `Unsupported publishConfig key: ${key}`);
    }
    assert.equal(manifest.publishConfig?.access, 'public');
    return path;
  });
  for (const tarball of tarballs) {
    const result = publish(tarball);
    if (result.error) throw result.error;
    assert.equal(
      result.status,
      0,
      `npm publish failed for ${tarball}; inspect npm before retrying`,
    );
  }
}

if (import.meta.main) {
  const [plan, directory] = process.argv.slice(2);
  assert.ok(
    plan && directory,
    'Usage: node scripts/release/publish.mjs <plan.json> <tested-directory>',
  );
  publishTarballs(JSON.parse(readFileSync(plan, 'utf8')), directory);
}
