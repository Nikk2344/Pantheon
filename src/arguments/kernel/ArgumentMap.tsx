import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { conclusions, loadBearing, resolve } from './graph';
import { loadArgument } from './registry';
import type { ArgumentDef, Claim } from './types';

/**
 * The island that content mounts — the philosophy wing's counterpart to
 * `Simulation`.
 *
 * A simulation answers "what does this discovery mean?" by letting you run it.
 * This answers the same question about a piece of reasoning by letting you take
 * it apart: reject any claim and the consequences propagate, so the reader
 * *sees* which parts were load-bearing instead of being told.
 *
 * The layout is a single authored column — content controls the narrative order
 * — with support drawn as arcs in a left-hand gutter. That keeps the diagram
 * honest at any width, which a free-floating node graph does not.
 */

const GUTTER = 52;
const DOT_X = 24;

/** Stable P1/S2/C1-style labels, numbered per kind in author order. */
function labelClaims(claims: Claim[]): Map<string, string> {
  const prefix = { premise: 'P', step: 'S', conclusion: 'C' } as const;
  const seen = { premise: 0, step: 0, conclusion: 0 };
  return new Map(
    claims.map((c) => {
      seen[c.kind] += 1;
      return [c.id, `${prefix[c.kind]}${seen[c.kind]}`];
    }),
  );
}

interface Edge {
  from: string;
  to: string;
}

function edgesOf(def: ArgumentDef): Edge[] {
  return def.claims.flatMap((c) => (c.from ?? []).map((from) => ({ from, to: c.id })));
}

/**
 * Support arcs, measured from the live DOM rather than assumed.
 *
 * Card heights depend on text length, font loading and viewport width, so the
 * geometry can only be known after layout. A ResizeObserver on the container
 * catches reflows; the arcs simply don't render until the first measurement,
 * which reads as a diagram drawing itself in.
 */
function useArcs(
  containerRef: React.RefObject<HTMLDivElement | null>,
  register: Map<string, HTMLElement | null>,
  edges: Edge[],
  deps: unknown[],
): { d: string; from: string; to: string }[] {
  const [arcs, setArcs] = useState<{ d: string; from: string; to: string }[]>([]);

  const measure = useCallback(() => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;

    const centreOf = (id: string): number | null => {
      const el = register.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top - box.top + r.height / 2;
    };

    const next: { d: string; from: string; to: string }[] = [];
    for (const e of edges) {
      const y1 = centreOf(e.from);
      const y2 = centreOf(e.to);
      if (y1 == null || y2 == null) continue;
      // Bow left in proportion to the span, capped so arcs stay in the gutter.
      const bow = Math.min(20, 6 + Math.abs(y2 - y1) * 0.14);
      const x = DOT_X - bow;
      next.push({
        d: `M ${DOT_X} ${y1} C ${x} ${y1 + (y2 - y1) * 0.25}, ${x} ${y1 + (y2 - y1) * 0.75}, ${DOT_X} ${y2}`,
        from: e.from,
        to: e.to,
      });
    }
    setArcs(next);
  }, [containerRef, register, edges]);

  useLayoutEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of register.values()) if (child) ro.observe(child);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  return arcs;
}

const KIND_LABEL = {
  premise: 'Premise',
  step: 'Step',
  conclusion: 'Conclusion',
} as const;

