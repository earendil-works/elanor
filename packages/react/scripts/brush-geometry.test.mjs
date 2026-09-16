import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readBrush, clipPolygon, envelope, roundedBackbone} from './brush-geometry.mjs';

const assets = new URL('../src/brush-border/generated/', import.meta.url);

test('normalised Noir has an approximately constant width, including both ends', async () => {
  const {polygons} = readBrush(await readFile(new URL('../brushes/noir.svg', import.meta.url), 'utf8'));
  for (let x = 0.001; x < 100; x += 0.5) {
    const [top, bottom] = envelope(polygons[0], x);
    assert.ok(bottom - top > 8 && bottom - top < 12, `width at ${x}: ${bottom - top}`);
    assert.ok(Math.abs((bottom + top) / 2 - 6) < 1);
  }
  const start = envelope(polygons[0], 0.001), end = envelope(polygons[0], 99.999);
  for (let i = 0; i < 2; i++) assert.ok(Math.abs(start[i] - end[i]) < 0.001);
});

test('backbone closes with a continuous tangent and normal through rounded corners', () => {
  for (const dimensions of [[64, 48, 3], [48, 16, 8], [16, 16, 8]]) {
    const path = roundedBackbone(...dimensions, 1.2);
    const first = path.at(0), last = path.at(path.length - 1e-7);
    first.forEach((value, i) => assert.ok(Math.abs(value - last[i]) < 1e-6));
    for (let s = 0; s < path.length; s += 0.1) {
      const a = path.at(s), b = path.at(s + 0.001);
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.00101);
      assert.ok(Math.abs(Math.hypot(a[2], a[3]) - 1) < 1e-9);
    }
  }
});

test('slice clipping uses exact shared planes', () => {
  const polygon = [[0, 0], [12, 0.25], [12, 2.2], [0, 2]];
  const left = clipPolygon(polygon, [0, 0, 6, 6]);
  const right = clipPolygon(polygon, [6, 0, 12, 6]);
  const seam = (points) => points.filter(([x]) => x === 6).map(([, y]) => y).sort();
  assert.deepEqual(seam(left), seam(right));
});

test('unsupported source effects and open strokes fail loudly', () => {
  assert.throws(() => readBrush('<svg viewBox="0 0 100 12"><path d="M0 0L100 0"/></svg>'), /closed/);
  assert.throws(() => readBrush('<svg viewBox="0 0 100 12"><path transform="scale(2)" d="M0 0L100 0Z"/></svg>'), /baked/);
});

test('all six variants differ and each has the complete asset set', async () => {
  const hashes = new Set();
  for (let variant = 0; variant < 6; variant++) {
    const hash = createHash('sha256');
    for (const preset of ['small', 'round']) {
      for (let slice = 0; slice < 8; slice++) {
        const svg = await readFile(new URL(`${preset}-${variant}-${slice}.svg`, assets), 'utf8');
        assert.ok(!svg.includes('NaN'));
        hash.update(svg);
      }
    }
    for (const file of [`circle-${variant}`, `line-${variant}`, `line-${variant}-vertical`]) {
      assert.match(await readFile(new URL(`${file}.svg`, assets), 'utf8'), /preserveAspectRatio="none"/);
    }
    hashes.add(hash.digest('hex'));
  }
  assert.equal(hashes.size, 6);
});

test('regeneration is deterministic and checked-in artifacts are current', async () => {
  async function digest() {
    const hash = createHash('sha256');
    for (const name of (await readdir(assets)).sort()) hash.update(name).update(await readFile(new URL(name, assets)));
    return hash.digest('hex');
  }
  const before = await digest();
  execFileSync(process.execPath, [new URL('./generate-brushes.mjs', import.meta.url).pathname, '--check']);
  assert.equal(await digest(), before, 'Run pnpm brushes:generate and commit the updated bank.');
});
