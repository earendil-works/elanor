import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {
  appendFileSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import {join, resolve} from 'node:path';

import {previewPackages as packages, tarballName} from './release/packages.mjs';

const base = 'https://pkg.earendil.com';
const repository = 'earendil-works/elanor';
const fullSha = /^[0-9a-f]{40}$/;
const releaseTag = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

async function request(url, options, label) {
  const response = await fetch(url, {...options, redirect: 'error'});
  // Do not include response bodies or authorization headers in Actions logs.
  if (!response.ok) throw new Error(`${label} failed (HTTP ${response.status})`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function github(path) {
  assert.ok(process.env.GH_TOKEN, 'Missing GitHub read token');
  return request(
    `https://api.github.com/repos/${repository}/${path}`,
    {headers: {authorization: `Bearer ${process.env.GH_TOKEN}`}},
    'GitHub lookup',
  );
}

export async function resolveTarget(event, env, lookup = github) {
  assert.equal(env.GITHUB_REPOSITORY, repository);
  assert.equal(event.repository.full_name, repository);
  assert.equal(env.GITHUB_REF, 'refs/heads/main', 'Publisher must run from main');
  let sha = env.GITHUB_SHA;
  let tag;
  let snapshot = false;
  if (env.GITHUB_EVENT_NAME === 'workflow_run') {
    const run = event.workflow_run;
    assert.equal(run.head_repository.id, event.repository.id, 'Run must belong to this repository');
    assert.equal(run.event, 'push');
    assert.equal(run.conclusion, 'success');
    tag = run.head_branch;
    sha = run.head_sha;
    assert.match(tag, releaseTag, 'Expected a stable vX.Y.Z release tag');
    const workflow = '.github/workflows/publish.yml';
    assert.ok(
      [workflow, `${workflow}@refs/tags/${tag}`].includes(run.path),
      'Unexpected source workflow',
    );
    let {object} = await lookup(`git/ref/tags/${tag}`);
    for (let depth = 0; object.type === 'tag' && depth < 10; depth++) {
      assert.match(object.sha, fullSha);
      ({object} = await lookup(`git/tags/${object.sha}`));
    }
    assert.equal(object.type, 'commit');
    assert.equal(object.sha, sha, 'Release tag moved since the npm run');
  } else if (env.GITHUB_EVENT_NAME === 'workflow_dispatch' && event.inputs?.sha) {
    // Only users with write access can dispatch.
    sha = event.inputs.sha;
    snapshot = true;
  } else {
    assert.ok(['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME));
  }
  assert.match(sha, fullSha);
  // Resolve the branch explicitly: a tag named main must not satisfy ancestry.
  const main = await lookup('git/ref/heads/main');
  assert.match(main.object.sha, fullSha);
  const comparison = await lookup(`compare/${main.object.sha}...${sha}`);
  assert.ok(['behind', 'identical'].includes(comparison.status), 'Commit is not on main');
  return {sha, tag, snapshot};
}

export function pack(directory, sha) {
  assert.match(sha, fullSha);
  mkdirSync(directory, {recursive: true});
  const names = new Set(packages.map(([name]) => name));
  for (const [name, path] of packages) {
    const manifestPath = join(path, 'package.json');
    const original = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(original);
    assert.equal(manifest.name, name);
    for (const field of ['dependencies', 'optionalDependencies']) {
      for (const dependency of Object.keys(manifest[field] ?? {})) {
        if (names.has(dependency)) manifest[field][dependency] = `${base}/${dependency}@${sha}`;
      }
    }
    try {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const result = spawnSync(
        'pnpm',
        [
          '--dir',
          path,
          'pack',
          '--config.ignore-scripts=true',
          '--out',
          join(directory, tarballName(name)),
        ],
        {stdio: 'inherit'},
      );
      if (result.error) throw result.error;
      assert.equal(result.status, 0, `Could not pack ${name}`);
    } finally {
      writeFileSync(manifestPath, original);
    }
  }
}

async function oidcToken() {
  const url = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  assert.equal(url.protocol, 'https:');
  url.searchParams.set('audience', base);
  assert.ok(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'Missing OIDC request token');
  const {value} = await request(
    url,
    {headers: {authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`}},
    'OIDC request',
  );
  if (typeof value !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(value)) {
    throw new Error('Invalid OIDC token');
  }
  console.log(`::add-mask::${value}`);
  return value;
}

async function pkg(method, path, token, body) {
  return request(
    `${base}/_/${path}`,
    {method, headers: {authorization: `Bearer ${token}`}, body},
    'pkg request',
  );
}

function summarize(heading, ref, names = packages.map(([name]) => name)) {
  const lines = [
    '### pkg packages',
    '',
    heading,
    '',
    '```sh',
    ...names.map((name) => `npm i ${base}/${name}@${ref}`),
    '```',
    '',
    'Installation requires pkg login. No credentials are embedded in these URLs.',
    '',
  ];
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  }
}

async function release(sha, label, token, call) {
  const result = await call('POST', 'releases', token, JSON.stringify({sha, tag: label}));
  assert.equal(result.sha, sha);
  assert.equal(result.tag, label);
  // A label may predate packages added later, so accept any subset of the configured list.
  const configured = packages.map(([name]) => name);
  const released = result.packages.map(({name}) => name);
  assert.ok(released.length > 0, `${label} released no packages`);
  for (const name of released) {
    assert.ok(configured.includes(name), `${label} released unexpected package: ${name}`);
  }
  const missing = configured.filter((name) => !released.includes(name));
  if (missing.length > 0) console.log(`${label} does not include: ${missing.join(', ')}`);
  console.log(`Released ${label}; builds are kept permanently.`);
  summarize(`\`${label}\` is kept permanently.`, label, released);
}

const snapshotLabel = (sha) => `main-${sha.slice(0, 12)}`;

// Releases the build main already uploaded; pkg refuses once it has expired (30 days).
// pkg fixes a label's packages on creation, so only a finished upload may be snapshotted.
export async function snapshot(
  {sha, snapshot: requested},
  call = pkg,
  getToken = oidcToken,
  lookup = github,
) {
  assert.match(sha, fullSha);
  assert.equal(requested, true, 'Snapshots need a main commit SHA');
  const {workflow_runs: runs} = await lookup(
    `actions/workflows/preview-packages.yml/runs?head_sha=${sha}&event=push&status=success&per_page=1`,
  );
  assert.ok(
    runs.some((run) => run.head_sha === sha),
    `No completed main build for ${sha}; wait for its Preview packages run to succeed`,
  );
  await release(sha, snapshotLabel(sha), await getToken(), call);
}

export async function publish(
  directory,
  {sha, tag, snapshot: requested},
  run,
  call = pkg,
  getToken = oidcToken,
) {
  assert.match(sha, fullSha);
  assert.notEqual(requested, true, 'Snapshots reuse the existing build');
  if (tag !== undefined) assert.match(tag, releaseTag);
  assert.ok(Number.isSafeInteger(run) && run > 0, 'Invalid workflow run ID');
  // Tag builds pack with the tag's own list, which may lack packages added since.
  const byTarball = new Map(packages.map(([name]) => [tarballName(name), name]));
  const files = readdirSync(directory);
  assert.ok(files.length > 0, 'No tarballs to publish');
  const tarballs = files.map((file) => {
    const name = byTarball.get(file);
    assert.ok(name, `Unexpected artifact: ${file}`);
    const path = join(directory, tarballName(name));
    assert.ok(lstatSync(path).isFile(), `Expected a regular tarball: ${name}`);
    return {name, bytes: readFileSync(path)};
  });
  const token = await getToken();
  for (const {name, bytes} of tarballs) {
    await call('PUT', `upload/${sha}/${encodeURIComponent(name)}?event=push`, token, bytes);
    console.log(`Uploaded ${name}@${sha}`);
  }
  if (tag) return release(sha, tag, token, call);
  await call('POST', 'refs', token, JSON.stringify({sha, refs: ['main'], run}));
  summarize(
    `Main build \`${sha}\` expires after 30 days. To keep it, run **Preview packages** with this SHA.`,
    sha,
  );
}

if (import.meta.main) {
  try {
    const [command, directory, sha, ...extra] = process.argv.slice(2);
    assert.equal(extra.length, 0);
    if (command === 'pack') {
      assert.ok(directory && sha, 'Usage: preview-packages.mjs pack <directory> <sha>');
      pack(resolve(directory), sha);
    } else {
      assert.ok(['target', 'publish', 'snapshot'].includes(command));
      const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
      const target = await resolveTarget(event, process.env);
      if (command === 'target') {
        appendFileSync(process.env.GITHUB_OUTPUT, `sha=${target.sha}\n`);
      } else if (command === 'snapshot') {
        assert.equal(directory, undefined, 'Usage: preview-packages.mjs snapshot');
        await snapshot(target);
      } else {
        assert.ok(directory, 'Usage: preview-packages.mjs publish <directory>');
        await publish(resolve(directory), target, Number(process.env.GITHUB_RUN_ID));
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
