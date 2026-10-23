/** Side length of the painting the landmarks below were measured on. */
const ARTWORK_SIZE = 1254;

/** Where the five petals meet, as fractions of the painting. */
const CORE = [650 / ARTWORK_SIZE, 786 / ARTWORK_SIZE] as const;

/** Petal tips, clockwise from the top, in artwork pixels. Order matches `COURIERS`. */
const TIPS = [
  [573, 35],
  [1210, 402],
  [1110, 1168],
  [425, 1198],
  [24, 650],
] as const;

/** The pollen canvas extends 12% past the painting on each side. */
export const PAD = 1.24;

const AXES = TIPS.map(([x, y]) => {
  const dx = (x / ARTWORK_SIZE - CORE[0]) * 2;
  const dy = (CORE[1] - y / ARTWORK_SIZE) * 2;
  const length = Math.hypot(dx, dy);
  return [dx / length, dy / length] as const;
});

/** The petal index at (u, v), as fractions of the painting; -1 for transparent pixels and the stamens. */
export function petalAt(u: number, v: number, alpha: number): number {
  if (alpha < 20 || u < 0 || v < 0 || u > 1 || v > 1) return -1;
  if (Math.hypot((u - 0.52) / 0.115, (v - 0.585) / 0.115) < 1) return -1;
  const x = (u - CORE[0]) * 2;
  const y = (CORE[1] - v) * 2;
  let best = -Infinity;
  let index = -1;
  AXES.forEach(([dx, dy], petal) => {
    const score = x * dx + y * dy;
    if (score > best) {
      best = score;
      index = petal;
    }
  });
  return index;
}
