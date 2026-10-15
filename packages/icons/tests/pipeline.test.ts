import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {describe, expect, test} from 'vitest';

import {boiledPipelineConfig as pipelineConfig, plainPipelineConfig} from '../config.js';
import {flattenPath, parsePathData, serializeContours} from '../scripts/lib/path-data.js';
import {
  outputDecimals,
  processSvg,
  transformContours,
  unitsPerPixel,
} from '../scripts/lib/pipeline.js';
import {maximumDeviation, signedArea, simplifyContours} from '../scripts/lib/simplify.js';
import {parseSvg} from '../scripts/lib/svg.js';
import type {Contour, Point} from '../scripts/lib/types.js';

const packageDirectory = resolve(import.meta.dirname, '..');
const readSource = (name: string): Promise<string> =>
  readFile(resolve(packageDirectory, `sources/${name}.svg`), 'utf8');

describe('pipeline', () => {
  test('is deterministic', async () => {
    const source = await readSource('search');
    expect(processSvg(source, pipelineConfig).svg).toBe(processSvg(source, pipelineConfig).svg);
  });

  test('each stage can be disabled independently', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M1 1Q10 0 19 1V19H1Z"/></svg>';
    for (const [boiling, simplification] of [
      [true, false],
      [false, true],
    ] as const) {
      const config = {
        ...pipelineConfig,
        boiling: {...pipelineConfig.boiling, enabled: boiling},
        simplification: {...pipelineConfig.simplification, enabled: simplification},
      };
      expect(processSvg(source, config).artwork.d).toMatch(/^m[\d.\-hlvz ]+$/);
    }
    expect(processSvg(source, plainPipelineConfig).artwork.d).toBe('M1 1Q10 0 19 1V19H1Z');
  });

  test('keeps the source size and, plain, the source path', async () => {
    const source = await readSource('keyboard_arrow_down');
    expect(processSvg(source, plainPipelineConfig).svg).toBe(
      '<!-- Google Material Symbols, renamed and repackaged by Elanor. Apache-2.0; see LICENSE and NOTICE. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -960 960 960"><path d="M480-333 240-573l51-51 189 189 189-189 51 51-240 240Z"/></svg>\n',
    );
    expect(processSvg(source, pipelineConfig).svg).toContain(
      'Modified by Elanor from Google Material Symbols: sampled, noise-displaced, and simplified.',
    );
  });

  test('rejects sources without a square size', () => {
    expect(() =>
      parseSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M0 0"/></svg>',
      ),
    ).toThrow(/width and height/);
  });

  test('rounds to the same display precision for any viewBox size', () => {
    const at = (size: number) =>
      outputDecimals(
        {viewBox: {minX: 0, minY: 0, width: size, height: size}, d: '', size: 20},
        pipelineConfig,
      );
    expect(at(960)).toBe(1);
    expect(at(20)).toBe(3);
  });

  test.each(['search', 'home', 'settings', 'check', 'close', 'assistant', 'settings_suggest'])(
    '%s output stays within the simplification tolerance plus rounding',
    async (name) => {
      const artwork = parseSvg(await readSource(name));
      const unsimplified = transformContours(artwork, {
        ...pipelineConfig,
        simplification: {...pipelineConfig.simplification, enabled: false},
      })!;
      const output = contoursFromPathData(
        processSvg(await readSource(name), pipelineConfig).artwork.d,
      );
      const allowed =
        pipelineConfig.simplification.tolerance * unitsPerPixel(artwork) +
        Math.SQRT1_2 * 10 ** -outputDecimals(artwork, pipelineConfig);

      expect(output).toHaveLength(unsimplified.length);
      for (const [index, contour] of output.entries()) {
        expect(
          maximumDeviation(unsimplified[index]!.points, contour.points, true),
        ).toBeLessThanOrEqual(allowed + 1e-9);
      }
    },
  );
});

