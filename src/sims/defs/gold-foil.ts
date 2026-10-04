import { chip, clear, dot, fit, roundRect, text } from '../kernel/draw';
import { makeRng } from '../kernel/rng';
import type { Beat, ParamSpec, SimDef } from '../kernel/types';

/**
 * Geiger–Marsden, 1909 — a *re-enactment*.
 *
 * This is the mode the whole project is really for. Not "the atom has a
 * nucleus", stated as a fact to be memorised, but: here is the bench, here is
 * the beam, here is the screen, here is the thing nobody expected, and here is
 * the only conclusion left standing once you have seen it.
 *
 * The scattering is genuinely computed rather than animated by hand. Each
 * alpha gets an impact parameter sampled area-weighted (P ∝ b·db, as it must
 * be for a uniform beam on scattering centres) and is deflected through the
 * Rutherford angle
 *
 *     tan(θ/2) = d / 2b
 *
 * The constant d is tuned so that deflections past 90° come out around one in
 * eight thousand — the order of magnitude Geiger and Marsden actually
 * reported. That rarity is the entire point, so it is not fudged. It is also
 * why the re-enactment stages the backscatter on cue: in the real experiment
 * the two of them sat in a darkened room for weeks counting flashes by eye,
 * and the narration says so rather than pretending otherwise.
 */

/** Beam half-width in impact-parameter units. */
const W = 1;
/** Closest-approach constant. Sets how rare large deflections are. */
const D = 0.0225;

const FOIL_X = 0.46;
const SOURCE_X = 0.06;
const RING_R = 0.26;
const ALPHA_SPEED = 0.62;

/** Half the world height the drawing needs: the detector ring, plus headroom
 *  for the caption that sits above it. */
const VIEW_HY = RING_R + 0.06;

interface Alpha {
  x: number;
  y: number;
  vx: number;
  vy: number;
  theta: number;
  scattered: boolean;
  alive: boolean;
  trail: [number, number][];
  forced: boolean;
}

interface Flash {
  x: number;
  y: number;
  life: number;
  theta: number;
}

interface Counts {
  fired: number;
  straight: number;
  small: number;
  large: number;
  back: number;
}

interface State {
  t: number;
  alphas: Alpha[];
  flashes: Flash[];
  counts: Counts;
  bins: number[];
  emitting: boolean;
  emitAccum: number;
  showNucleus: boolean;
  forcePending: number;
  forceAt: number;
  lastBackAngle: number;
  rng: () => number;
}

/** Angle bins for the running histogram, in degrees. */
const BIN_EDGES = [0, 1, 5, 15, 45, 90, 180];
const BIN_LABELS = ['<1°', '1–5°', '5–15°', '15–45°', '45–90°', '>90°'];

const params = {
  rate: {
    label: 'Beam intensity',
    min: 10,
    max: 90,
    step: 5,
    value: 45,
    unit: 'α/s',
    hint: 'Geiger and Marsden counted individual scintillations by eye, in the dark.',
  },
} satisfies Record<string, ParamSpec>;

type P = typeof params;

function spawn(s: State, forced: boolean): void {
  // Beam profile — where the particle enters, purely cosmetic.
  const yOff = (s.rng() - 0.5) * 0.028;

  // Impact parameter. Area-weighted so small b is genuinely rare, which is
  // what makes large deflections genuinely rare.
  const b = forced ? D * 0.06 * (0.5 + s.rng()) : W * Math.sqrt(s.rng());
  const sign = s.rng() < 0.5 ? -1 : 1;
  const theta = 2 * Math.atan(D / (2 * Math.max(b, 1e-6))) * sign;

  s.alphas.push({
    x: SOURCE_X + 0.03,
    y: yOff,
    vx: ALPHA_SPEED,
    vy: 0,
    theta,
    scattered: false,
    alive: true,
    trail: [],
    forced,
  });
  s.counts.fired++;
}

