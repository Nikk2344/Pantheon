import { axes, chip, clear, dot, inset, splitH, text } from '../kernel/draw';
import { makeRng } from '../kernel/rng';
import type { ParamSpec, SimDef } from '../kernel/types';

/**
 * Radioactive decay — a *sandbox* simulation.
 *
 * The point being made: every individual atom decays at a completely
 * unpredictable moment, and nothing about the atom's past changes its odds.
 * Yet a few hundred of them together trace a curve so precise you can date a
 * fossil with it. Watching the left panel (chaos) and the right panel (law)
 * move together is the whole lesson, and it is not something a static diagram
 * can deliver.
 */

interface Atom {
  x: number;
  y: number;
  decayed: boolean;
  /** 1 → 0 flash envelope in the moments after decaying. */
  flash: number;
  /** Direction the emitted particle flies off in. */
  dir: number;
}

interface State {
  atoms: Atom[];
  t: number;
  /** Sampled [time, count-remaining] pairs for the plot. */
  history: [number, number][];
  sampleAccum: number;
  rng: () => number;
  n0: number;
}

const params = {
  halfLife: {
    label: 'Half-life',
    min: 1,
    max: 20,
    step: 0.5,
    value: 6,
    unit: 's',
    hint: 'Time for half of whatever remains to decay — no matter when you start counting.',
  },
  count: {
    label: 'Atoms',
    min: 50,
    max: 600,
    step: 50,
    value: 400,
    reinit: true,
    hint: 'More atoms, smoother curve. This is the law of large numbers, visible.',
  },
} satisfies Record<string, ParamSpec>;

type P = typeof params;