describe('path data', () => {
  test('parses absolute, relative, implicit, shorthand, and closed commands', () => {
    const [first, second] = parsePathData('M0 0 10 0v10h-10zm20 0q5 -5 10 0t10 0');
    expect(first!.closed).toBe(true);
    expect(first!.segments.map(({to}) => to)).toEqual([
      {x: 10, y: 0},
      {x: 10, y: 10},
      {x: 0, y: 10},
    ]);
    expect(second!.segments.at(-1)).toEqual({
      type: 'quadratic',
      from: {x: 30, y: 0},
      control: {x: 35, y: 5},
      to: {x: 40, y: 0},
    });
  });

  test('rejects unsupported commands', () => {
    expect(() => parsePathData('M0 0A5 5 0 0 1 10 10')).toThrow(/Unsupported/);
  });

  test('samples curves at about the requested step', () => {
    const [contour] = flattenPath('M0 0Q50 100 100 0', 1);
    for (const [index, point] of contour!.points.entries()) {
      if (index === 0) continue;
      const previous = contour!.points[index - 1]!;
      expect(Math.hypot(point.x - previous.x, point.y - previous.y)).toBeLessThanOrEqual(1.05);
    }
    expect(contour!.points.at(-1)).toEqual({x: 100, y: 0});
  });

  test('serialized output round-trips to the rounded points', () => {
    const contour: Contour = {
      closed: true,
      points: [
        {x: 0.04, y: -0.26},
        {x: 10.56, y: -0.26},
        {x: 10.56, y: 9.949},
        {x: -3.2, y: 4.44},
      ],
    };
    const d = serializeContours([contour, {...contour, closed: false}], 1);
    expect(d).toBe('m0-.3h10.6v10.2l-13.8-5.5zm0 0h10.6v10.2l-13.8-5.5');
    const [closed, open] = contoursFromPathData(d);
    const rounded = contour.points.map(({x, y}) => ({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    }));
    for (const result of [closed!, open!]) {
      for (const [index, point] of result.points.entries()) {
        expect(point.x).toBeCloseTo(rounded[index]!.x, 9);
        expect(point.y).toBeCloseTo(rounded[index]!.y, 9);
      }
    }
    expect(closed!.closed).toBe(true);
    expect(open!.closed).toBe(false);
  });
});

describe('bounded simplification', () => {
  test('keeps error within tolerance and preserves rings, closure, holes, and winding', () => {
    const outer = sampledSquare(0, 0, 10, false);
    const hole = sampledSquare(3, 3, 4, true);
    const simplified = simplifyContours([outer, hole], 0.05);

    expect(simplified).toHaveLength(2);
    for (const [index, contour] of simplified.entries()) {
      const original = [outer, hole][index]!;
      expect(contour.closed).toBe(true);
      expect(contour.points.length).toBeGreaterThanOrEqual(3);
      expect(Math.sign(signedArea(contour.points))).toBe(Math.sign(signedArea(original.points)));
      expect(maximumDeviation(original.points, contour.points, true)).toBeLessThanOrEqual(
        0.05 + 1e-12,
      );
    }
  });

  test('does not collapse tiny closed contours', () => {
    const tiny: Contour = {
      closed: true,
      points: [
        {x: 0, y: 0},
        {x: 0.001, y: 0},
        {x: 0, y: 0.001},
        {x: 0.0002, y: 0.0002},
      ],
    };
    expect(simplifyContours([tiny], 0.1)[0]).toEqual(tiny);
  });
});

function contoursFromPathData(d: string): Contour[] {
  return parsePathData(d).map(({segments, closed}) => ({
    closed,
    points: [segments[0]!.from, ...segments.map(({to}) => to)],
  }));
}

function sampledSquare(x: number, y: number, size: number, reverse: boolean): Contour {
  const corners: Point[] = [
    {x, y},
    {x: x + size, y},
    {x: x + size, y: y + size},
    {x, y: y + size},
  ];
  const points: Point[] = [];
  for (let side = 0; side < corners.length; side += 1) {
    const start = corners[side]!;
    const end = corners[(side + 1) % corners.length]!;
    for (let step = 0; step < 20; step += 1) {
      points.push({
        x: start.x + ((end.x - start.x) * step) / 20,
        y: start.y + ((end.y - start.y) * step) / 20,
      });
    }
  }
  return {closed: true, points: reverse ? points.reverse() : points};
}
