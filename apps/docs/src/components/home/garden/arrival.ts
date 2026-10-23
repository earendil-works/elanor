// The entrance animates `translate` and `rotate`, so it composes with the idle `transform` loops.

/** Launch order by courier index, and each courier's start height as a share of the viewport. */
const ORDER = [1, 3, 0, 4, 2];
const LIFT = [-0.3, -0.14, 0.24, 0.3, -0.1];
const STAGGER = 140;
/** Samples per second for the flight and swing keyframes. */
const RATE = 60;

// The paper swings as a damped pendulum driven by the flight's acceleration.
const OMEGA = (2 * Math.PI) / 0.95;
const DAMPING = 2 * 0.17 * OMEGA;
const DRAG = 0.006;
const MAX_TRAIL = 18;
const SETTLE = 1500;

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

type FlightPath = (u: number) => {x: number; y: number; eased: number};

/** A curve from (sx, sy) to the origin, with quartic ease-out. */
function flightPath(sx: number, sy: number): FlightPath {
  // The control point bows the path upward.
  const cx = sx * 0.38;
  const cy = sy * 0.5 - Math.abs(sx) * 0.16;
  return (u) => {
    const eased = 1 - Math.pow(1 - clamp(u, 0, 1), 4);
    const a = (1 - eased) * (1 - eased);
    const b = 2 * (1 - eased) * eased;
    return {x: a * sx + b * cx, y: a * sy + b * cy, eased};
  };
}

/** Samples the paper's pendulum angle (degrees) at `RATE` per second over the flight and settle. */
function swing(path: FlightPath, duration: number): number[] {
  const seconds = duration / 1000;
  const total = seconds + SETTLE / 1000;
  const dt = 1 / 240;
  const h = 0.004;
  const trail = (time: number) => {
    if (time >= seconds) return 0;
    const velocity =
      (path((time + h) / seconds).x - path(Math.max(0, time - h) / seconds).x) / (2 * h);
    return clamp(velocity * DRAG, -MAX_TRAIL, MAX_TRAIL);
  };
  let angle = trail(0);
  let velocity = 0;
  let next = 0;
  const samples: number[] = [];
  for (let time = 0; time <= total + 1e-9; time += dt) {
    if (time >= next - 1e-9) {
      samples.push(angle);
      next += 1 / RATE;
    }
    velocity += (-OMEGA * OMEGA * (angle - trail(time)) - DAMPING * velocity) * dt;
    angle += velocity * dt;
  }
  // End at exactly zero, so the idle sway takes over without a jump.
  const tail = Math.min(12, samples.length);
  for (let i = 0; i < tail; i++) {
    const last = samples.length - 1 - i;
    samples[last] = (samples[last] ?? 0) * (i / tail);
  }
  return samples;
}

/** Flies the couriers in after `delay` ms, staggered. Resolves when all have landed. */
export async function launchCouriers(
  links: readonly HTMLElement[],
  delay: number,
  duration: number,
): Promise<void> {
  const flights = links.map((link, index) => {
    const rect = link.getBoundingClientRect();
    const fromLeft = link.style.getPropertyValue('--heading').trim() !== '-1';
    const direction = fromLeft ? 1 : -1;
    const sx = fromLeft ? -(rect.right + 80) : window.innerWidth - rect.left + 80;
    const sy = (LIFT[index] ?? 0) * window.innerHeight;
    const path = flightPath(sx, sy);
    const steps = Math.round((duration / 1000) * RATE);
    const keyframes: Keyframe[] = [];
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const {x, y, eased} = path(u);
      // Nose down while fast, nose up to brake, then level.
      const flare = Math.pow(Math.sin(Math.PI * clamp((u - 0.38) / 0.62, 0, 1)), 2);
      const pitch = direction * (8 * (1 - eased) * (1 - eased) - 4.5 * flare);
      keyframes.push({
        offset: u,
        translate: `${x.toFixed(2)}px ${y.toFixed(2)}px`,
        rotate: `${pitch.toFixed(3)}deg`,
      });
    }

    const start = delay + ORDER.indexOf(index) * STAGGER;
    const timing = {delay: start, easing: 'linear', fill: 'backwards'} as const;
    link.classList.add('in-flight');
    const flight = link.animate(keyframes, {...timing, duration});

    link.querySelector('.paper-wrap')?.animate(
      swing(path, duration).map((angle) => ({rotate: `${angle.toFixed(3)}deg`})),
      {...timing, duration: duration + SETTLE},
    );
    // Firefly lanterns light up on landing; hidden by day.
    for (const lantern of link.querySelectorAll('.firefly-halo, .firefly-lantern')) {
      lantern.animate(
        [
          {scale: '0.15'},
          {scale: '0.15', offset: 0.55},
          {scale: '1.2', offset: 0.85},
          {scale: '1'},
        ],
        {...timing, duration, easing: 'ease-out'},
      );
    }

    const land = () => link.classList.remove('in-flight');
    return flight.finished.then(land, land);
  });
  document.documentElement.classList.add('couriers-launched');
  await Promise.all(flights);
}
