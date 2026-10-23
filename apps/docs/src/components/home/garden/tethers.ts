import {COLOR_SCHEME_EVENT} from '../../../scripts/color-scheme.ts';

interface Point {
  readonly x: number;
  readonly y: number;
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/** A point on the quadratic curve from `a` to `b` through control `c`, at 0 ≤ s ≤ 1. */
function along(a: Point, c: Point, b: Point, s: number): Point {
  const u = 1 - s;
  return {
    x: u * u * a.x + 2 * u * s * c.x + s * s * b.x,
    y: u * u * a.y + 2 * u * s * c.y + s * s * b.y,
  };
}

const SEGMENTS = 16;

/** The thread as a filled outline: thin at the claw, wider at the paper. */
function fibre(a: Point, c: Point, b: Point): string {
  const start: string[] = [];
  const end: string[] = [];
  for (let k = 0; k <= SEGMENTS; k++) {
    const s = k / SEGMENTS;
    const u = 1 - s;
    const p = along(a, c, b, s);
    const dx = 2 * u * (c.x - a.x) + 2 * s * (b.x - c.x);
    const dy = 2 * u * (c.y - a.y) + 2 * s * (b.y - c.y);
    const length = Math.hypot(dx, dy) || 1;
    const half = (0.17 + 0.36 * Math.pow(s, 0.8)) * (1 + 0.12 * Math.sin(s * Math.PI * 9));
    const nx = (-dy / length) * half;
    const ny = (dx / length) * half;
    start.push(`${(p.x + nx).toFixed(2)} ${(p.y + ny).toFixed(2)}`);
    end.push(`${(p.x - nx).toFixed(2)} ${(p.y - ny).toFixed(2)}`);
  }
  return `M${start.join('L')}L${end.reverse().join('L')}Z`;
}

// In dark mode a sheen runs along one pseudo-random thread per slot, with pauses.
const GLINT_SLOT = 6.5;
const GLINT_TRAVEL = 0.5;
const GLINT_PEAK = 0.42;
const THREADS = 10;

function nightGlint(time: number, thread: number, night: number): {opacity: number; s: number} {
  const none = {opacity: 0, s: 0};
  if (night < 0.02) return none;
  const slot = Math.floor(time / GLINT_SLOT);
  const pick = Math.floor(((Math.abs(Math.sin(slot * 91.7 + 3.1)) * 43758.5453) % 1) * THREADS);
  const phase = (time / GLINT_SLOT) % 1;
  if (pick !== thread || phase > GLINT_TRAVEL) return none;
  const t = phase / GLINT_TRAVEL;
  return {
    opacity: Math.pow(Math.sin(Math.PI * t), 2) * GLINT_PEAK * night,
    s: 0.1 + t * t * (3 - 2 * t) * 0.82,
  };
}

function rectOf(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/** Collects the anchor elements of one courier. */
function carrierOf(link: HTMLElement) {
  const all = <T extends Element>(selector: string) => [...link.querySelectorAll<T>(selector)];
  const one = <T extends Element>(selector: string) => {
    const element = link.querySelector<T>(selector);
    if (!element) throw new Error(`Elanor: courier is missing ${selector}.`);
    return element;
  };
  return {
    link,
    firefly: one<SVGSVGElement>('.firefly'),
    flight: one<HTMLElement>('.courier-flight'),
    origin: one<HTMLElement>('.frame-origin'),
    axisX: one<HTMLElement>('.frame-x'),
    axisY: one<HTMLElement>('.frame-y'),
    paper: one<HTMLElement>('.paper'),
    paths: all<SVGPathElement>('.paper-thread'),
    glints: all<SVGCircleElement>('.thread-glint'),
    corners: all<HTMLElement>('.paper-anchor'),
    beeGrips: all<HTMLElement>('[data-grip="bee"]'),
    fireflyGrips: all<HTMLElement>('[data-grip="firefly"]'),
  };
}

/**
 * Redraws each paper's threads to its insect's claws every frame. Positions come from zero-size HTML
 * anchors, because browsers report SVG transforms under mirrored CSS ancestors inconsistently.
 */
export function connectPapers(garden: HTMLElement, links: readonly HTMLElement[]): void {
  const carriers = links.map(carrierOf);
  let frame = 0;
  let visible = true;
  let stopped = false;

  const schedule = () => {
    if (!frame && visible && !stopped && !document.hidden) frame = requestAnimationFrame(update);
  };

  function update() {
    frame = 0;
    if (!visible || stopped || document.hidden) return;
    const now = performance.now() / 1000;

    // Read all geometry before writing, to avoid layout thrashing.
    const drawings = carriers.flatMap((carrier, index) => {
      const width = carrier.flight.clientWidth;
      const height = carrier.flight.clientHeight;
      if (!width || !height) return [];
      const origin = rectOf(carrier.origin);
      const x = rectOf(carrier.axisX);
      const y = rectOf(carrier.axisY);
      const inverse = new DOMMatrix([
        (x.x - origin.x) / width,
        (x.y - origin.y) / width,
        (y.x - origin.x) / height,
        (y.y - origin.y) / height,
        origin.x,
        origin.y,
      ]).inverse();
      const local = (element: Element) => {
        const rect = rectOf(element);
        return new DOMPoint(rect.x, rect.y).matrixTransform(inverse);
      };
      // During the bee/firefly crossfade, follow the more visible insect.
      const blend = Number(getComputedStyle(carrier.firefly).opacity);
      const feet = carrier.beeGrips
        .map((grip, i) => {
          const bee = local(grip);
          const firefly = local(carrier.fireflyGrips[i] ?? grip);
          return {x: bee.x + (firefly.x - bee.x) * blend, y: bee.y + (firefly.y - bee.y) * blend};
        })
        .sort((a, b) => a.x - b.x);

      return carrier.corners.flatMap((corner, i) => {
        const start = feet[i];
        const path = carrier.paths[i];
        const glint = carrier.glints[i];
        if (!start || !path || !glint) return [];
        const end = local(corner);
        const control = {x: (start.x + end.x) * 0.5, y: (start.y + end.y) * 0.5 + 1};
        const sheen = nightGlint(now, index * 2 + i, blend);
        return [
          {
            path,
            d: fibre(start, control, end),
            glint,
            opacity: sheen.opacity,
            at: sheen.opacity > 0 ? along(start, control, end, sheen.s) : undefined,
          },
        ];
      });
    });

    for (const {path, d, glint, opacity, at} of drawings) {
      path.setAttribute('d', d);
      glint.setAttribute('opacity', opacity.toFixed(3));
      if (at) {
        glint.setAttribute('cx', at.x.toFixed(2));
        glint.setAttribute('cy', at.y.toFixed(2));
      }
    }
    if (!reducedMotion.matches) schedule();
  }

  // The paper's height positions the insect above it.
  const papers = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const carrier = carriers.find((item) => item.paper === entry.target);
      carrier?.link.style.setProperty('--paper-height', `${carrier.paper.offsetHeight}px`);
    }
    schedule();
  });
  for (const carrier of carriers) papers.observe(carrier.paper);
  new ResizeObserver(schedule).observe(garden);
  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    schedule();
  }).observe(garden);

  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  window.addEventListener(COLOR_SCHEME_EVENT, schedule);
  window.addEventListener('pagehide', () => {
    stopped = true;
    cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener('pageshow', () => {
    stopped = false;
    schedule();
  });
  schedule();
}
