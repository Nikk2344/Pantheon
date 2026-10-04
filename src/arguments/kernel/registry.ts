import { validate } from './graph';
import type { ArgumentDef } from './types';

/**
 * The bridge between content and code, exactly as `sims/kernel/registry` is for
 * simulations. An entry says `argument: "method-of-doubt"` and that is all a
 * content author needs to know. Each value is a dynamic import, so a profile
 * page ships only the arguments it actually renders.
 */
export const REGISTRY: Record<string, () => Promise<{ default: ArgumentDef }>> = {
  'method-of-doubt': () => import('../defs/method-of-doubt'),
  syllogism: () => import('../defs/syllogism'),
  'induction-problem': () => import('../defs/induction-problem'),
  'harm-principle': () => import('../defs/harm-principle'),
  'dependent-arising': () => import('../defs/dependent-arising'),
  'stoic-control': () => import('../defs/stoic-control'),
  'equal-education': () => import('../defs/equal-education'),
  'epicurean-death': () => import('../defs/epicurean-death'),
};

export type ArgumentId = keyof typeof REGISTRY;

/** Every registered id — used by the build-time check that content never
 *  references an argument that doesn't exist. */
export const ARGUMENT_IDS = Object.keys(REGISTRY);

export async function loadArgument(id: string): Promise<ArgumentDef | null> {
  const importer = REGISTRY[id];
  if (!importer) return null;
  const mod = await importer();
  return mod.default;
}

/**
 * Structural validation of every registered argument, run at build time.
 *
 * A dangling `from` id produces a claim that appears to rest on something and
 * in fact rests on nothing — it renders perfectly and is simply false about the
 * argument's shape. That is the same class of failure the content schema exists
 * to catch, so it fails the build in the same way.
 */
export async function verifyArguments(): Promise<void> {
  const problems: string[] = [];

  for (const id of ARGUMENT_IDS) {
    const def = await loadArgument(id);
    if (!def) {
      problems.push(`  ${id} → registered but did not load`);
      continue;
    }
    if (def.id !== id) {
      problems.push(`  ${id} → registered under a different id than it declares ("${def.id}")`);
    }
    for (const problem of validate(def)) problems.push(`  ${id} → ${problem}`);
  }

  if (problems.length > 0) {
    throw new Error(`Malformed arguments:\n${problems.join('\n')}`);
  }
}
