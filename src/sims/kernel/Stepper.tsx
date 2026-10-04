import type { Beat } from './types';
import type { SimController } from './useSimulation';

/**
 * The re-enactment shell.
 *
 * This is the half of the project that matters most: not "here is what
 * radioactivity is", but "here is the bench, here is what they saw, and here
 * is the inference they were forced into". The reader advances one beat at a
 * time; the simulation plays that beat and stops; the conclusion is withheld
 * until the moment it was actually earned.
 */
export function Stepper({
  sim,
  beats,
}: {
  sim: SimController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beats: Beat<any>[];
}): React.ReactElement | null {
  const beat = beats[sim.beatIndex];
  if (!beat) return null;

  const isLast = sim.beatIndex === beats.length - 1;

  return (
    <div className="space-y-4">
      {/* Progress rail — each beat is a segment, filled once passed. */}
      <ol className="flex gap-1.5" aria-label="Experiment steps">
        {beats.map((b, i) => (
          <li key={b.title} className="flex-1">
            <button
              type="button"
              onClick={() => sim.goToBeat(i)}
              aria-current={i === sim.beatIndex ? 'step' : undefined}
              title={`${i + 1}. ${b.title}`}
              className={`h-1 w-full rounded-full transition-colors ${
                i < sim.beatIndex
                  ? 'bg-accent/50'
                  : i === sim.beatIndex
                    ? 'bg-accent'
                    : 'bg-line'
              }`}
            >
              <span className="sr-only">{b.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div>
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
          Step {sim.beatIndex + 1} of {beats.length}
        </p>
        <h4 className="mb-1.5 text-base font-semibold text-ink">{beat.title}</h4>
        <p className="text-sm leading-relaxed text-muted">{beat.narration}</p>

        {/* The payoff, held back until the reader has actually watched it. */}
        {beat.insight && sim.beatComplete ? (
          <p className="mt-3 border-l-2 border-accent pl-3 text-sm leading-relaxed font-medium text-ink">
            {beat.insight}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => sim.goToBeat(sim.beatIndex - 1)}
          disabled={sim.beatIndex === 0}
          className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        <button
          type="button"
          onClick={sim.toggle}
          className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink"
        >
          {sim.running ? 'Pause' : sim.beatComplete ? 'Replay' : 'Play'}
        </button>

        <button
          type="button"
          onClick={() => sim.goToBeat(sim.beatIndex + 1)}
          disabled={isLast}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? 'Done' : 'Next'}
          {!isLast && (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M4 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
