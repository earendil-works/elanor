import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';

import {publish, resolveTarget, snapshot} from '../preview-packages.mjs';
import {previewPackages, tarballName} from '../release/packages.mjs';

delete process.env.GITHUB_STEP_SUMMARY;

const repository = 'earendil-works/elanor';
const sha = 'a'.repeat(40);
const mainSha = 'b'.repeat(40);
const names = previewPackages.map(([name]) => name);
const label = `main-${sha.slice(0, 12)}`;

const env = (event, overrides = {}) => ({
  GITHUB_REPOSITORY: repository,
  GITHUB_REF: 'refs/heads/main',
  GITHUB_EVENT_NAME: event,
  GITHUB_SHA: sha,
  ...overrides,
});
const repo = {repository: {id: 1, full_name: repository}};
const run = (overrides = {}) => ({
  ...repo,
  workflow_run: {
    head_repository: {id: 1},
    event: 'push',
    conclusion: 'success',
    head_branch: 'v1.2.3',
    head_sha: sha,
    path: '.github/workflows/publish.yml',
    ...overrides,
  },
});

function github({tagSha = sha, status = 'behind'} = {}) {
  return async (path) => {
    if (path === 'git/ref/heads/main') return {object: {sha: mainSha}};
    if (path === `compare/${mainSha}...${sha}`) return {status};
    if (path === 'git/ref/tags/v1.2.3') return {object: {type: 'tag', sha: mainSha}};
    if (path === `git/tags/${mainSha}`) return {object: {type: 'commit', sha: tagSha}};
    throw new Error(`Unexpected lookup: ${path}`);
  };
}

test('resolveTarget accepts main pushes, tag runs and dispatched snapshots', async () => {
  assert.deepEqual(await resolveTarget(repo, env('push'), github()), {
    sha,
    tag: undefined,
    snapshot: false,
  });
  assert.deepEqual(await resolveTarget(run(), env('workflow_run'), github()), {
    sha,
    tag: 'v1.2.3',
    snapshot: false,
  });
  const dispatched = {...repo, inputs: {sha}};
  assert.deepEqual(
    await resolveTarget(dispatched, env('workflow_dispatch', {GITHUB_SHA: mainSha}), github()),
    {sha, tag: undefined, snapshot: true},
  );
});

test('resolveTarget rejects commits off main, moved tags and forked runs', async () => {
  await assert.rejects(resolveTarget(repo, env('push'), github({status: 'diverged'})));
  await assert.rejects(resolveTarget(run(), env('workflow_run'), github({tagSha: mainSha})));
  await assert.rejects(
    resolveTarget(run({head_repository: {id: 2}}), env('workflow_run'), github()),
  );
});

function pkg(releasedTag, released = names) {
  const calls = [];
  const call = async (method, path, _token, body) => {
    if (method === 'POST') calls.push([path, JSON.parse(body)]);
    if (path !== 'releases') return {};
    const {tag} = JSON.parse(body);
    return {sha, tag: releasedTag ?? tag, packages: released.map((name) => ({name}))};
  };
  return {calls, call};
}

function artifacts(packed = names) {
  const directory = mkdtempSync(join(tmpdir(), 'elanor-preview-'));
  for (const name of packed) writeFileSync(join(directory, tarballName(name)), name);
  return directory;
}

const token = async () => 'oidc-token';
const moveMain = ['refs', {sha, refs: ['main'], run: 42}];

test('publish moves main for main builds and releases tags without moving it', async () => {
  const cases = [
    [{sha}, [moveMain]],
    [{sha, tag: 'v1.2.3'}, [['releases', {sha, tag: 'v1.2.3'}]]],
  ];
  for (const [target, expected] of cases) {
    const {calls, call} = pkg();
    await publish(artifacts(), target, 42, call, token);
    assert.deepEqual(calls, expected);
  }
});

test('publish uploads tag builds that predate packages added to main', async () => {
  const {calls, call} = pkg(undefined, names.slice(1));
  const uploads = [];
  const record = async (method, path, ...rest) => {
    if (method === 'PUT') uploads.push(path);
    return call(method, path, ...rest);
  };
  await publish(artifacts(names.slice(1)), {sha, tag: 'v1.2.3'}, 42, record, token);
  assert.equal(uploads.length, names.length - 1);
  assert.deepEqual(calls, [['releases', {sha, tag: 'v1.2.3'}]]);
  await assert.rejects(publish(artifacts([]), {sha, tag: 'v1.2.3'}, 42, call, token));
});

test('publish rejects unexpected artifacts before authenticating', async () => {
  const directory = artifacts();
  writeFileSync(join(directory, 'evil.tgz'), '');
  let authenticated = false;
  const {call} = pkg();
  await assert.rejects(
    publish(directory, {sha}, 42, call, async () => {
      authenticated = true;
      return 'oidc-token';
    }),
  );
  assert.equal(authenticated, false);
});

const builds =
  (runs = [{head_sha: sha}]) =>
  async () => ({workflow_runs: runs});

test('snapshot keeps the existing build without uploading or moving main', async () => {
  const {calls, call} = pkg();
  await snapshot({sha, snapshot: true}, call, token, builds());
  assert.deepEqual(calls, [['releases', {sha, tag: label}]]);
});

test('snapshot refuses builds whose upload has not finished', async () => {
  const {calls, call} = pkg();
  await assert.rejects(snapshot({sha, snapshot: true}, call, token, builds([])), /No completed/);
  assert.deepEqual(calls, []);
});

test('snapshot accepts labels created before packages were added', async () => {
  const target = {sha, snapshot: true};
  await snapshot(target, pkg(undefined, names.slice(1)).call, token, builds());
  await assert.rejects(snapshot(target, pkg(undefined, []).call, token, builds()));
  await assert.rejects(
    snapshot(target, pkg(undefined, [...names, '@evil/pkg']).call, token, builds()),
  );
});
