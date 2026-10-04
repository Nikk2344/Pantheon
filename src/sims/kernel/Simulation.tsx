import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';
// Scoped to this island, so pages without a simulation never load it.
import 'katex/dist/katex.min.css';
import { Readouts, Sliders, Transport } from './Controls';
import { Stepper } from './Stepper';
import { loadSim } from './registry';
import type { AnySim } from './types';
import { useSimulation } from './useSimulation';

/**
 * The island that content mounts. Given a simulation id it loads that
 * simulation's code on demand and assembles the surrounding chrome: canvas,
 * live readouts, either sliders or a narrated stepper, the governing equation,
 * and the one line worth reading before touching anything.
 */

function Equation({ tex }: { tex: string }): React.ReactElement {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: true }),
    [tex],
  );
  return (
    <div
      className="katex-block overflow-x-auto py-1 text-ink"
      // KaTeX output is generated here from a literal in our own source, not
      // from user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Shell({ def }: { def: AnySim }): React.ReactElement {
  const sim = useSimulation(def);
  const isStory = def.mode === 'reenactment' && (def.beats?.length ?? 0) > 0;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-token border border-line bg-raised shadow-token">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
            isStory
              ? 'bg-accent/12 text-accent'
              : 'bg-[var(--tk-sim-good)]/12 text-[var(--tk-sim-good)]'
          }`}
        >
          {isStory ? 'How it happened' : 'Interactive'}
        </span>
        <h3 className="text-sm font-semibold text-ink">{def.title}</h3>
      </header>

      <div className="bg-sim-bg">
        {/* The canvas sizes itself to this wrapper; the kernel handles DPR. */}
        <canvas ref={sim.canvasRef} className="block w-full" role="img" aria-label={`${def.title}. Use the labelled controls and live numeric readouts below to explore this model.`} />
      </div>

      <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
        {sim.readouts.length > 0 && <Readouts items={sim.readouts} />}

        {isStory ? (
          <Stepper sim={sim} beats={def.beats ?? []} />
        ) : (
          <>
            <Transport sim={sim} />
            <Sliders sim={sim} params={def.params} />
          </>
        )}

        {(def.equation || def.notice) && (
          <div className="space-y-2 border-t border-line pt-4">
            {def.equation && <Equation tex={def.equation} />}
            {def.notice && (
              <p className="text-sm leading-relaxed text-muted">
                <span className="font-semibold text-ink">What to notice — </span>
                {def.notice}
              </p>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

export default function Simulation({ id }: { id: string }): React.ReactElement {
  const [def, setDef] = useState<AnySim | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSim(id).then((d) => {
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
        No simulation registered as <code className="font-mono">{id}</code>.
      </p>
    );
  }

  if (!def) {
    return (
      <div
        className="my-8 animate-pulse rounded-token border border-line bg-surface"
        style={{ aspectRatio: '16 / 10' }}
        aria-label="Loading simulation"
      />
    );
  }

  return <Shell def={def} />;
}
