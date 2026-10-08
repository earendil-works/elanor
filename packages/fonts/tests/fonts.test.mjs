import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const families = [
  {
    entry: 'earendil',
    family: 'Earendil',
    format: 'woff2',
    signature: 'wOF2',
    faces: [
      ['Earendil-Regular.woff2', 400, 'normal'],
      ['Earendil-Italic.woff2', 400, 'italic'],
      ['Earendil-Bold.woff2', 700, 'normal'],
      ['Earendil-BoldItalic.woff2', 700, 'italic'],
    ],
  },
  {
    entry: 'commit-mono',
    family: 'Commit Mono',
    format: 'opentype',
    signature: 'OTTO',
    faces: [
      ['CommitMono-300-Regular.otf', 300, 'normal'],
      ['CommitMono-400-Regular.otf', 400, 'normal'],
      ['CommitMono-700-Regular.otf', 700, 'normal'],
    ],
  },
];

for (const {entry, family, format, signature, faces} of families) {
  test(`${entry} registers only the expected font faces`, async () => {
    const css = await readFile(new URL(`${entry}.css`, root), 'utf8');
    const blocks = [...css.matchAll(/@font-face\s*\{([^{}]+)\}/g)];
    assert.equal(css.replace(/@font-face\s*\{[^{}]+\}/g, '').trim(), '');
    assert.equal(blocks.length, faces.length);

    for (const [index, [file, weight, style]] of faces.entries()) {
      const declarations = blocks[index][1]
        .trim()
        .split(';')
        .filter((line) => line.trim());
      const descriptors = Object.fromEntries(
        declarations.map((line) => {
          const separator = line.indexOf(':');
          return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
        }),
      );
      assert.equal(declarations.length, 5, 'No duplicate or extra descriptors');
      assert.deepEqual(descriptors, {
        'font-family': `'${family}'`,
        src: `url('./files/${file}') format('${format}')`,
        'font-weight': String(weight),
        'font-style': style,
        'font-display': 'swap',
      });

      const asset = new URL(`files/${file}`, root);
      assert.equal(import.meta.resolve(`${manifest.name}/files/${file}`), asset.href);
      assert.equal((await readFile(asset)).toString('ascii', 0, 4), signature);
    }
  });

  test(`${entry} ships its CSS and complete font license`, async () => {
    assert.equal(manifest.exports[`./${entry}.css`], `./${entry}.css`);
    assert.equal(
      import.meta.resolve(`${manifest.name}/${entry}.css`),
      new URL(`${entry}.css`, root).href,
    );
    const license = new URL(`licenses/${entry}.txt`, root);
    assert.equal(import.meta.resolve(`${manifest.name}/licenses/${entry}.txt`), license.href);
    const text = await readFile(license, 'utf8');
    for (const section of [
      'Copyright',
      'SIL Open Font License',
      'PERMISSION & CONDITIONS',
      'TERMINATION',
      'DISCLAIMER',
    ]) {
      assert(text.includes(section), `${entry}: missing ${section}`);
    }
    assert(text.trimEnd().endsWith('SOFTWARE.'));
  });
}

test('package preserves CSS side effects and covers every font asset', async () => {
  assert.deepEqual(manifest.sideEffects, ['**/*.css']);
  assert.equal(manifest.license, 'OFL-1.1');
  assert.deepEqual(manifest.files, ['*.css', 'files', 'licenses', 'README.md']);
  assert.deepEqual(
    (await readdir(new URL('files/', root))).sort(),
    families.flatMap(({faces}) => faces.map(([file]) => file)).sort(),
  );
});
