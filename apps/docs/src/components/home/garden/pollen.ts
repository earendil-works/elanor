import {PAD} from './geometry.ts';

const COUNT = 46;
const STOPS = [0, 0.06, 0.12, 0.2, 0.3, 0.42, 0.55, 0.7, 0.85, 1];

const fract = (x: number) => x - Math.floor(x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const seeds = Array.from({length: COUNT}, (_, index) => ({
  random: fract(Math.sin(index * 127.1 + 311.7) * 43758.5453),
  other: fract(Math.sin(index * 269.5 + 183.3) * 23147.735),
}));

export interface PollenFrame {
  /** Canvas side length in device pixels. */
  readonly size: number;
  /** Seconds; a fixed value draws a still frame. */
  readonly time: number;
  /** 0 in light mode, 1 in dark mode; values between blend. */
  readonly night: number;
  /** 0–1; a brief brightening after the color scheme changes. */
  readonly ignition: number;
}

/** Seeded pollen drifting out from the stamens. Returns a function that draws one frame on `canvas`. */
export function createPollen(canvas: HTMLCanvasElement): (frame: PollenFrame) => void {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable.');

  return ({size, time, night, ignition}) => {
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    context.clearRect(0, 0, size, size);

    seeds.forEach(({random, other}, index) => {
      const phase = fract(time / (8 + random * 9) + other);
      const life = smoothstep(0, 0.14, phase) * (1 - smoothstep(0.78, 1, phase));
      if (life < 0.005) return;

      const angle = index * 2.39996323 + time * (random - 0.5) * 0.12;
      const radius = 0.035 + Math.pow(phase, 1.1) * (0.38 + random * 0.58);
      const drift = Math.sin(time * 0.55 + index) * 0.012 * phase;
      const x = (0.04 + Math.cos(angle) * radius + drift) / PAD;
      const y = (-0.17 + Math.sin(angle) * radius * 0.78 + phase * 0.32) / PAD;
      const px = (x * 0.5 + 0.5) * size;
      const py = (0.5 - y * 0.5) * size;
      const r = (((0.012 + random * 0.009) * (1 + night * 1.3)) / PAD) * 0.5 * size;

      const gradient = context.createRadialGradient(px, py, 0, px, py, r);
      for (const stop of STOPS) {
        const s2 = stop * stop;
        const core = Math.exp(-s2 * (80 + night * 50));
        const halo = Math.exp(-s2 * 4) * (1 - smoothstep(0.6, 1, stop));
        const corona = Math.exp(-s2 * 2.2) * (1 - smoothstep(0.45, 1, stop));
        const alpha = Math.min(
          0.995,
          life *
            (core * (0.62 + night * 0.36) + halo * (0.075 + night * 0.48) + corona * night * 0.16) *
            (1 + ignition * 0.35),
        );
        const hot = core * night * 0.82;
        const red = mix(mix(0.57, 1, night), 1, hot);
        const green = mix(mix(0.36, 0.8 + random * 0.12, night), 0.99, hot);
        const blue = mix(mix(0.1, 0.48 + random * 0.26, night), 0.9, hot);
        gradient.addColorStop(
          stop,
          `rgb(${Math.round(red * 255)} ${Math.round(green * 255)} ${Math.round(blue * 255)} / ${alpha.toFixed(4)})`,
        );
      }
      context.fillStyle = gradient;
      context.fillRect(px - r, py - r, r * 2, r * 2);
    });
  };
}
