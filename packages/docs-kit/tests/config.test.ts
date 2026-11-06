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
  assert.equal(config.sourceUrl, undefined);
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

test('takes the logo and the favicon from images of the Markdown folder', () => {
  const project = mkdtempSync(join(tmpdir(), 'docs-kit-config-'));
  mkdirSync(join(project, 'docs/brand'), {recursive: true});
  for (const file of ['logo.svg', 'logo-dark.svg', 'wordmark.svg', 'favicon.ico']) {
    writeFileSync(join(project, 'docs/brand', file), '');
  }
  writeFileSync(join(project, 'outside.svg'), '');

  assert.equal(resolveConfig(project).logo, undefined);
  assert.equal(resolveConfig(project).favicon, undefined);
  assert.equal(resolveConfig(project, {logo: false}).logo, false);

  const simple = resolveConfig(project, {logo: 'brand/logo.svg'});
  assert.deepEqual(simple.logo, {light: 'brand/logo.svg', dark: undefined, replacesName: false});
  assert.equal(simple.favicon, 'brand/logo.svg');

  const wordmark = resolveConfig(project, {
    logo: {light: 'brand/wordmark.svg', dark: 'brand/logo-dark.svg', replacesName: true},
  });
  assert.equal(wordmark.favicon, undefined);
  assert.equal(
    resolveConfig(project, {
      logo: {light: 'brand/wordmark.svg', replacesName: true},
      favicon: 'brand/favicon.ico',
    }).favicon,
    'brand/favicon.ico',
  );

  assert.throws(
    () => resolveConfig(project, {logo: '../outside.svg'}),
    /outside the Markdown folder/,
  );
  assert.throws(() => resolveConfig(project, {logo: 'brand/missing.svg'}), /does not exist/);
  assert.throws(() => resolveConfig(project, {favicon: 'index.md'}), /not an image/);
});

test('checks the navigation in elanor-docs.json', () => {
  const project = mkdtempSync(join(tmpdir(), 'docs-kit-config-'));
  const navigation = [
    'index.md',
    {
      group: 'Guide',
      items: [
        {page: 'a.md', label: 'A'},
        {section: 'More', items: ['b.md']},
      ],
    },
    {link: 'https://example.com', label: 'Example'},
  ];
  assert.deepEqual(resolveConfig(project, {navigation}).navigation, navigation);
  assert.throws(
    () =>
      resolveConfig(project, {
        navigation: [{section: 'S', items: [{group: 'G', items: []}]}] as never,
      }),
    /group inside another entry/,
  );
  assert.throws(
    () => resolveConfig(project, {navigation: [{title: 'x'}] as never}),
    /no page, link/,
  );
});
