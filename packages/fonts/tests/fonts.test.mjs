import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));

const pieces = ['latin', 'latin-ext', 'vietnamese', 'greek', 'cyrillic'];
const split = (name, styles = ['', '-Italic']) =>
  styles.flatMap((style) => pieces.map((piece) => `${name}${style}-${piece}.woff2`));

const latoWeights = {
  Thin: 100,
  ExtraLight: 200,
  Light: 300,
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  ExtraBold: 800,
  Black: 900,
};

// Each entry: its families with their weight descriptor, and the files its faces use. A family can consist of
// several files, each limited to its own characters by unicode-range; `local` families come from the device.
const families = [
  {
    entry: 'mallos-serif',
    families: {
      'Mallos Serif': {weight: '400 700'},
      'Mallos Serif Fallback': {local: true},
    },
    files: [
      'MallosSerif.woff2',
      'MallosSerif-Italic.woff2',
      ...split('MallosSerifExtended'),
      'MallosSerifArabic.woff2',
    ],
    licenses: ['mallos-serif-extended', 'mallos-arabic'],
  },
  {
    // One file per Lato weight; the Arabic file is declared once per weight, so it joins each of them.
    entry: 'mallos-sans',
    families: {'Mallos Sans': {weights: Object.values(latoWeights).map(String)}},
    files: [
      ...Object.keys(latoWeights).flatMap((name) => split(`MallosSans-${name}`)),
      'MallosSansArabic.woff2',
    ],
  },
  {
    entry: 'mallos-mono',
    families: {'Mallos Mono': {weight: '200 700'}},
    files: split('MallosMono'),
  },
  {
    entry: 'departure-mono',
    families: {DepartureMono: {}},
    files: ['DepartureMono-Regular.woff2'],
  },
];

const allowed = new Set([
  'font-family',
  'src',
  'font-weight',
  'font-style',
  'font-display',
  'unicode-range',
  'size-adjust',
  'ascent-override',
  'descent-override',
  'line-gap-override',
]);

