import {readFile, writeFile} from 'node:fs/promises';
import {readBrush, clipPolygon, envelope, svgDocument} from './brush-geometry.mjs';

// Import once, retain the source for provenance. Neither generation nor runtime
// depends on svg-brush or on a sibling checkout.
const directory = new URL('../brushes/', import.meta.url);
const {polygons} = readBrush(await readFile(new URL('noir-original.svg', directory), 'utf8'));
const outer = polygons.reduce((a, b) => a.length > b.length ? a : b);
const left = 10, right = 90;
const samples = Array.from({length: 801}, (_, i) => {
  const x = left + i / 10;
  const values = Array.from({length: 21}, (_, j) => envelope(outer, x + (j - 10) / 10));
  return [0, 1].map((axis) => values.reduce((sum, p) => sum + p[axis], 0) / values.length);
});
const smoothstep = (x) => x * x * (3 - 2 * x);
const normalized = polygons.map((polygon) => clipPolygon(polygon, [left, -100, right, 100])).filter((p) => p.length > 2).map((polygon, index) => polygon.map(([x, y]) => {
  const t = Math.min(800, Math.max(0, (x - left) * 10));
  const a = samples[Math.floor(t)], b = samples[Math.min(800, Math.ceil(t))];
  const mix = t % 1;
  const low = a[0] * (1 - mix) + b[0] * mix, high = a[1] * (1 - mix) + b[1] * mix;
  let offset = (y - (low + high) / 2) * 10 / (high - low);
  // Ends are cut in hole-free regions. A short collar makes their cross-sections
  // exactly match (including zero slope), so the ribbon can close without a cap.
  const collar = smoothstep(Math.min(1, Math.min(x - left, right - x) / 2));
  if (index === 0) offset = Math.sign(offset) * 5 * (1 - collar) + offset * collar;
  return [(x - left) * 100 / (right - left), offset + 6];
}));
await writeFile(new URL('noir.svg', directory), svgDocument(normalized, [0, 0, 100, 12]));
console.log('Normalized Noir → brushes/noir.svg (uniform envelope, matched ends).');
