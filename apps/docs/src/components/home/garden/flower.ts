import {COLOR_SCHEME_EVENT, currentColorScheme} from '../../../scripts/color-scheme.ts';
import {petalAt} from './geometry.ts';
import {createPollen} from './pollen.ts';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
/** Pollen drifts slowly; ~30 fps is indistinguishable and halves the work. */
const FRAME_INTERVAL = 32;
const IGNITION = 1800;

interface FlowerElements {
  readonly garden: HTMLElement;
  readonly art: HTMLElement;
  readonly reference: HTMLImageElement;
  readonly canvas: HTMLCanvasElement;
  /** Called with the petal index under the pointer, or -1. */
  readonly onHover: (petal: number) => void;
  /** Called with the clicked petal index. */
  readonly onSelect: (petal: number) => void;
}

/** Reads the painting's alpha so petals respond only where there is paint. */
function readAlpha(reference: HTMLImageElement): ImageData {
  const source = document.createElement('canvas');
  source.width = reference.naturalWidth;
  source.height = reference.naturalHeight;
  const context = source.getContext('2d', {willReadFrequently: true});
  if (!context) throw new Error('Canvas 2D is unavailable.');
  context.drawImage(reference, 0, 0);
  return context.getImageData(0, 0, source.width, source.height);
}

/**
 * Makes the petals clickable and starts the pollen once the painting has decoded.
 * Pollen pauses off-screen, in background tabs, and after the page is hidden.
 */
export async function bringFlowerToLife({
  garden,
  art,
  reference,
  canvas,
  onHover,
  onSelect,
}: FlowerElements): Promise<void> {
  await reference.decode();
  const pixels = readAlpha(reference);
  const drawPollen = createPollen(canvas);

  let active = -1;
  let visible = true;
  let stopped = false;
  let failed = false;
  let frame = 0;
  let lastTime = performance.now();
  let night = currentColorScheme() === 'dark' ? 1 : 0;
  let schemeChangedAt = -IGNITION;
  let size = 1;

  const pick = (x: number, y: number) => {
    const rect = reference.getBoundingClientRect();
    const u = (x - rect.left) / rect.width;
    const v = (y - rect.top) / rect.height;
    if (u < 0 || v < 0 || u >= 1 || v >= 1) return -1;
    const offset =
      (Math.floor(v * pixels.height) * pixels.width + Math.floor(u * pixels.width)) * 4;
    return petalAt(u, v, pixels.data[offset + 3] ?? 0);
  };

  const setActive = (petal: number) => {
    if (petal === active) return;
    active = petal;
    art.style.cursor = petal >= 0 ? 'pointer' : '';
    onHover(petal);
  };

  const wake = () => {
    if (!frame && visible && !stopped && !failed && !document.hidden) {
      frame = requestAnimationFrame(draw);
    }
  };

  const stop = (error: unknown) => {
    failed = true;
    cancelAnimationFrame(frame);
    garden.classList.remove('pollen-ready');
    console.warn('Elanor: pollen disabled.', error);
  };

  function draw(now: number) {
    frame = 0;
    if (!visible || stopped || failed || document.hidden) return;
    const still = reducedMotion.matches;
    if (!still && now - lastTime < FRAME_INTERVAL) {
      wake();
      return;
    }
    const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    // Night eases in and out with the color scheme rather than snapping.
    const target = currentColorScheme() === 'dark' ? 1 : 0;
    night = still ? target : night + (target - night) * (1 - Math.exp(-dt * 3.2));
    try {
      drawPollen({
        size,
        time: still ? 12 : now / 1000,
        night,
        ignition: still ? 0 : Math.max(0, 1 - (now - schemeChangedAt) / IGNITION),
      });
    } catch (error) {
      stop(error);
      return;
    }
    if (!still) wake();
  }

  art.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') setActive(pick(event.clientX, event.clientY));
  });
  art.addEventListener('pointerleave', () => setActive(-1));
  art.addEventListener('click', (event) => {
    const petal = pick(event.clientX, event.clientY);
    if (petal >= 0) onSelect(petal);
  });

  window.addEventListener(COLOR_SCHEME_EVENT, () => {
    schemeChangedAt = performance.now();
    wake();
  });
  reducedMotion.addEventListener('change', wake);

  const pause = () => garden.classList.toggle('is-paused', document.hidden || !visible);
  document.addEventListener('visibilitychange', () => {
    pause();
    lastTime = performance.now();
    wake();
  });
  window.addEventListener('pagehide', () => {
    stopped = true;
    cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener('pageshow', () => {
    stopped = false;
    lastTime = performance.now();
    wake();
  });

  new ResizeObserver(() => {
    size = Math.max(
      1,
      Math.min(1400, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2))),
    );
    wake();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    pause();
    lastTime = performance.now();
    wake();
  }).observe(garden);

  garden.classList.add('pollen-ready');
  wake();
}
