import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import test from 'node:test';

import {firstParagraph, readSite, splitFrontmatter} from '../runtime/content/site.ts';

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

test('groups pages named by their front matter, ordered by their lowest order', () => {
  const site = readSite(
    options(
      folder({
        'index.md': '# Home\n',
        'cli.md': '---\nsidebar:\n  group: Using it\n  order: 2\n---\n# CLI\n',
        'workloads.md': '---\nsidebar:\n  group: Using it\n  order: 1\n---\n# Workloads\n',
        'sdk.md': '---\nsidebar:\n  group: SDK\n  order: 10\n  label: Overview\n---\n# SDK\n',
        'sdk-vm.md': '---\nsidebar:\n  group: SDK\n  order: 11\n---\n# VM control\n',
        'limits.md': '# Limitations\n',
      }),
    ),
  );
  assert.deepEqual(
    site.nav.map((group) => [group.label, group.links.map((link) => link.label)]),
    [
      [undefined, ['Home', 'Limitations']],
      ['Using it', ['Workloads', 'CLI']],
      ['SDK', ['Overview', 'VM control']],
    ],
  );
});

test('builds groups from folders, led by their index pages', () => {
  const site = readSite(
    options(
      folder({
        'index.md': '# Home\n',
        'faq.md': '# FAQ\n',
        'about.md': '---\nsidebar:\n  order: 1\n---\n# About\n',
        'guide/index.md': '# Guide\n',
        'guide/b.md': '# Bravo\n',
        'guide/a.md': '# Alpha\n',
        'guide/deep/c.md': '# Charlie\n',
        'hidden.md': '---\nsidebar:\n  hidden: true\n---\n# Hidden\n',
        'draft.md': '---\ndraft: true\n---\n# Draft\n',
      }),
    ),
  );
  assert.deepEqual(
    site.nav.map((group) => [group.label, group.links.map((link) => link.label)]),
    [
      [undefined, ['Home', 'About', 'FAQ']],
      ['Guide', ['Overview', 'Alpha', 'Bravo', 'Charlie']],
    ],
  );
  assert.ok(site.byFile.has('hidden.md'));
  assert.ok(!site.byFile.has('draft.md'));
  assert.deepEqual(
    site.sequence.map((page) => page.title),
    ['Home', 'About', 'FAQ', 'Guide', 'Alpha', 'Bravo', 'Charlie'],
  );
});

test('splits front matter and finds a description', () => {
  const {frontmatter, body} = splitFrontmatter(
    '---\ntitle: T\n---\n# T\n\nFirst **words** here.\n',
  );
  assert.equal(frontmatter.title, 'T');
  assert.equal(firstParagraph(body), 'First words here.');
});
