import type { ArgumentDef, Claim } from './types';

/**
 * Support propagation — the whole of the argument kernel's logic, kept pure and
 * free of React so it can be reasoned about (and validated at build time)
 * without a browser.
 *
 * The rule is deliberately austere: a claim stands unless it has been rejected,
 * or unless something it rests on has stopped standing. Everything the reader
 * sees — greyed-out steps, a conclusion that falls, an objection that turns out
 * to touch nothing important — falls out of that one rule applied transitively.
 */

export interface Support {
  /** Does this claim still have everything it needs? */
  stands: boolean;
  /** The reader rejected this claim directly (as opposed to losing support). */
  rejected: boolean;
  /**
   * The rejected claims responsible, found by walking back up the support
   * chain. Empty when the claim stands. For a directly rejected claim this is
   * the claim itself, which makes the two cases uniform for callers.
   */
  blockedBy: string[];
}

export type SupportMap = Map<string, Support>;

const STANDS: Support = { stands: true, rejected: false, blockedBy: [] };

/**
 * Resolve every claim against a set of rejected ids.
 *
 * Memoised, and guarded against cycles: `validate` refuses to let a cyclic
 * argument reach the site at all, but a cycle here would hang the reader's tab
 * rather than fail a build, so the guard stays.
 */
export function resolve(def: ArgumentDef, rejected: ReadonlySet<string>): SupportMap {
  const byId = new Map(def.claims.map((c) => [c.id, c]));
  const out: SupportMap = new Map();
  const visiting = new Set<string>();

  const walk = (id: string): Support => {
    const cached = out.get(id);
    if (cached) return cached;

    // A cycle, or a dangling reference. Neither should survive `validate`;
    // treat both as unsupported rather than looping or throwing at the reader.
    if (visiting.has(id) || !byId.has(id)) {
      return { stands: false, rejected: false, blockedBy: [id] };
    }

    if (rejected.has(id)) {
      const self: Support = { stands: false, rejected: true, blockedBy: [id] };
      out.set(id, self);
      return self;
    }

    visiting.add(id);
    const blocked: string[] = [];
    for (const parent of byId.get(id)?.from ?? []) {
      const r = walk(parent);
      if (!r.stands) blocked.push(...r.blockedBy);
    }
    visiting.delete(id);

    const result: Support =
      blocked.length === 0
        ? STANDS
        : { stands: false, rejected: false, blockedBy: [...new Set(blocked)] };
    out.set(id, result);
    return result;
  };

  for (const c of def.claims) walk(c.id);
  return out;
}

export function conclusions(def: ArgumentDef): Claim[] {
  return def.claims.filter((c) => c.kind === 'conclusion');
}

export function premises(def: ArgumentDef): Claim[] {
  return def.claims.filter((c) => c.kind === 'premise');
}

/**
 * Which premises does a given conclusion actually need?
 *
 * A premise is load-bearing when rejecting it *on its own* brings the
 * conclusion down. This is the payoff of laying an argument out as a graph:
 * prose gives every premise the same apparent weight, and they are almost never
 * equally weighted. In the method of doubt, none of the famous sceptical
 * premises — the dream, the demon — carry the cogito at all.
 */
export function loadBearing(def: ArgumentDef, conclusionId: string): Set<string> {
  const out = new Set<string>();
  for (const p of premises(def)) {
    const support = resolve(def, new Set([p.id])).get(conclusionId);
    if (support && !support.stands) out.add(p.id);
  }
  return out;
}

/**
 * Structural checks, run at build time.
 *
 * Same reasoning as `verifyLinks` for content: a `from` pointing at an id that
 * doesn't exist renders as a claim that silently rests on nothing, which is
 * both wrong and invisible. Cheaper to fail the build.
 */
export function validate(def: ArgumentDef): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();

  for (const c of def.claims) {
    if (ids.has(c.id)) problems.push(`duplicate claim id "${c.id}"`);
    ids.add(c.id);
  }

  for (const c of def.claims) {
    for (const f of c.from ?? []) {
      if (!ids.has(f)) problems.push(`claim "${c.id}" cites unknown claim "${f}"`);
      if (f === c.id) problems.push(`claim "${c.id}" cites itself`);
    }
    if (c.kind === 'premise' && (c.from?.length ?? 0) > 0) {
      problems.push(`premise "${c.id}" cites support; it should be a step`);
    }
    if (c.kind !== 'premise' && (c.from?.length ?? 0) === 0) {
      problems.push(`${c.kind} "${c.id}" rests on nothing; it should be a premise`);
    }
  }

  for (const o of def.objections ?? []) {
    if (!ids.has(o.target)) {
      problems.push(`objection "${o.id}" targets unknown claim "${o.target}"`);
    }
  }

  if (conclusions(def).length === 0) problems.push('no conclusion');

  // Cycle detection: an argument that supports itself proves anything.
  const byId = new Map(def.claims.map((c) => [c.id, c]));
  const state = new Map<string, 'open' | 'done'>();
  const descend = (id: string, trail: string[]): void => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') {
      problems.push(`cycle: ${[...trail.slice(trail.indexOf(id)), id].join(' → ')}`);
      return;
    }
    state.set(id, 'open');
    for (const f of byId.get(id)?.from ?? []) {
      if (byId.has(f)) descend(f, [...trail, id]);
    }
    state.set(id, 'done');
  };
  for (const c of def.claims) descend(c.id, []);

  return problems;
}
