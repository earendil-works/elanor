import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';

import {packages, tarballName} from './packages.mjs';

function registryResponse(result) {
  if (result.error) throw result.error;
  assert.notEqual(result.status, null, 'npm view was interrupted');
  let response;
  try {
    response = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Invalid npm view response: ${result.stderr || result.stdout}`);
  }
  if (result.status === 0) return response;
  if (response.error?.code === 'E404') return undefined;
  throw new Error(`npm view failed: ${result.stderr || result.stdout}`);
}

export function isPublished(result, version) {
  const response = registryResponse(result);
  if (response === undefined) return false;
  assert.equal(response, version, 'Registry returned an unexpected version');
  return true;
}

export function discoverUnpublished(manifests, query) {
  return manifests.flatMap(({name, version}) => {
    if (isPublished(query(name, version), version)) return [];
    // npm excludes prereleases from this range.
    assert.equal(
      registryResponse(query(name, `>${version}`)),
      undefined,
      `Refusing ${name}@${version}: a higher stable version already exists on npm`,
    );
    return [{name, version, tarball: tarballName(name, version)}];
  });
}

if (import.meta.main) {
  const output = process.argv[2];
  assert.ok(output, 'Usage: node scripts/release/registry.mjs <plan.json>');
  const manifests = packages.map(([name, directory]) => {
    const manifest = JSON.parse(readFileSync(`${directory}/package.json`, 'utf8'));
    assert.equal(manifest.name, name);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.notEqual(manifest.private, true);
    return manifest;
  });
  const plan = discoverUnpublished(manifests, (name, version) =>
    spawnSync(
      'npm',
      ['view', `${name}@${version}`, 'version', '--json', '--registry=https://registry.npmjs.org'],
      {encoding: 'utf8'},
    ),
  );
  writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `publish=${plan.length > 0}\n`);
  }
  for (const {name, version} of manifests) {
    const missing = plan.some((entry) => entry.name === name);
    console.log(
      `${name}@${version}: ${missing ? 'not yet published' : 'already published; skipping'}`,
    );
  }
  console.log(`${plan.length} package version(s) to publish.`);
}