function record(s: State, theta: number): void {
  const deg = Math.abs((theta * 180) / Math.PI);
  for (let i = 0; i < BIN_EDGES.length - 1; i++) {
    if (deg >= BIN_EDGES[i]! && deg < BIN_EDGES[i + 1]!) {
      s.bins[i] = (s.bins[i] ?? 0) + 1;
      break;
    }
  }
  if (deg >= 90) {
    s.counts.back++;
    s.lastBackAngle = deg;
  } else if (deg >= 15) s.counts.large++;
  else if (deg >= 1) s.counts.small++;
  else s.counts.straight++;
}

const beats: Beat<State>[] = [
  {
    title: 'The apparatus',
    narration:
      'Manchester, 1909. A speck of radium in a lead block throws alpha particles — helium nuclei, fast and heavy — through a slit and onto a leaf of metal beaten so thin it is translucent. Around it, a screen of zinc sulfide: every alpha that lands makes a pinprick flash, counted by eye in a blacked-out room.',
    onEnter: (s) => {
      s.emitting = false;
      s.showNucleus = false;
    },
    until: (s) => s.t > 2.6,
  },
  {
    title: 'What everyone expected',
    narration:
      "On the accepted model of the day, the atom's positive charge was smeared out through its whole volume — a soft pudding of charge with electrons dotted through it. Nothing that diffuse can shove a heavy, fast alpha particle far off course. The prediction was clear: the beam should punch through the foil essentially undisturbed.",
    onEnter: (s) => {
      s.emitting = true;
      s.showNucleus = false;
    },
    until: (s) => s.counts.fired > 240,
    insight:
      'And that is what the beam mostly does. Thousands pass clean through solid metal as if it were not there — which is itself remarkable, and was not the remarkable part.',
  },
  {
    title: 'The one that came back',
    narration:
      'Rutherford asked Marsden to check something nobody expected to find: whether any alpha particles came back toward the source. They sat counting flashes for weeks. About one in eight thousand did — a figure measured with a platinum reflector, the densest foil to hand. Gold, the metal this experiment is now named after, belongs to the systematic runs that followed. Watch the screen on the source side.',
    onEnter: (s) => {
      s.emitting = true;
      s.showNucleus = false;
      s.forcePending = 1;
      s.forceAt = s.t + 1.4;
    },
    until: (s) => s.counts.back >= 1,
    insight:
      '"It was almost as incredible as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you." A pudding of smeared charge cannot do this at any odds. To reverse something that heavy and that fast, the foil must contain something very small, very massive, and very concentrated.',
  },
  {
    title: 'What it forced him to conclude',
    narration:
      "Rutherford worked out what charge distribution would produce exactly the observed rate of large deflections. The answer: essentially all of the atom's mass and all of its positive charge, packed into a region at least ten thousand times smaller than the atom itself. The rest is empty — which is why almost everything sails through, and why the rare direct hit is violent.",
    onEnter: (s) => {
      s.emitting = false;
      s.showNucleus = true;
    },
    until: (s) => s.t > 3.2,
    insight:
      "The nuclear atom, deduced from counting faint flashes in a dark room. Rutherford published it in 1911 as a concentrated 'central charge'; he only began calling it the nucleus the year after.",
  },
];

