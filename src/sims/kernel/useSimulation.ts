import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnySim, Readout, SimPalette } from './types';

/**
 * The animation kernel.
 *
 * Everything that is the same for every simulation lives here:
 *
 *  - a **fixed-timestep** integrator, so the physics is identical on a 60Hz
 *    laptop and a 144Hz monitor. Variable-dt integration silently changes
 *    orbital periods and decay rates with frame rate, which would make the
 *    simulations quietly wrong — the one failure mode that would undermine
 *    the whole point of the site.
 *  - transport controls (play / pause / reset / single-step / speed)
 *  - device-pixel-ratio canvas sizing, so nothing is blurry on retina
 *  - re-enactment beat sequencing
 *  - throttled readouts, so live numbers don't re-render React 60× a second
 *  - pausing when scrolled out of view, so a profile page with six
 *    simulations doesn't cook the reader's battery
 */

/** Physics substep. Small enough for stable orbits, cheap enough to be free. */
const FIXED_DT = 1 / 120;
/** Cap substeps per frame so a backgrounded tab can't trigger a death spiral. */
const MAX_SUBSTEPS = 12;
/** Readouts refresh at this rate rather than every frame. */
const READOUT_HZ = 12;

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

function readPalette(el: HTMLElement): SimPalette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string): string =>
    cs.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--tk-sim-bg', '#0a0c12'),
    grid: v('--tk-sim-grid', '#1b2130'),
    ink: v('--tk-sim-ink', '#e8ebf2'),
    muted: v('--tk-sim-muted', '#7c869c'),
    hot: v('--tk-sim-hot', '#ff4d6d'),
    cool: v('--tk-sim-cool', '#38bdf8'),
    warm: v('--tk-sim-warm', '#fbbf24'),
    good: v('--tk-sim-good', '#34d399'),
    accent: v('--tk-accent', '#2563eb'),
  };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface SimController {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  running: boolean;
  toggle(): void;
  reset(): void;
  /** Advance exactly one physics substep while paused. */
  stepOnce(): void;
  speed: number;
  setSpeed(v: number): void;
  values: Record<string, number>;
  setValue(key: string, v: number): void;
  resetValues(): void;
  readouts: Readout[];
  /** Simulated seconds elapsed. */
  elapsed: number;
  // Re-enactment only
  beatIndex: number;
  beatCount: number;
  goToBeat(i: number): void;
  /** True once the current beat's `until` predicate has fired. */
  beatComplete: boolean;
}

