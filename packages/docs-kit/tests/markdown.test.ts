import assert from 'node:assert/strict';
import test from 'node:test';

import type {Element, Root} from 'hast';

import {preprocessMarkdown} from '../runtime/content/extensions.ts';
import {renderPage, resolveLink, textOf, type RenderOptions} from '../runtime/content/markdown.ts';
import type {DocsPage} from '../runtime/content/site.ts';

function page(file: string, body = ''): DocsPage {
  const slug = file.replace(/(^|\/)index\.md$/, '').replace(/\.md$/, '');
  return {
    file,
    slug,
    url: slug ? `/docs/${slug}/` : '/docs/',
    title: 'Title',
    description: undefined,
    frontmatter: {},
    body,
    lastUpdated: undefined,
  };
}

const pages = [page('index.md'), page('guide/setup.md'), page('guide/index.md')];
const site = {byFile: new Map(pages.map((entry) => [entry.file, entry]))};
const options: RenderOptions = {
  base: '/docs/',
  sourceUrl: 'https://github.com/acme/rocket/blob/main/docs/',
  fileExists: (file) => file === 'images/logo.png',
};

function find(tree: Root | Element, test: (element: Element) => boolean): Element[] {
  const found: Element[] = [];
  const walk = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== 'element') continue;
      if (test(child)) found.push(child);
      walk(child);
    }
  };
  walk(tree);
  return found;
}

test('points links at pages, files, and the repository', () => {
  const from = pages[1]!;
  const warnings: string[] = [];
  const link = (href: string) => resolveLink(href, from, site, options, warnings);
  assert.equal(link('../index.md#start'), '/docs/#start');
  assert.equal(link('index.md'), '/docs/guide/');
  assert.equal(link('./'), '/docs/guide/');
  assert.equal(link('../images/logo.png'), '/docs/images/logo.png');
  assert.equal(link('../../src/main.ts'), 'https://github.com/acme/rocket/blob/main/src/main.ts');
  assert.equal(link('https://example.com/a.md'), 'https://example.com/a.md');
  assert.equal(link('#local'), '#local');
  assert.deepEqual(warnings, []);
  assert.equal(link('missing.md'), 'missing.md');
  assert.match(warnings[0] ?? '', /missing\.md/);
});

test('renders a page without its title, with heading ids and a table of contents', async () => {
  const {tree, toc, sections} = await renderPage(
    page(
      'index.md',
      '# Title\n\nIntro.\n\n## First part\n\nText.\n\n### Detail\n\n## First part\n',
    ),
    site,
    options,
  );
  assert.equal(find(tree, (element) => element.tagName === 'h1').length, 0);
  assert.deepEqual(toc, [
    {depth: 2, id: 'first-part', title: 'First part'},
    {depth: 3, id: 'detail', title: 'Detail'},
    {depth: 2, id: 'first-part-1', title: 'First part'},
  ]);
  assert.deepEqual(
    sections.map((section) => [section.anchor, section.text]),
    [
      ['', 'Intro.'],
      ['first-part', 'Text. Detail'],
      ['first-part-1', ''],
    ],
  );
});

test('marks GitHub alerts and highlights code', async () => {
  const {tree} = await renderPage(
    page('index.md', '> [!WARNING]\n> Careful.\n\n```ts\nconst a = 1;\n```\n'),
    site,
    options,
  );
  const [quote] = find(tree, (element) => element.tagName === 'blockquote');
  assert.equal(quote?.properties.dataAlert, 'warning');
  assert.equal(textOf(quote!).trim(), 'Careful.');
  const [pre] = find(tree, (element) => element.tagName === 'pre');
  assert.equal(pre?.properties.dataLanguage, 'ts');
  assert.equal(pre?.properties.dataCode, 'const a = 1;');
  assert.ok(find(pre!, (element) => element.tagName === 'span').length > 1);
});

test('rewrites Python-Markdown tabs and admonitions', async () => {
  const markdown = [
    '=== "One"',
    '',
    '    ```sh',
    '    echo one',
    '    ```',
    '',
    '=== "Two"',
    '',
    '    Second.',
    '',
    '!!! danger "Look out"',
    '',
    '    Inside.',
    '',
    '```md',
    '=== "Not a tab"',
    '```',
  ].join('\n');
  assert.match(preprocessMarkdown(markdown), /<div data-tab="One">/);
  assert.match(preprocessMarkdown(markdown), /```md\n=== "Not a tab"\n```/);

  const {tree} = await renderPage(page('index.md', markdown), site, options);
  const tabs = find(tree, (element) => element.properties.role === 'tab');
  assert.deepEqual(
    tabs.map((tab) => textOf(tab)),
    ['One', 'Two'],
  );
  const panels = find(tree, (element) => element.properties.role === 'tabpanel');
  assert.deepEqual(
    panels.map((panel) => panel.properties.hidden),
    [false, true],
  );
  const [alert] = find(tree, (element) => element.tagName === 'blockquote');
  assert.equal(alert?.properties.dataAlert, 'caution');
  assert.equal(alert?.properties.dataTitle, 'Look out');
});
