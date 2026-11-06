import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import test from 'node:test';

import {firstParagraph, readSite, splitFrontmatter, type NavItem} from '../runtime/content/site.ts';

function folder(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'docs-kit-site-'));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), {recursive: true});
    writeFileSync(join(dir, file), text);
  }
  return dir;
}

const options = (docsDir: string) => ({docsDir, base: '/docs/', lastUpdated: false});

test('serves each file at its path, and index and README files at their folder', () => {
  const site = readSite(
    options(
      folder({
        'README.md': '# Home\n',
        'guide/index.md': '# Guide\n',
        'guide/README.md': '# Shadowed by index.md\n',
        'guide/setup.md': '# Setup\n',
        'AGENTS.md': '# For agents\n',
      }),
    ),
  );
  assert.deepEqual(
    site.pages.map((page) => [page.file, page.url]),
    [
      ['README.md', '/docs/'],
      ['guide/index.md', '/docs/guide/'],
      ['guide/setup.md', '/docs/guide/setup/'],
    ],
  );
});

test('takes titles from front matter, the first heading, or the file name', () => {
  const site = readSite(
    options(
      folder({
        'a.md': '---\ntitle: From front matter\n---\n# Heading\n',
        'b.md': '```md\n# Not this\n```\n\n# The `real` title\n',
        'c-and-d.md': 'No heading.\n',
      }),
    ),
  );
  assert.deepEqual(
    site.pages.map((page) => page.title),
    ['From front matter', 'The real title', 'C and d'],
  );
});

/** The navigation as labels, sections as `[label, items]`. */
function outline(items: readonly NavItem[]): unknown[] {
  return items.map((item) =>
    item.kind === 'section' ? [item.label, outline(item.items)] : item.label,
  );
}

test('follows the navigation in elanor-docs.json', () => {
  const site = readSite({
    ...options(
      folder({
        'index.md': '# Home\n',
        'workloads.md': '# Workloads\n',
        'cli.md': '# CLI\n',
        'sdk.md': '# SDK\n',
        'sdk-vm.md': '# VM control\n',
        'unlisted.md': '# Unlisted\n',
      }),
    ),
    navigation: [
      'index.md',
      {
        group: 'Using it',
        items: ['workloads.md', 'cli.md', {link: 'https://example.com', label: 'Blog'}],
      },
      {
        group: 'SDK',
        items: [
          {page: 'sdk.md', label: 'Overview'},
          {section: 'Advanced', collapsed: true, items: ['sdk-vm.md', 'missing.md']},
        ],
      },
    ],
  });
  assert.deepEqual(
    site.nav.map((group) => [group.label, outline(group.items)]),
    [
      [undefined, ['Home']],
      ['Using it', ['Workloads', 'CLI', 'Blog']],
      ['SDK', ['Overview', ['Advanced', ['VM control']]]],
    ],
  );
  assert.deepEqual(
    site.sequence.map((page) => page.title),
    ['Home', 'Workloads', 'CLI', 'SDK', 'VM control'],
  );
  assert.ok(site.byFile.has('unlisted.md'));
  assert.match(site.warnings.join('\n'), /missing\.md/);
});

test('builds the navigation from the folders without one', () => {
  const site = readSite(
    options(
      folder({
        'index.md': '# Home\n',
        'faq.md': '# FAQ\n',
        'about.md': '# About\n',
        'guide/index.md': '# Guide\n',
        'guide/b.md': '# Bravo\n',
        'guide/a.md': '# Alpha\n',
        'guide/deep/c.md': '# Charlie\n',
        'draft.md': '---\ndraft: true\n---\n# Draft\n',
      }),
    ),
  );
  assert.deepEqual(
    site.nav.map((group) => [group.label, outline(group.items)]),
    [
      [undefined, ['Home', 'About', 'FAQ']],
      ['Guide', ['Overview', 'Alpha', 'Bravo', ['Deep', ['Charlie']]]],
    ],
  );
  const deep = site.nav[1]?.items.at(-1);
  assert.equal(deep?.kind === 'section' && deep.collapsed, true);
  assert.ok(!site.byFile.has('draft.md'));
});

test('splits front matter and finds a description', () => {
  const {frontmatter, body} = splitFrontmatter(
    '---\ntitle: T\n---\n# T\n\nFirst **words** here.\n',
  );
  assert.equal(frontmatter.title, 'T');
  assert.equal(firstParagraph(body), 'First words here.');
});
