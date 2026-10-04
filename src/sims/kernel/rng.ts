/**
 * Seeded pseudo-randomness.
 *
 * Simulations must never call Math.random(). Two reasons:
 *
 *  1. Re-enactments are *scripted*. Rutherford's rare backscatter has to
 *     actually happen while the reader is watching that beat — not maybe.
 *     A seeded stream makes "rare" reproducible.
 *  2. Reset should genuinely reset. If a reader sees something surprising and
 *     hits reset to watch it again, they should get the same run back.
 */

/** mulberry32 — small, fast, statistically fine for visual simulation. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform in [lo, hi). */
export function range(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

/** Standard normal via Box–Muller. Used for beam spread and measurement noise. */
export function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
