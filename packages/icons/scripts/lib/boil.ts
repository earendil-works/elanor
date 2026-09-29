import type {PipelineConfig} from "../../config.js";
import type {Contour, ViewBox} from "./types.js";

export function boilContours(
  contours: Contour[],
  viewBox: ViewBox,
  config: PipelineConfig,
): Contour[] {
  const settings = config.boiling;
  if (!settings.enabled || settings.displacement === 0) return contours;
  if (settings.octaves < 1 || !Number.isInteger(settings.octaves)) {
    throw new Error("Boiling octaves must be a positive integer");
  }

  const noiseX = new PerlinNoise(settings.seed);
  const noiseY = new PerlinNoise(settings.seed + 1000);
  const radius = settings.displacement / 2;

  return contours.map((contour) => ({
    ...contour,
    points: contour.points.map(({x, y}) => {
      const displayX = ((x - viewBox.minX) / viewBox.width) * config.targetSize;
      const displayY = ((y - viewBox.minY) / viewBox.height) * config.targetSize;
      return {
        x:
          x +
          radius *
            (viewBox.width / config.targetSize) *
            fractal(noiseX, displayX, displayY, settings.noiseFrequency, settings.octaves),
        y:
          y +
          radius *
            (viewBox.height / config.targetSize) *
            fractal(noiseY, displayX, displayY, settings.noiseFrequency, settings.octaves),
      };
    }),
  }));
}

function fractal(
  noise: PerlinNoise,
  x: number,
  y: number,
  frequency: number,
  octaves: number,
): number {
  let total = 0;
  let normalization = 0;
  let amplitude = 1;
  let octaveFrequency = frequency;
  for (let octave = 0; octave < octaves; octave += 1) {
    total += noise.sample(x * octaveFrequency, y * octaveFrequency) * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    octaveFrequency *= 2;
  }
  return clamp((total / normalization) * 1.7, -1, 1);
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const gradients: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [Math.SQRT1_2, Math.SQRT1_2],
  [-Math.SQRT1_2, Math.SQRT1_2],
  [Math.SQRT1_2, -Math.SQRT1_2],
  [-Math.SQRT1_2, -Math.SQRT1_2],
];

class PerlinNoise {
  readonly #permutation: number[];

  constructor(seed: number) {
    const random = seededRandom(seed);
    const values = Array.from({length: 256}, (_, index) => index);
    for (let index = values.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [values[index], values[target]] = [values[target]!, values[index]!];
    }
    this.#permutation = values.concat(values);
  }

  sample(x: number, y: number): number {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    const localX = x - floorX;
    const localY = y - floorY;
    const indexX = floorX & 255;
    const indexY = floorY & 255;
    const permutation = this.#permutation;
    const aa = permutation[permutation[indexX]! + indexY]!;
    const ab = permutation[permutation[indexX]! + indexY + 1]!;
    const ba = permutation[permutation[indexX + 1]! + indexY]!;
    const bb = permutation[permutation[indexX + 1]! + indexY + 1]!;
    const u = fade(localX);
    const v = fade(localY);
    return lerp(
      lerp(dot(aa, localX, localY), dot(ba, localX - 1, localY), u),
      lerp(dot(ab, localX, localY - 1), dot(bb, localX - 1, localY - 1), u),
      v,
    );
  }
}

function dot(hash: number, x: number, y: number): number {
  const [gradientX, gradientY] = gradients[hash & 7]!;
  return gradientX * x + gradientY * y;
}

function fade(value: number): number {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function lerp(start: number, end: number, amount: number): number {
  return start + amount * (end - start);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
