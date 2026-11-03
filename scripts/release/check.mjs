import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {cpSync, readdirSync, mkdirSync, mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {packages, tarballName} from './packages.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function validatePackage(manifest, files, [name, directory, notices]) {
  assert.equal(manifest.name, name);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.notEqual(manifest.private, true);
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.repository?.directory, directory);
  assert.ok(manifest.license, 'Missing license declaration');
  for (const file of ['README.md', ...notices]) assert.ok(files.has(file), `Missing ${file}`);
  for (const file of files) {
    assert.ok(
      !/(^|\/)(src|node_modules|\.[^/]*)(\/|$)|Plantin|\.map$|\.tgz$/i.test(file),
      `Unintended packed file: ${file}`,
    );
  }
  for (const dependencies of [
    manifest.dependencies,
    manifest.optionalDependencies,
    manifest.peerDependencies,
  ]) {
    for (const [dependency, version] of Object.entries(dependencies ?? {})) {
      assert.ok(!/^(workspace:|file:|link:)/.test(version), `Unresolved dependency: ${dependency}`);
      assert.ok(
        !version.includes('pkg.earendil.com'),
        `Preview dependency in npm package: ${dependency}`,
      );
    }
  }

  function checkExport(target) {
    if (target === null) return;
    if (typeof target === 'object') {
      assert.ok(!Object.hasOwn(target, 'source'), 'Development source export leaked');
      for (const value of Object.values(target)) checkExport(value);
      return;
    }
    assert.ok(typeof target === 'string' && target.startsWith('./'), `Invalid export: ${target}`);
    const [prefix, suffix] = target.slice(2).split('*');
    assert.ok(
      target.includes('*')
        ? [...files].some((file) => file.startsWith(prefix) && file.endsWith(suffix))
        : files.has(target.slice(2)),
      `Missing export target: ${target}`,
    );
  }
  checkExport(manifest.exports);
  for (const field of ['main', 'types']) {
    if (manifest[field]) assert.ok(files.has(manifest[field].replace(/^\.\//, '')));
  }
  if (manifest.peerDependencies?.react) {
    assert.ok(!manifest.dependencies?.react, 'React must stay a peer dependency');
  }
  if ([...files].some((file) => file.endsWith('.css'))) {
    assert.ok(Array.isArray(manifest.sideEffects) && manifest.sideEffects.includes('**/*.css'));
  }
}

export function packedFiles(directory) {
  return new Set(
    readdirSync(directory, {recursive: true, withFileTypes: true})
      .filter((entry) => {
        assert.ok(!entry.isSymbolicLink(), `Packed symlink: ${entry.name}`);
        return entry.isFile();
      })
      .map((entry) => relative(directory, join(entry.parentPath, entry.name))),
  );
}

export function consumerSpecs(manifests, output, plan) {
  const local = new Set();
  if (plan === undefined) {
    for (const {name} of manifests) local.add(name);
  } else {
    assert.ok(Array.isArray(plan), 'Release plan must be an array');
    for (const {name, version, tarball} of plan) {
      const manifest = manifests.find((entry) => entry.name === name);
      assert.ok(manifest, `Unknown package in release plan: ${name}`);
      assert.equal(version, manifest.version, `Stale release plan for ${name}`);
      assert.equal(tarball, tarballName(name, version));
      assert.ok(!local.has(name), `Duplicate package in release plan: ${name}`);
      local.add(name);
    }
  }
  return manifests.map(({name, version}) =>
    local.has(name) ? join(output, tarballName(name, version)) : `${name}@${version}`,
  );
}

function run(command, args, cwd = root, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    env: {...process.env, NODE_PATH: ''},
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr ?? result.status}`);
  return result.stdout;
}

if (import.meta.main) {
  const [directory, planFile, ...extra] = process.argv.slice(2);
  assert.equal(extra.length, 0, 'Usage: pnpm release:check [directory [plan.json]]');
  const output = directory ? resolve(directory) : mkdtempSync(join(tmpdir(), 'elanor-release-'));
  const manifests = packages.map(([name, path]) => {
    const manifest = readJSON(join(root, path, 'package.json'));
    assert.equal(manifest.name, name);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    return manifest;
  });
  const specs = consumerSpecs(manifests, output, planFile ? readJSON(planFile) : undefined);
  mkdirSync(output, {recursive: true});
  run('pnpm', [
    '-r',
    '--workspace-concurrency=1',
    ...packages.flatMap(([name]) => ['--filter', `${name}...`]),
    '--if-present',
    'run',
    'build',
  ]);
  for (const entry of packages) {
    const [name, directory] = entry;
    const source = readJSON(join(root, directory, 'package.json'));
    const tarball = join(output, tarballName(name, source.version));
    // Icon prepack hooks would repeat the build above.
    run('pnpm', [
      '--silent',
      '--dir',
      directory,
      'pack',
      '--config.ignore-scripts=true',
      '--out',
      tarball,
    ]);
    const unpack = mkdtempSync(join(tmpdir(), 'elanor-tarball-'));
    const entries = run('tar', ['-tzf', tarball], root, true).trim().split('\n');
    assert.ok(
      entries.every((file) => file.startsWith('package/') && !file.split('/').includes('..')),
    );
    run('tar', ['-xzf', tarball, '-C', unpack]);
    const packedRoot = join(unpack, 'package');
    const files = packedFiles(packedRoot);
    const packed = readJSON(join(packedRoot, 'package.json'));
    assert.equal(packed.version, source.version);
    validatePackage(packed, files, entry);
    console.log(`Validated ${name}@${packed.version}: ${files.size} files`);
  }

  const consumer = mkdtempSync(join(tmpdir(), 'elanor-consumer-'));
  cpSync(join(root, 'scripts/release/consumer'), consumer, {recursive: true});
  const installFlags = [
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--registry=https://registry.npmjs.org',
  ];
  run('npm', ['ci', ...installFlags], consumer);
  console.log(`Consumer packages:\n${specs.join('\n')}`);
  run('npm', ['install', '--no-save', ...installFlags, ...specs], consumer);
  run('npm', ['run', 'check'], consumer);
  console.log(`Validated tarballs: ${output}\nIsolated consumer: ${consumer}`);
}
