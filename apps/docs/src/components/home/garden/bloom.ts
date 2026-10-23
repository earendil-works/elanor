import {currentColorScheme} from '../../../scripts/color-scheme.ts';

// A one-time watercolor bleed: the painting soaks outward from the stamens with a
// noisy wet edge. Petals are laid in first; the green leaves follow as a second wash.
// By day a pale pigment runs ahead of the color and denser pigment pools along the
// front; by night the front glows warmly. It ends on the original <img> and removes itself.

/** Resolution of the wetness field and masks; upscaled smoothly when drawn. */
const GRID = 200;
/** The stamens, where the paint first touches, as fractions of the painting. */
const CENTER = [0.52, 0.585] as const;
const BINS = 180;
const LEAF_DELAY = 0.24;
const SOFT = 0.075;
/** Progress at which the atmosphere (halo, center light, pollen) may fade in. */
const SETTLING = 0.72;

function hash(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number): number {
  return (
    noise(x, y) * 0.5 +
    noise(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.27 +
    noise(x * 4.3 + 9.1, y * 4.3 + 3.7) * 0.15 +
    noise(x * 9.7 + 2.4, y * 9.7 + 7.9) * 0.08
  );
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function context2d(canvas: HTMLCanvasElement, options?: CanvasRenderingContext2DSettings) {
  const context = canvas.getContext('2d', options);
  if (!context) throw new Error('Canvas 2D is unavailable.');
  return context;
}

function squareCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Per-cell "wetness time": 0 at the stamens, about 1 at every petal tip, leaves later.
 * The range spans first touch to last tip, so the slow creep at the end is never dead time.
 */
function wetness(reference: HTMLImageElement) {
  const context = context2d(squareCanvas(GRID), {willReadFrequently: true});
  context.drawImage(reference, 0, 0, GRID, GRID);
  const pixels = context.getImageData(0, 0, GRID, GRID).data;
  const painted = (i: number) => (pixels[i * 4 + 3] ?? 0) >= 12;

  // How far the paint reaches in each direction from the stamens.
  const cx = CENTER[0] * GRID;
  const cy = CENTER[1] * GRID;
  const bin = (x: number, y: number) =>
    Math.floor(((Math.atan2(y - cy, x - cx) / (Math.PI * 2) + 1) % 1) * BINS) % BINS;
  const reach = new Float32Array(BINS);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!painted(y * GRID + x)) continue;
      const b = bin(x, y);
      reach[b] = Math.max(reach[b] ?? 0, Math.hypot(x - cx, y - cy));
    }
  }
  // Soften the silhouette so the front stays organic rather than star-shaped.
  const smooth = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    let sum = 0;
    let weight = 0;
    for (let k = -6; k <= 6; k++) {
      const w = 7 - Math.abs(k);
      sum += (reach[(b + k + BINS) % BINS] ?? 0) * w;
      weight += w;
    }
    smooth[b] = Math.max(GRID * 0.12, sum / weight);
  }

  // Leafiness: green-dominant pigment, blurred so the two washes meet softly.
  const leaf = new Float32Array(GRID * GRID);
  for (let i = 0; i < leaf.length; i++) {
    const red = pixels[i * 4] ?? 0;
    const green = pixels[i * 4 + 1] ?? 0;
    leaf[i] = painted(i) ? clamp01((green - red * 0.92) / 22) : 0;
  }
  const leafy = new Float32Array(GRID * GRID);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const sx = x + dx;
          const sy = y + dy;
          if (sx < 0 || sy < 0 || sx >= GRID || sy >= GRID) continue;
          sum += leaf[sy * GRID + sx] ?? 0;
          count++;
        }
      }
      leafy[y * GRID + x] = sum / count;
    }
  }

  const values = new Float32Array(GRID * GRID);
  let min = Infinity;
  let max = -Infinity;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = y * GRID + x;
      const distance = Math.hypot(x - cx, y - cy) / (smooth[bin(x, y)] ?? 1);
      const u = x / GRID;
      const v = y / GRID;
      const value =
        distance * 0.9 +
        (fbm(u * 5, v * 5) - 0.5) * 0.42 +
        (noise(u * 38, v * 38) - 0.5) * 0.05 +
        (leafy[i] ?? 0) * LEAF_DELAY;
      values[i] = value;
      if (painted(i)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }
  return {values, from: min - 0.02, to: max + SOFT + 0.005};
}