function Shell({ def }: { def: ArgumentDef }): React.ReactElement {
  const [rejected, setRejected] = useState<ReadonlySet<string>>(new Set());
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const [showLoadBearing, setShowLoadBearing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement | null>()).current;

  const labels = useMemo(() => labelClaims(def.claims), [def]);
  const edges = useMemo(() => edgesOf(def), [def]);
  const support = useMemo(() => resolve(def, rejected), [def, rejected]);
  const goal = useMemo(() => conclusions(def)[0], [def]);
  const carrying = useMemo(
    () => (goal ? loadBearing(def, goal.id) : new Set<string>()),
    [def, goal],
  );

  const arcs = useArcs(containerRef, cards, edges, [rejected, pressed, showLoadBearing]);

  const toggle = (id: string): void =>
    setRejected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const press = (objectionId: string, target: string): void => {
    setPressed((prev) => new Set(prev).add(objectionId));
    setRejected((prev) => new Set(prev).add(target));
  };

  const reset = (): void => {
    setRejected(new Set());
    setPressed(new Set());
  };

  const goalStands = goal ? (support.get(goal.id)?.stands ?? true) : true;
  const touched = rejected.size > 0;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-token border border-line bg-raised shadow-token">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
        <span className="rounded-full bg-accent/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
          Take it apart
        </span>
        <h3 className="text-sm font-semibold text-ink">{def.title}</h3>
      </header>

      <div className="border-b border-line bg-surface px-4 py-3 sm:px-5">
        <p className="text-[13.5px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">The claim — </span>
          {def.thesis}
        </p>
      </div>

      <div className="px-4 py-5 sm:px-5">
        <p className="mb-5 text-[13px] leading-relaxed text-faint">
          Reject any claim to refuse it. Everything that depended on it goes with it —
          and whatever is left standing never needed it.
        </p>

        {/* The diagram. */}
        <div ref={containerRef} className="relative" style={{ paddingLeft: GUTTER }}>
          <svg
            className="pointer-events-none absolute inset-y-0 left-0 overflow-visible"
            width={GUTTER}
            height="100%"
            aria-hidden="true"
          >
            {arcs.map((a) => {
              const live =
                (support.get(a.from)?.stands ?? true) && (support.get(a.to)?.stands ?? true);
              return (
                <path
                  key={`${a.from}-${a.to}`}
                  d={a.d}
                  fill="none"
                  stroke={live ? 'var(--tk-accent)' : 'var(--tk-border-strong)'}
                  strokeWidth={live ? 1.5 : 1}
                  strokeDasharray={live ? undefined : '3 3'}
                  className="transition-all duration-300"
                  opacity={live ? 0.55 : 0.5}
                />
              );
            })}
          </svg>

          <ol className="space-y-3">
            {def.claims.map((claim) => {
              const state = support.get(claim.id) ?? {
                stands: true,
                rejected: false,
                blockedBy: [],
              };
              const isRejected = rejected.has(claim.id);
              const fell = !state.stands && !isRejected;
              const bearing = showLoadBearing && carrying.has(claim.id);

              return (
                <li
                  key={claim.id}
                  ref={(el) => {
                    cards.set(claim.id, el);
                  }}
                  className="relative"
                >
                  {/* Anchor dot, sitting on the arc rail. */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      left: -(GUTTER - DOT_X) - 4,
                      height: 9,
                      width: 9,
                      background: state.stands ? 'var(--tk-accent)' : 'var(--tk-border-strong)',
                      boxShadow: state.stands ? '0 0 0 3px color-mix(in oklab, var(--tk-accent) 14%, transparent)' : 'none',
                    }}
                    aria-hidden="true"
                  />

                  <div
                    className={`rounded-token-sm border px-4 py-3 transition-all duration-300 ${
                      isRejected
                        ? 'border-dashed border-line-strong bg-surface'
                        : fell
                          ? 'border-dashed border-line bg-transparent'
                          : bearing
                            ? 'border-accent bg-accent/[0.06]'
                            : 'border-line bg-surface'
                    } ${!state.stands ? 'opacity-55' : ''}`}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent">
                        {labels.get(claim.id)}
                      </span>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">
                        {KIND_LABEL[claim.kind]}
                      </span>
                      {bearing && (
                        <span className="rounded-full bg-accent/12 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                          Load-bearing
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggle(claim.id)}
                        aria-pressed={isRejected}
                        className={`ml-auto h-7 shrink-0 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                          isRejected
                            ? 'border-accent bg-accent text-on-accent'
                            : 'border-line text-muted hover:border-line-strong hover:text-ink'
                        }`}
                      >
                        {isRejected ? 'Restore' : 'Reject'}
                      </button>
                    </div>

                    <p
                      className={`text-[14.5px] leading-relaxed ${
                        state.stands ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {claim.text}
                    </p>

                    {claim.move && (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                        <span className="text-faint">by — </span>
                        {claim.move}
                      </p>
                    )}

                    {(claim.from?.length ?? 0) > 0 && (
                      <p className="mt-1.5 font-mono text-[11px] text-faint">
                        rests on {claim.from!.map((f) => labels.get(f) ?? f).join(' + ')}
                      </p>
                    )}

                    {claim.note && (
                      <p className="mt-2 border-l-2 border-line pl-2.5 text-[12.5px] leading-relaxed text-faint">
                        {claim.note}
                      </p>
                    )}

                    {claim.cite && (
                      <p className="mt-2 font-mono text-[10.5px] text-faint">{claim.cite}</p>
                    )}

                    {/* The payoff: why this one is down. */}
                    {fell && (
                      <p className="mt-2.5 border-t border-line pt-2 text-[12.5px] leading-relaxed text-muted">
                        Falls — it needed{' '}
                        <span className="font-mono font-semibold text-ink">
                          {state.blockedBy.map((b) => labels.get(b) ?? b).join(', ')}
                        </span>
                        .
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Verdict + controls. */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <p
            className={`mr-auto text-[13.5px] font-medium ${
              goalStands ? 'text-ink' : 'text-muted'
            }`}
          >
            {!touched
              ? 'Grant everything and the conclusion follows. Now refuse something.'
              : goalStands
                ? 'The conclusion still stands. What you rejected was never carrying it.'
                : 'The conclusion falls with it.'}
          </p>

          <button
            type="button"
            onClick={() => setShowLoadBearing((v) => !v)}
            aria-pressed={showLoadBearing}
            className={`h-9 rounded-lg border px-3 text-sm font-medium transition ${
              showLoadBearing
                ? 'border-accent bg-accent/12 text-accent'
                : 'border-line text-muted hover:border-line-strong hover:text-ink'
            }`}
            title="Highlight the premises that the conclusion actually needs"
          >
            What's load-bearing?
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={!touched && pressed.size === 0}
            className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Grant it all again
          </button>
        </div>

        {/* Recorded objections. */}
        {(def.objections?.length ?? 0) > 0 && (
          <div className="mt-6 border-t border-line pt-5">
            <h4 className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              What people actually said back
            </h4>
            <p className="mb-4 text-[12.5px] leading-relaxed text-faint">
              Real objections, from the people who made them. Press one to apply it to the
              argument and see how much damage it does.
            </p>

            <ul className="space-y-3">
              {def.objections!.map((o) => {
                const applied = pressed.has(o.id);
                return (
                  <li
                    key={o.id}
                    className="rounded-token-sm border border-line bg-surface px-4 py-3"
                  >
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                      <span className="text-[12.5px] font-semibold text-ink">{o.who}</span>
                      <span className="font-mono text-[10.5px] text-faint">
                        against {labels.get(o.target) ?? o.target}
                      </span>
                      <button
                        type="button"
                        onClick={() => press(o.id, o.target)}
                        disabled={applied}
                        className="ml-auto h-7 shrink-0 rounded-md border border-line px-2.5 text-[11px] font-semibold text-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {applied ? 'Applied' : 'Press it'}
                      </button>
                    </div>

                    <p className="text-[13.5px] leading-relaxed text-muted">{o.text}</p>

                    {/* Held back until pressed, for the same reason a re-enactment
                        beat holds back its insight. */}
                    {applied && o.reply && (
                      <p className="mt-2.5 border-t border-line pt-2 text-[13px] leading-relaxed text-muted">
                        <span className="font-semibold text-ink">He answered — </span>
                        {o.reply}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {def.notice && (
          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            <span className="font-semibold text-ink">What to notice — </span>
            {def.notice}
          </p>
        )}
      </div>
    </figure>
  );
}

export default function ArgumentMap({ id }: { id: string }): React.ReactElement {
  const [def, setDef] = useState<ArgumentDef | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    loadArgument(id).then((d) => {
      if (!alive) return;
      if (d) setDef(d);
      else setMissing(true);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (missing) {
    return (
      <p className="my-8 rounded-token border border-dashed border-line px-4 py-6 text-center text-sm text-faint">
        No argument registered as <code className="font-mono">{id}</code>.
      </p>
    );
  }

  if (!def) {
    return (
      <div
        className="my-8 h-96 animate-pulse rounded-token border border-line bg-surface"
        aria-label="Loading argument"
      />
    );
  }

  return <Shell def={def} />;
}