const goldFoil: SimDef<State, P> = {
  id: 'gold-foil',
  title: 'The gold foil experiment — Geiger & Marsden, 1909',
  mode: 'reenactment',
  aspect: 16 / 9,
  params,

  init(_values, seed) {
    return {
      t: 0,
      alphas: [],
      flashes: [],
      counts: { fired: 0, straight: 0, small: 0, large: 0, back: 0 },
      bins: BIN_EDGES.slice(0, -1).map(() => 0),
      emitting: false,
      emitAccum: 0,
      showNucleus: false,
      forcePending: 0,
      forceAt: 0,
      lastBackAngle: 0,
      rng: makeRng(seed),
    };
  },

  step(s, dt, values) {
    s.t += dt;

    if (s.emitting) {
      s.emitAccum += dt;
      const interval = 1 / values.rate;
      while (s.emitAccum >= interval) {
        s.emitAccum -= interval;
        const forced = s.forcePending > 0 && s.t >= s.forceAt;
        if (forced) s.forcePending--;
        spawn(s, forced);
      }
    }

    for (const a of s.alphas) {
      if (!a.alive) continue;

      a.x += a.vx * dt;
      a.y += a.vy * dt;

      a.trail.push([a.x, a.y]);
      if (a.trail.length > 14) a.trail.shift();

      // The foil is thin, so scattering is a single event at the plane.
      if (!a.scattered && a.x >= FOIL_X) {
        a.scattered = true;
        const c = Math.cos(a.theta);
        const sn = Math.sin(a.theta);
        const vx = a.vx * c - a.vy * sn;
        const vy = a.vx * sn + a.vy * c;
        a.vx = vx;
        a.vy = vy;
      }

      // Reaching the detector screen makes a scintillation.
      const dx = a.x - FOIL_X;
      const dy = a.y;
      if (a.scattered && Math.hypot(dx, dy) >= RING_R) {
        a.alive = false;
        s.flashes.push({ x: a.x, y: a.y, life: 1, theta: a.theta });
        record(s, a.theta);
      }

      // Or it leaves the chamber entirely.
      if (a.x < -0.05 || a.x > 1.05 || Math.abs(a.y) > 0.5) a.alive = false;
    }

    if (s.alphas.length > 400) {
      s.alphas = s.alphas.filter((a) => a.alive);
    }

    for (const f of s.flashes) f.life -= dt * 0.9;
    if (s.flashes.length > 220) s.flashes.splice(0, s.flashes.length - 220);
  },

  draw(surface, s) {
    const { palette, width, height } = surface;
    const ctx = surface.ctx;
    clear(surface);

    // The world is the full beam line across, and the detector ring plus room
    // for its label vertically. Fitting to both axes is what keeps the ring
    // and its caption on screen when the window is not maximised.
    // `ref` is the world unit at the widest the article column ever gets, so
    // the fixed constants below render at their designed size on a desktop and
    // scale down from there.
    const { px, u, k } = fit(surface, { x0: 0, x1: 1, y0: -VIEW_HY, y1: VIEW_HY }, { ref: 620 });

    const [foilX, foilY] = px(FOIL_X, 0);

    // --- detector screen ---------------------------------------------------
    ctx.save();
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(foilX, foilY, RING_R * u, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    text(surface, 'zinc sulfide screen', foilX, foilY - RING_R * u - 10 * k, {
      size: 10 * k,
      weight: 600,
      color: 'rgba(52, 211, 153, 0.75)',
      align: 'center',
      baseline: 'bottom',
    });

    // --- scintillations ----------------------------------------------------
    for (const f of s.flashes) {
      if (f.life <= 0) continue;
      const [fx, fy] = px(f.x, f.y);
      const big = Math.abs((f.theta * 180) / Math.PI) >= 90;
      const color = big ? palette.hot : palette.good;
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life);
      dot(surface, fx, fy, (big ? 4.5 : 2.2) * k, color, (big ? 22 : 8) * k);
      if (big) {
        ctx.globalAlpha = f.life * 0.5;
        ctx.strokeStyle = palette.hot;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx, fy, ((1 - f.life) * 40 + 6) * k, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- source ------------------------------------------------------------
    const [sx, sy] = px(SOURCE_X, 0);
    ctx.save();
    ctx.fillStyle = '#2a3040';
    roundRect(ctx, { x: sx - 26 * k, y: sy - 26 * k, w: 40 * k, h: 52 * k }, 5 * k);
    ctx.fill();
    ctx.strokeStyle = '#3d465c';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    dot(surface, sx - 6 * k, sy, 4 * k, palette.hot, 14 * k);
    text(surface, 'radium (α)', sx - 6 * k, sy + 34 * k, {
      size: 10 * k,
      weight: 600,
      color: palette.muted,
      align: 'center',
      baseline: 'top',
    });
    text(surface, 'lead block', sx - 6 * k, sy + 47 * k, {
      size: 9 * k,
      color: palette.grid,
      align: 'center',
      baseline: 'top',
    });

    // --- gold foil ---------------------------------------------------------
    const foilH = 0.15 * u;
    ctx.save();
    const g = ctx.createLinearGradient(foilX - 3, 0, foilX + 3, 0);
    g.addColorStop(0, 'rgba(251,191,36,0.15)');
    g.addColorStop(0.5, 'rgba(251,191,36,0.95)');
    g.addColorStop(1, 'rgba(251,191,36,0.15)');
    ctx.fillStyle = g;
    ctx.fillRect(foilX - 2, foilY - foilH, 4, foilH * 2);
    ctx.restore();
    text(surface, 'gold foil', foilX, foilY + foilH + 12 * k, {
      size: 10 * k,
      weight: 600,
      color: palette.warm,
      align: 'center',
      baseline: 'top',
    });
    text(surface, 'beaten translucent', foilX, foilY + foilH + 25 * k, {
      size: 9 * k,
      color: palette.muted,
      align: 'center',
      baseline: 'top',
    });

    // --- alpha particles ---------------------------------------------------
    for (const a of s.alphas) {
      if (!a.alive) continue;
      const deg = Math.abs((a.theta * 180) / Math.PI);
      const notable = a.scattered && deg >= 15;
      const color = notable ? palette.hot : palette.warm;

      if (a.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = notable ? 2 : 1;
        ctx.lineCap = 'round';
        for (let i = 1; i < a.trail.length; i++) {
          ctx.globalAlpha = (i / a.trail.length) * (notable ? 0.9 : 0.4);
          const [x0, y0] = px(a.trail[i - 1]![0], a.trail[i - 1]![1]);
          const [x1, y1] = px(a.trail[i]![0], a.trail[i]![1]);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        ctx.restore();
      }

      const [ax, ay] = px(a.x, a.y);
      dot(surface, ax, ay, (notable ? 3 : 1.8) * k, color, (notable ? 14 : 4) * k);
    }

    // --- the conclusion overlay -------------------------------------------
    if (s.showNucleus) {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const R = Math.min(width, height) * 0.3;

      ctx.save();
      ctx.fillStyle = 'rgba(10, 12, 18, 0.86)';
      ctx.fillRect(0, 0, width, height);

      // The atom, to scale in spirit: electron cloud vs. the speck at centre.
      ctx.strokeStyle = 'rgba(56,189,248,0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      for (let i = 0; i < 8; i++) {
        const th = (i / 8) * Math.PI * 2 + s.t * 0.35;
        dot(surface, cx + Math.cos(th) * R, cy + Math.sin(th) * R, 2.5 * k, palette.cool, 8 * k);
      }

      dot(surface, cx, cy, 3.2 * k, palette.hot, 26 * k);

      text(surface, 'the nucleus', cx, cy - 16 * k, {
        size: 11 * k,
        weight: 700,
        color: palette.hot,
        align: 'center',
        baseline: 'bottom',
      });
      text(surface, 'all the mass, all the positive charge', cx, cy + 22 * k, {
        size: 10 * k,
        color: palette.muted,
        align: 'center',
        baseline: 'top',
      });
      text(surface, 'the atom', cx, cy - R - 12 * k, {
        size: 11 * k,
        weight: 700,
        color: palette.cool,
        align: 'center',
        baseline: 'bottom',
      });
      text(
        surface,
        'If the atom were a stadium, the nucleus would be a pea at the centre spot.',
        cx,
        height - 22 * k,
        { size: 11 * k, color: palette.ink, align: 'center', baseline: 'bottom' },
      );
      return;
    }

    // --- running histogram -------------------------------------------------
    const hw = Math.min(200 * k, width * 0.26);
    const hh = 58 * k;
    const hx = width - hw - 16 * k;
    const hy = height - hh - 30 * k;
    const maxBin = Math.max(1, ...s.bins);

    text(surface, 'DEFLECTION ANGLE  (log scale)', hx, hy - 8 * k, {
      size: 9 * k,
      weight: 700,
      color: palette.muted,
      baseline: 'bottom',
    });

    const bw = hw / s.bins.length;

    // Six labels under six narrow bars stop fitting well before the bars
    // themselves do. Measure once, and fall back to labelling only the ends —
    // which is all the axis really has to say: shallow on the left, violent on
    // the right.
    const labelSize = 8 * k;
    ctx.save();
    ctx.font = `500 ${labelSize}px 'Inter Variable', system-ui, sans-serif`;
    const widest = Math.max(...BIN_LABELS.map((l) => ctx.measureText(l).width));
    ctx.restore();
    const labelEvery = widest <= bw - 2;

    s.bins.forEach((c, i) => {
      const frac = c > 0 ? Math.log10(1 + c) / Math.log10(1 + maxBin) : 0;
      const bh = Math.max(c > 0 ? 2 : 0, frac * hh);
      const big = BIN_EDGES[i]! >= 45;
      ctx.save();
      ctx.fillStyle = big ? palette.hot : 'rgba(124, 134, 156, 0.55)';
      ctx.fillRect(hx + i * bw + 1.5, hy + hh - bh, bw - 3, bh);
      ctx.restore();

      const ends = i === 0 || i === s.bins.length - 1;
      if (!labelEvery && !ends) return;
      text(
        surface,
        BIN_LABELS[i]!,
        labelEvery ? hx + i * bw + bw / 2 : i === 0 ? hx : hx + hw,
        hy + hh + 4 * k,
        {
          size: labelSize,
          color: big ? palette.hot : palette.muted,
          align: labelEvery ? 'center' : i === 0 ? 'left' : 'right',
          baseline: 'top',
        },
      );
    });

    // --- tallies -----------------------------------------------------------
    text(surface, `α fired   ${s.counts.fired}`, 16 * k, 18 * k, {
      size: 11 * k,
      weight: 600,
      color: palette.ink,
      baseline: 'top',
      mono: true,
    });
    text(
      surface,
      `bounced back   ${s.counts.back}`,
      16 * k,
      34 * k,
      {
        size: 11 * k,
        weight: 600,
        color: s.counts.back > 0 ? palette.hot : palette.muted,
        baseline: 'top',
        mono: true,
      },
    );

    if (s.counts.back > 0) {
      chip(
        surface,
        `deflected ${s.lastBackAngle.toFixed(0)}°`,
        foilX,
        foilY - foilH - 22 * k,
        palette.hot,
        k,
      );
    }
  },

  readouts(s) {
    // Percentages are taken against particles that have actually reached the
    // screen, not against everything fired — a good fraction of which is still
    // in flight, and would otherwise make the shares silently fail to sum.
    const landed =
      s.counts.straight + s.counts.small + s.counts.large + s.counts.back;
    const pct = (n: number): string =>
      landed === 0 ? '—' : `${((n / landed) * 100).toFixed(2)}%`;
    return [
      { label: 'Alphas fired', value: String(s.counts.fired) },
      { label: 'Counted on screen', value: String(landed) },
      { label: 'Under 15°', value: pct(s.counts.straight + s.counts.small), tone: 'good' },
      { label: 'Over 15°', value: pct(s.counts.large), tone: 'warm' },
      { label: 'Bounced back', value: String(s.counts.back), tone: 'hot' },
    ];
  },

  equation:
    '\\tan\\frac{\\theta}{2} = \\frac{d}{2b} \\qquad\\text{so}\\qquad N(\\theta) \\propto \\frac{1}{\\sin^4(\\theta/2)}',
  notice:
    'The scattering here is computed, not choreographed: each alpha gets a random impact parameter and is deflected by the Rutherford angle it earns. Large deflections come out around one in eight thousand — the rate Geiger and Marsden actually measured. That rarity is the evidence. A diffuse atom would produce a narrow spray and nothing else; only something tiny, massive and hard at the centre produces a handful of violent reversals against a background of near-perfect transparency.',
  beats,
};

export default goldFoil;