/** The @font-face rules of a stylesheet as descriptor maps; nothing else may be in it but comments. */
async function faces(entry) {
  const css = (await readFile(new URL(`${entry}.css`, root), 'utf8')).replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  assert.equal(css.replace(/@font-face\s*\{[^{}]+\}/g, '').trim(), '');
  return [...css.matchAll(/@font-face\s*\{([^{}]+)\}/g)].map(([, body]) => {
    const declarations = body
      .trim()
      .split(';')
      .filter((line) => line.trim());
    const descriptors = Object.fromEntries(
      declarations.map((line) => {
        const separator = line.indexOf(':');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
    );
    assert.equal(Object.keys(descriptors).length, declarations.length, 'No duplicate descriptors');
    for (const key of Object.keys(descriptors))
      assert(allowed.has(key), `unexpected descriptor ${key}`);
    return descriptors;
  });
}

/** Code points of a unicode-range value. */
function codePoints(range) {
  const out = new Set();
  for (const part of range.split(',')) {
    const [low, high = low] = part.trim().slice(2).split('-');
    for (let c = parseInt(low, 16); c <= parseInt(high, 16); c++) out.add(c);
  }
  return out;
}

for (const {entry, families: names, files, licenses = []} of families) {
  test(`${entry} registers its families from its files`, async () => {
    const rules = await faces(entry);
    const used = new Set();
    const ranges = new Map();
    const pieceWeights = new Map();
    for (const rule of rules) {
      const family = rule['font-family'].replaceAll("'", '');
      const spec = names[family];
      assert(spec, `${entry}: unexpected family ${family}`);
      assert.match(rule['font-style'], /^(normal|italic)$/);
      if (spec.local) {
        // A device font: no download, so no font-display; sized to the web font it stands in for.
        assert.match(rule.src, /^local\('[^']+'\)(, local\('[^']+'\))*$/);
        assert.match(rule['font-weight'], /^\d+$/);
        for (const key of [
          'size-adjust',
          'ascent-override',
          'descent-override',
          'line-gap-override',
        ])
          assert.match(rule[key] ?? '', /^\d+(\.\d+)?%$/, `${family}: ${key}`);
        continue;
      }
      const file = /^url\('\.\/files\/([^']+)'\) format\('woff2'\)$/.exec(rule.src)?.[1];
      assert(file, `${entry}: unexpected src ${rule.src}`);
      assert.equal(rule['font-display'], 'swap');
      if (spec.weight) assert.equal(rule['font-weight'], spec.weight);
      if (spec.weights) assert(spec.weights.includes(rule['font-weight']), rule['font-weight']);
      used.add(file);
      const asset = new URL(`files/${file}`, root);
      assert.equal(import.meta.resolve(`${manifest.name}/files/${file}`), asset.href);
      assert.equal((await readFile(asset)).toString('ascii', 0, 4), 'wOF2');
      // Within a family, weight and style, every character comes from one file only.
      if (rule['unicode-range']) {
        const key = `${family} ${rule['font-weight']} ${rule['font-style']}`;
        const seen = ranges.get(key) ?? new Set();
        for (const c of codePoints(rule['unicode-range'])) {
          assert(!seen.has(c), `${key}: U+${c.toString(16)} in two files`);
          seen.add(c);
        }
        ranges.set(key, seen);
        // Browsers combine faces by unicode-range only when their descriptors are identical, so every piece of a
        // family and style is declared for the same weights.
        const piece = `${family} ${rule['font-style']}`;
        const byRange = pieceWeights.get(piece) ?? new Map();
        byRange.set(rule['unicode-range'], [
          ...(byRange.get(rule['unicode-range']) ?? []),
          rule['font-weight'],
        ]);
        pieceWeights.set(piece, byRange);
      }
    }
    assert.deepEqual([...used].sort(), [...files].sort());
    for (const [piece, byRange] of pieceWeights) {
      const [first, ...rest] = [...byRange.values()].map((weights) => weights.toSorted().join());
      for (const weights of rest) assert.equal(weights, first, `${piece}: weights differ by piece`);
    }
  });

  test(`${entry} ships its CSS and complete font licenses`, async () => {
    assert.equal(manifest.exports[`./${entry}.css`], `./${entry}.css`);
    assert.equal(
      import.meta.resolve(`${manifest.name}/${entry}.css`),
      new URL(`${entry}.css`, root).href,
    );
    for (const name of [entry, ...licenses]) {
      const license = new URL(`licenses/${name}.txt`, root);
      assert.equal(import.meta.resolve(`${manifest.name}/licenses/${name}.txt`), license.href);
      const text = await readFile(license, 'utf8');
      for (const section of [
        'Copyright',
        'SIL Open Font License',
        'PERMISSION & CONDITIONS',
        'TERMINATION',
        'DISCLAIMER',
      ]) {
        assert(text.includes(section), `${name}: missing ${section}`);
      }
      assert(text.trimEnd().endsWith('SOFTWARE.'));
    }
  });
}

test('desktop downloads are OpenType files', async () => {
  for (const file of families.flatMap(({downloads = []}) => downloads)) {
    const asset = new URL(`files/${file}`, root);
    assert.equal(import.meta.resolve(`${manifest.name}/files/${file}`), asset.href);
    assert.equal((await readFile(asset)).toString('ascii', 0, 4), 'OTTO');
  }
});

test('package preserves CSS side effects and covers every font asset', async () => {
  assert.deepEqual(manifest.sideEffects, ['**/*.css']);
  assert.equal(manifest.license, 'OFL-1.1');
  assert.deepEqual(manifest.files, ['*.css', 'files', 'licenses', 'README.md']);
  assert.deepEqual(
    (await readdir(new URL('files/', root))).sort(),
    families.flatMap(({files, downloads = []}) => [...files, ...downloads]).sort(),
  );
});
