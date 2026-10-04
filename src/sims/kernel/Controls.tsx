import type { ParamSet, Readout } from './types';
import { SPEEDS, type SimController } from './useSimulation';

/**
 * The control panel — generated entirely from a simulation's `params`
 * declaration. A simulation author adds a `ParamSpec` and a labelled, live,
 * accessible slider appears. No simulation ever writes UI code.
 */

function formatValue(spec: ParamSet[string], v: number): string {
  if (spec.format) return spec.format(v);
  const decimals = spec.step < 0.01 ? 3 : spec.step < 1 ? 2 : 0;
  return v.toFixed(decimals);
}

const TONE: Record<NonNullable<Readout['tone']>, string> = {
  hot: 'text-[var(--tk-sim-hot)]',
  cool: 'text-[var(--tk-sim-cool)]',
  warm: 'text-[var(--tk-sim-warm)]',
  good: 'text-[var(--tk-sim-good)]',
  plain: 'text-ink',
};

export function Readouts({ items }: { items: Readout[] }): React.ReactElement | null {
  if (items.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((r) => (
        <div key={r.label} className="min-w-20">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-faint">
            {r.label}
          </dt>
          <dd
            className={`font-mono text-sm tabular-nums ${TONE[r.tone ?? 'plain']}`}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Transport({
  sim,
  showStep = true,
}: {
  sim: SimController;
  showStep?: boolean;
}): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={sim.toggle}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition hover:opacity-90 active:scale-[0.98]"
        aria-pressed={sim.running}
      >
        {sim.running ? (
          <>
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
              <rect width="3" height="12" rx="1" fill="currentColor" />
              <rect x="7" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
            Pause
          </>
        ) : (
          <>
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
              <path d="M0 1.2v9.6a1 1 0 0 0 1.5.87l8-4.8a1 1 0 0 0 0-1.74l-8-4.8A1 1 0 0 0 0 1.2Z" fill="currentColor" />
            </svg>
            Play
          </>
        )}
      </button>

      {showStep && (
        <button
          type="button"
          onClick={sim.stepOnce}
          disabled={sim.running}
          className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          title="Advance a single physics step"
        >
          Step
        </button>
      )}

      <button
        type="button"
        onClick={sim.reset}
        className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink"
      >
        Reset
      </button>

      <div
        className="ml-auto flex items-center gap-0.5 rounded-lg border border-line p-0.5"
        role="group"
        aria-label="Playback speed"
      >
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sim.setSpeed(s)}
            aria-pressed={sim.speed === s}
            className={`h-8 rounded-md px-2 font-mono text-xs transition ${
              sim.speed === s
                ? 'bg-accent text-on-accent font-semibold'
                : 'text-faint hover:text-ink'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

export function Sliders({
  sim,
  params,
}: {
  sim: SimController;
  params: ParamSet;
}): React.ReactElement | null {
  const entries = Object.entries(params);
  if (entries.length === 0) return null;

  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {entries.map(([key, spec]) => {
        const value = sim.values[key] ?? spec.value;
        return (
          <div key={key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label
                htmlFor={`p-${key}`}
                className="text-xs font-semibold text-ink"
                title={spec.hint}
              >
                {spec.label}
              </label>
              <span className="font-mono text-xs tabular-nums text-muted">
                {formatValue(spec, value)}
                {spec.unit ? <span className="text-faint"> {spec.unit}</span> : null}
              </span>
            </div>
            <input
              id={`p-${key}`}
              type="range"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={value}
              onChange={(e) => sim.setValue(key, Number(e.target.value))}
              className="sim-slider w-full"
            />
            {spec.hint ? (
              <p className="mt-1 text-[11px] leading-snug text-faint">{spec.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
