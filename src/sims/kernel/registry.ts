import type { AnySim } from './types';

/**
 * The bridge between content and code.
 *
 * A discovery in an MDX file says `interactiveDemo: "gold-foil"` and that is
 * all a content author ever needs to know. Each entry here is a dynamic import,
 * so a profile page only downloads the simulations it actually shows — a page
 * with no interactive ships no simulation code at all.
 */
export const REGISTRY: Record<string, () => Promise<{ default: AnySim }>> = {
  'radioactive-decay': () => import('../defs/radioactive-decay'),
  orbit: () => import('../defs/orbit'),
  'gold-foil': () => import('../defs/gold-foil'),
  pendulum: () => import('../defs/pendulum'),
  photoelectric: () => import('../defs/photoelectric'),
  induction: () => import('../defs/induction'),
  waves: () => import('../defs/waves'),
};

export type SimId = keyof typeof REGISTRY;

/** Every registered id — used by the build-time check that content never
 *  references a simulation that doesn't exist. */
export const SIM_IDS = Object.keys(REGISTRY);

export async function loadSim(id: string): Promise<AnySim | null> {
  const importer = REGISTRY[id];
  if (!importer) return null;
  const mod = await importer();
  return mod.default;
}