export function useSimulation(def: AnySim, seed = 12345): SimController {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const defaults = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, spec] of Object.entries(def.params)) out[k] = spec.value;
    return out;
  }, [def]);

  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [readouts, setReadouts] = useState<Readout[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatComplete, setBeatComplete] = useState(false);

  // Live mirrors, so the rAF loop reads current values without being torn down
  // and rebuilt on every state change.
  const stateRef = useRef<unknown>(null);
  const valuesRef = useRef(values);
  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  const beatRef = useRef(0);
  const dirtyRef = useRef(true);
  const simTimeRef = useRef(0);
  const paletteRef = useRef<SimPalette | null>(null);
  /** Forces one immediate readout refresh outside the throttle. */
  const refreshRef = useRef(false);

  /** Ask for a repaint and a readout update on the very next frame. Needed
   *  wherever the simulation stops, because the throttled readouts would
   *  otherwise freeze up to 80ms stale — which is exactly long enough to miss
   *  the event that caused the stop. */
  const requestRefresh = useCallback(() => {
    dirtyRef.current = true;
    refreshRef.current = true;
  }, []);

  valuesRef.current = values;
  runningRef.current = running;
  speedRef.current = speed;
  beatRef.current = beatIndex;

  // Memoised deliberately: `def.beats ?? []` would mint a fresh array on every
  // render for sandbox simulations, which flows into the loop effect's
  // dependencies and re-mounts the animation loop endlessly.
  const beats = useMemo(() => def.beats ?? [], [def]);
  const beatCount = beats.length;

  /** Build fresh state, then replay the staging of every beat up to `upTo`.
   *  Because the RNG is seeded this is an exact rewind, not an approximation. */
  const build = useCallback(
    (upTo: number) => {
      const s = def.init({ ...valuesRef.current }, seed);
      for (let i = 0; i <= upTo && i < beats.length; i++) {
        beats[i]?.onEnter?.(s);
      }
      stateRef.current = s;
      simTimeRef.current = 0;
      requestRefresh();
    },
    [def, seed, beats, requestRefresh],
  );

  const reset = useCallback(() => {
    build(def.mode === 'reenactment' ? beatRef.current : -1);
    setBeatComplete(false);
    setElapsed(0);
    setRunning(!prefersReducedMotion());
  }, [build, def.mode]);

  const goToBeat = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(beats.length - 1, i));
      beatRef.current = clamped;
      setBeatIndex(clamped);
      build(clamped);
      setBeatComplete(false);
      setElapsed(0);
      setRunning(!prefersReducedMotion());
    },
    [beats.length, build],
  );

  const setValue = useCallback(
    (key: string, v: number) => {
      setValues((prev) => {
        const next = { ...prev, [key]: v };
        valuesRef.current = next;
        // Structural parameters change the setup, not the ongoing physics, so
        // they need a rebuild rather than a live tweak.
        if (def.params[key]?.reinit) {
          const s = def.init(next, seed);
          for (let i = 0; i <= beatRef.current && i < beats.length; i++) {
            beats[i]?.onEnter?.(s);
          }
          stateRef.current = s;
          simTimeRef.current = 0;
        }
        dirtyRef.current = true;
        return next;
      });
    },
    [def, seed, beats],
  );

  const resetValues = useCallback(() => {
    valuesRef.current = defaults;
    setValues(defaults);
    build(def.mode === 'reenactment' ? beatRef.current : -1);
  }, [defaults, build, def.mode]);

  const stepOnce = useCallback(() => {
    if (stateRef.current == null) return;
    def.step(stateRef.current, FIXED_DT, valuesRef.current);
    simTimeRef.current += FIXED_DT;
    requestRefresh();
  }, [def, requestRefresh]);

  // --- canvas sizing -------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    paletteRef.current = readPalette(canvas);

    const resize = (): void => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const cssW = parent.clientWidth;
      const cssH = Math.round(cssW / (def.aspect ?? 16 / 9));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      // Draw in CSS pixels; the transform handles the device pixel ratio.
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirtyRef.current = true;
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // The accent colour differs between light and dark themes.
    const mo = new MutationObserver(() => {
      paletteRef.current = readPalette(canvas);
      dirtyRef.current = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [def]);

  // --- pause while off-screen ---------------------------------------------
  const visibleRef = useRef(true);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: '120px' },
    );
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  // --- the loop ------------------------------------------------------------
  useEffect(() => {
    build(def.mode === 'reenactment' ? 0 : -1);
    if (!prefersReducedMotion()) setRunning(true);

    let raf = 0;
    let last = performance.now();
    let readoutAccum = 0;
    let accumulator = 0;

    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      const real = Math.min((now - last) / 1000, 0.25);
      last = now;

      const canvas = canvasRef.current;
      const state = stateRef.current;
      if (!canvas || state == null) return;
      if (!visibleRef.current) return;

      const scale = def.timeScale ?? 1;
      const advancing = runningRef.current;

      if (advancing) {
        accumulator += real * speedRef.current * scale;
        let n = 0;
        while (accumulator >= FIXED_DT && n < MAX_SUBSTEPS) {
          def.step(state, FIXED_DT, valuesRef.current);
          simTimeRef.current += FIXED_DT;
          accumulator -= FIXED_DT;
          n++;
        }
        // Drop any backlog we couldn't chew through, rather than accumulating
        // debt that makes the simulation lurch when it catches up.
        if (n === MAX_SUBSTEPS) accumulator = 0;
        dirtyRef.current = true;

        // Beat sequencing: auto-advance when the scripted moment has arrived.
        const beat = beats[beatRef.current];
        if (beat?.until?.(state)) {
          setBeatComplete(true);
          runningRef.current = false;
          setRunning(false);
          // The moment the beat resolves *is* the interesting number — the
          // backscatter that just landed. Publish it rather than leaving the
          // last throttled sample on screen.
          refreshRef.current = true;
        }
      } else {
        accumulator = 0;
      }

      if (!dirtyRef.current) return;
      dirtyRef.current = false;

      const ctx = canvas.getContext('2d');
      const palette = paletteRef.current;
      if (!ctx || !palette) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      def.draw(
        {
          ctx,
          width: canvas.width / dpr,
          height: canvas.height / dpr,
          palette,
        },
        state,
        valuesRef.current,
      );

      readoutAccum += real;
      if (readoutAccum >= 1 / READOUT_HZ || refreshRef.current) {
        readoutAccum = 0;
        refreshRef.current = false;
        setElapsed(simTimeRef.current);
        if (def.readouts) setReadouts(def.readouts(state, valuesRef.current));
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [def, build, beats]);

  const toggle = useCallback(() => {
    setRunning((r) => {
      // Restarting a completed beat should replay it, not sit at the end state.
      if (!r && def.mode === 'reenactment' && beatComplete) {
        build(beatRef.current);
        setBeatComplete(false);
      }
      requestRefresh();
      return !r;
    });
  }, [def.mode, beatComplete, build, requestRefresh]);

  return {
    canvasRef,
    running,
    toggle,
    reset,
    stepOnce,
    speed,
    setSpeed,
    values,
    setValue,
    resetValues,
    readouts,
    elapsed,
    beatIndex,
    beatCount,
    goToBeat,
    beatComplete,
  };
}