/** The painting recolored by `paint`, clipped back to its own alpha. */
function tinted(
  reference: HTMLImageElement,
  size: number,
  paint: (context: CanvasRenderingContext2D) => void,
): HTMLCanvasElement {
  const canvas = squareCanvas(size);
  const context = context2d(canvas);
  context.drawImage(reference, 0, 0, size, size);
  paint(context);
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(reference, 0, 0, size, size);
  return canvas;
}

function fill(
  context: CanvasRenderingContext2D,
  operation: GlobalCompositeOperation,
  alpha: number,
  color: string,
) {
  context.globalCompositeOperation = operation;
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

function createMask() {
  const context = context2d(squareCanvas(GRID));
  return {canvas: context.canvas, context, image: context.createImageData(GRID, GRID)};
}

interface BloomOptions {
  /** Called once when the bleed nears the tips, to fade in the atmosphere. */
  readonly onSettling?: () => void;
}

/**
 * Paints the flower in as a watercolor bleed on a canvas over `reference`, which must be
 * decoded and hidden meanwhile. Resolves when the canvas has handed back to the image.
 */
export function paintBloom(
  reference: HTMLImageElement,
  duration: number,
  {onSettling}: BloomOptions = {},
): Promise<void> {
  return new Promise((resolve) => {
    const {values, from, to} = wetness(reference);
    const size = Math.max(
      64,
      Math.min(
        reference.naturalWidth,
        Math.round(reference.clientWidth * Math.min(window.devicePixelRatio || 1, 2)),
      ),
    );
    const canvas = squareCanvas(size);
    canvas.className = 'flower-bleed';
    canvas.setAttribute('aria-hidden', 'true');
    (reference.closest('picture') ?? reference).after(canvas);
    const out = context2d(canvas);
    const layer = context2d(squareCanvas(size));

    // Palettes are built lazily, so switching the color scheme mid-bloom switches treatment.
    let washPalette: HTMLCanvasElement | undefined;
    let poolPalette: HTMLCanvasElement | undefined;
    let glowPalette: HTMLCanvasElement | undefined;
    const wash = () =>
      (washPalette ??= tinted(reference, size, (context) => {
        fill(context, 'saturation', 0.55, '#808080');
        fill(context, 'source-atop', 0.5, '#ebe7e4');
      }));
    const pool = () =>
      (poolPalette ??= tinted(reference, size, (context) => {
        fill(context, 'multiply', 0.55, '#c4844a');
      }));
    const glow = () =>
      (glowPalette ??= tinted(reference, size, (context) => {
        fill(context, 'source-atop', 0.55, '#ffd28a');
      }));

    const washMask = createMask();
    const colorMask = createMask();
    const edgeMask = createMask();
    const masks = [washMask, colorMask, edgeMask];

    const draw = (
      source: CanvasImageSource,
      mask: {canvas: HTMLCanvasElement},
      alpha = 1,
      operation: GlobalCompositeOperation = 'source-over',
    ) => {
      layer.globalCompositeOperation = 'copy';
      layer.drawImage(source, 0, 0, size, size);
      layer.globalCompositeOperation = 'destination-in';
      layer.imageSmoothingQuality = 'high';
      layer.drawImage(mask.canvas, 0, 0, size, size);
      out.globalAlpha = alpha;
      out.globalCompositeOperation = operation;
      out.drawImage(layer.canvas, 0, 0);
      out.globalCompositeOperation = 'source-over';
    };

    const start = performance.now();
    let settling = false;

    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // A fast initial soak, then a slow creep toward the tips and leaves.
      const t = from + (to - from) * (1 - Math.pow(1 - progress, 2.4));
      const dark = currentColorScheme() === 'dark';
      for (let i = 0; i < values.length; i++) {
        const value = values[i] ?? 0;
        const alpha = i * 4 + 3;
        const color = clamp01((t - value) / SOFT);
        washMask.image.data[alpha] = clamp01((t + 0.17 - value) / 0.14) * 255;
        colorMask.image.data[alpha] = color * 255;
        edgeMask.image.data[alpha] = color * (1 - color) * 4 * 255;
      }
      for (const mask of masks) mask.context.putImageData(mask.image, 0, 0);

      out.globalAlpha = 1;
      out.clearRect(0, 0, size, size);
      // At night any translucent wash reads as smoke on the dark ground.
      if (!dark) draw(wash(), washMask, 0.9);
      draw(reference, colorMask);
      if (dark) draw(glow(), edgeMask, 0.5, 'lighter');
      else draw(pool(), edgeMask, 0.6);

      if (!settling && progress >= SETTLING) {
        settling = true;
        onSettling?.();
      }
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
