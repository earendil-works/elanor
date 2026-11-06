import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';

import {githubPagesUrl, githubUrl, resolveConfig} from '../src/config.ts';

test('reads GitHub remotes in their SSH and HTTPS forms', () => {
  assert.equal(
    githubUrl('git@github.com:earendil-works/absurd.git'),
    'https://github.com/earendil-works/absurd',
  );
  assert.equal(
    githubUrl('https://github.com/earendil-works/absurd'),
    'https://github.com/earendil-works/absurd',
  );
  assert.equal(githubUrl('https://gitlab.com/someone/project.git'), undefined);
});

test('derives the GitHub Pages address of a repository', () => {
  assert.equal(
    githubPagesUrl('https://github.com/earendil-works/absurd'),
    'https://earendil-works.github.io/absurd/',
  );
  assert.equal(
    githubPagesUrl('https://github.com/earendil-works/earendil-works.github.io'),
    'https://earendil-works.github.io/',
  );
});

test('defaults a folder of Markdown outside Git', () => {
  const project = mkdtempSync(join(tmpdir(), 'docs-kit-config-'));
  mkdirSync(join(project, 'docs'));
  writeFileSync(join(project, 'package.json'), JSON.stringify({name: '@acme/rocket-sled'}));
  const config = resolveConfig(project);
  assert.equal(config.docsDir, join(project, 'docs'));
  assert.equal(config.name, 'Rocket sled');
  assert.equal(config.brand, 'earendil');
  assert.equal(config.base, '/');
  assert.equal(config.editUrl, undefined);
  assert.equal(config.lastUpdated, true);
});

test('reads elanor-docs.json and resolves its paths from the Markdown folder', () => {
  const project = mkdtempSync(join(tmpdir(), 'docs-kit-config-'));
  mkdirSync(join(project, 'docs'));
  writeFileSync(
    join(project, 'docs/elanor-docs.json'),
    JSON.stringify({
      name: 'Rocket',
      brand: 'pi',
      site: 'https://example.com/rocket',
      customCss: ['theme.css'],
      components: {Footer: './footer.astro'},
    }),
  );
  const config = resolveConfig(project);
  assert.equal(config.name, 'Rocket');
  assert.equal(config.brand, 'pi');
  assert.equal(config.base, '/rocket/');
  assert.deepEqual(config.customCss, [join(project, 'docs/theme.css')]);
  assert.equal(config.components.Footer, join(project, 'docs/footer.astro'));
});

test('rejects unknown component slots and brands', () => {
  const project = mkdtempSync(join(tmpdir(), 'docs-kit-config-'));
  assert.throws(
    () => resolveConfig(project, {components: {Sidebar: 'x.astro'} as never}),
    /Sidebar/,
  );
  assert.throws(() => resolveConfig(project, {brand: 'acme' as never}), /acme/);
});