const decay: SimDef<State, P> = {
  id: 'radioactive-decay',
  title: 'Radioactive decay and half-life',
  mode: 'sandbox',
  aspect: 16 / 8,
  params,

  init(values, seed) {
    const rng = makeRng(seed);
    const n = Math.round(values.count);
    const atoms: Atom[] = Array.from({ length: n }, () => ({
      x: 0,
      y: 0,
      decayed: false,
      flash: 0,
      dir: rng() * Math.PI * 2,
    }));
    return { atoms, t: 0, history: [[0, n]], sampleAccum: 0, rng, n0: n };
  },

  step(s, dt, values) {
    const lambda = Math.LN2 / values.halfLife;
    // Probability that a given surviving atom decays within this timestep.
    // Exact rather than the linear approximation, so large timesteps stay honest.
    const pDecay = 1 - Math.exp(-lambda * dt);

    let remaining = 0;
    for (const a of s.atoms) {
      if (a.decayed) {
        if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 1.6);
        continue;
      }
      // The memoryless step: an atom that has survived an hour is exactly as
      // likely to decay in the next second as a freshly created one.
      if (s.rng() < pDecay) {
        a.decayed = true;
        a.flash = 1;
      } else {
        remaining++;
      }
    }

    s.t += dt;
    s.sampleAccum += dt;
    if (s.sampleAccum >= 0.05) {
      s.sampleAccum = 0;
      s.history.push([s.t, remaining]);
      if (s.history.length > 4000) s.history.shift();
    }
  },

  draw(surface, s, values) {
    const { palette, width, height } = surface;
    clear(surface);

    const pad = inset({ x: 0, y: 0, w: width, h: height }, 16);
    const [left, right] = splitH(pad, 0.44, 20);

    // --- left: the sample itself ------------------------------------------
    text(surface, 'THE SAMPLE', left.x, left.y + 2, {
      size: 10,
      weight: 700,
      color: palette.muted,
      baseline: 'top',
    });

    const field = inset(left, 24, 0, 0, 0);
    const n = s.atoms.length;
    const cols = Math.max(1, Math.ceil(Math.sqrt((n * field.w) / Math.max(field.h, 1))));
    const rows = Math.ceil(n / cols);
    const cw = field.w / cols;
    const ch = field.h / rows;
    const r = Math.max(1.6, Math.min(cw, ch) * 0.24);

    s.atoms.forEach((a, i) => {
      const cx = field.x + (i % cols) * cw + cw / 2;
      const cy = field.y + Math.floor(i / cols) * ch + ch / 2;
      a.x = cx;
      a.y = cy;

      if (!a.decayed) {
        dot(surface, cx, cy, r, palette.cool, r * 1.6);
        return;
      }

      // A decayed nucleus leaves a dim husk behind.
      surface.ctx.save();
      surface.ctx.globalAlpha = 0.28;
      dot(surface, cx, cy, r * 0.72, palette.muted);
      surface.ctx.restore();

      if (a.flash > 0) {
        const f = a.flash;
        // Expanding shell...
        surface.ctx.save();
        surface.ctx.globalAlpha = f * 0.6;
        surface.ctx.strokeStyle = palette.hot;
        surface.ctx.lineWidth = 1.5;
        surface.ctx.beginPath();
        surface.ctx.arc(cx, cy, r + (1 - f) * 14, 0, Math.PI * 2);
        surface.ctx.stroke();
        surface.ctx.restore();
        // ...and the emitted particle leaving the scene.
        const d = (1 - f) * 16;
        surface.ctx.save();
        surface.ctx.globalAlpha = f;
        dot(
          surface,
          cx + Math.cos(a.dir) * d,
          cy + Math.sin(a.dir) * d,
          Math.max(1, r * 0.5),
          palette.hot,
          6,
        );
        surface.ctx.restore();
      }
    });

    const remaining = s.atoms.reduce((acc, a) => acc + (a.decayed ? 0 : 1), 0);

    // --- right: the curve --------------------------------------------------
    text(surface, 'THE POPULATION', right.x, right.y + 2, {
      size: 10,
      weight: 700,
      color: palette.muted,
      baseline: 'top',
    });

    const spanT = Math.max(values.halfLife * 5, 1);
    const xMax = Math.max(spanT, Math.ceil(s.t / spanT) * spanT);

    const plot = axes(surface, {
      rect: inset(right, 22, 0, 0, 0),
      xLabel: 'time (s)',
      yLabel: 'nuclei remaining',
      xMax,
      yMax: s.n0,
      xTicks: 5,
      yTicks: 4,
      fmtX: (v) => v.toFixed(0),
    });

    // The theoretical curve the ensemble is obliged to follow.
    const lambda = Math.LN2 / values.halfLife;
    const ideal: [number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const tt = (xMax * i) / 120;
      ideal.push([tt, s.n0 * Math.exp(-lambda * tt)]);
    }
    plot.line(ideal, palette.muted, 1.5);

    // Successive halvings — the visual signature of exponential decay.
    for (let k = 1; k <= 4; k++) {
      const th = values.halfLife * k;
      if (th > xMax) break;
      plot.vRule(th, palette.muted, k === 1 ? 't½' : `${k}t½`);
      plot.hRule(s.n0 / 2 ** k, palette.grid);
    }

    plot.area(s.history, 'rgba(56, 189, 248, 0.10)');
    plot.line(s.history, palette.cool, 2);
    if (s.history.length > 0) plot.mark(s.t, remaining, palette.cool, 3.5);

    chip(
      surface,
      'measured',
      plot.inner.x + plot.inner.w - 96,
      plot.inner.y + 12,
      palette.cool,
    );
    chip(
      surface,
      'predicted',
      plot.inner.x + plot.inner.w - 30,
      plot.inner.y + 12,
      palette.muted,
    );
  },

  readouts(s, values) {
    const remaining = s.atoms.reduce((acc, a) => acc + (a.decayed ? 0 : 1), 0);
    const lambda = Math.LN2 / values.halfLife;
    return [
      { label: 'Elapsed', value: `${s.t.toFixed(1)} s` },
      { label: 'Remaining', value: String(remaining), tone: 'cool' },
      { label: 'Decayed', value: String(s.n0 - remaining), tone: 'hot' },
      { label: 'Half-lives', value: (s.t / values.halfLife).toFixed(2) },
      {
        label: 'Activity',
        value: `${(lambda * remaining).toFixed(1)} /s`,
        tone: 'warm',
      },
    ];
  },

  equation: 'N(t) = N_0\\,e^{-\\lambda t}, \\qquad \\lambda = \\frac{\\ln 2}{t_{1/2}}',
  notice:
    'No atom on the left knows what time it is — each one decays at a moment nothing can predict, and an atom that has already survived an hour is no more "due" than a fresh one. Yet on the right, hundreds of those coin-flips add up to a curve so reliable it dates rocks. Turn the atom count down to 50 and watch the curve get visibly noisy: the law is a crowd effect, not a property of any single nucleus.',
};

export default decay;
