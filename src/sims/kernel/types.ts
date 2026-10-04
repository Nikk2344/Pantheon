/**
 * The contract every simulation implements.
 *
 * A simulation is a plain data object: no React, no canvas boilerplate, no
 * animation loop. It declares its parameters, says how to initialise state,
 * how to advance state by a fixed timestep, and how to paint it. The kernel
 * owns everything else. Adding the tenth simulation should be a matter of
 * writing physics, not wiring.
 */

/** One tunable knob. The control panel is generated from these — declare a
 *  parameter, get a labelled slider, for free. */
export interface ParamSpec {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  /** Override how the number is displayed (e.g. exponent notation). */
  format?: (v: number) => string;
  /** True when changing this alters the *setup* rather than the ongoing
   *  physics (e.g. atom count) and so requires a fresh `init`. */
  reinit?: boolean;
  /** Short explanation surfaced on hover/focus. */
  hint?: string;
}

export type ParamSet = Record<string, ParamSpec>;

/** Current numeric value of every declared parameter. */
export type Values<P extends ParamSet> = { [K in keyof P]: number };

/** Simulations paint onto an always-dark instrument palette, sourced from
 *  theme.css so it stays the single source of truth for colour. */
export interface SimPalette {
  bg: string;
  grid: string;
  ink: string;
  muted: string;
  hot: string;
  cool: string;
  warm: string;
  good: string;
  accent: string;
}

export interface Surface {
  ctx: CanvasRenderingContext2D;
  /** Logical size in CSS pixels — the context is already DPR-scaled, so draw
   *  in these units and ignore device pixels entirely. */
  width: number;
  height: number;
  palette: SimPalette;
}

/** A single narrated moment in a discovery re-enactment. */
export interface Beat<S> {
  title: string;
  /** What the experimenter is doing, and what it means. */
  narration: string;
  /** Auto-advance once this predicate holds. Omit to wait for the reader. */
  until?: (state: S) => boolean;
  /** Applied when the beat is entered — used to stage the apparatus. */
  onEnter?: (state: S) => void;
  /** Held-back conclusion, revealed once the beat completes. */
  insight?: string;
}

/** A live numeric display beside the canvas (counts, energies, angles). */
export interface Readout {
  label: string;
  value: string;
  /** Tints the value — useful for "this is the interesting number". */
  tone?: 'hot' | 'cool' | 'warm' | 'good' | 'plain';
}

export interface SimDef<S, P extends ParamSet = ParamSet> {
  id: string;
  title: string;
  /** `sandbox` gets sliders and free play. `reenactment` gets a narrated
   *  stepper walking the reader through how the discovery actually happened. */
  mode: 'sandbox' | 'reenactment';
  params: P;

  /** Build fresh state. Must be deterministic given (params, seed). */
  init(values: Values<P>, seed: number): S;
  /** Advance by exactly `dt` seconds. Mutate `state` in place. */
  step(state: S, dt: number, values: Values<P>): void;
  /** Paint the current state. Must not mutate state. */
  draw(surface: Surface, state: S, values: Values<P>): void;

  /** KaTeX source for the governing equation. */
  equation?: string;
  /** The one sentence worth reading before touching the controls. */
  notice?: string;
  /** Re-enactment script. Required when mode is 'reenactment'. */
  beats?: Beat<S>[];
  /** Live numbers rendered beside the canvas. */
  readouts?(state: S, values: Values<P>): Readout[];
  /** Canvas width/height ratio. Defaults to 16/9. */
  aspect?: number;
  /** Simulated seconds per wall-clock second at 1× speed. Defaults to 1. */
  timeScale?: number;
}

/** Convenience: extract the state type of a SimDef. */
export type StateOf<D> = D extends SimDef<infer S, ParamSet> ? S : never;

/** Any simulation, with its type parameters erased — what the registry and the
 *  kernel hand around once the specific sim is no longer statically known. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySim = SimDef<any, ParamSet>;
