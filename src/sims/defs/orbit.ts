import { chip, clear, dot, text } from '../kernel/draw';
import type { ParamSpec, SimDef } from '../kernel/types';

/**
 * Newtonian gravity — a *sandbox* simulation.
 *
 * Newton's real achievement was not "gravity exists" but that a single inverse
 * square law, with no extra rules bolted on, reproduces *every* shape Kepler
 * had catalogued from observation. So this simulation gives the reader one
 * knob — launch speed — and lets them walk the whole family: circle, ellipse,
 * parabola, hyperbola. Nothing about the physics changes between them.
 *
 * The swept sectors and the constant angular-momentum readout are Kepler's
 * second law happening in front of you: the planet races at periapsis and
 * crawls at apoapsis, yet sweeps equal areas in equal times.
 */

const G = 1;
const R0 = 1;
/** Internal substeps: eccentric orbits move fast at periapsis and want a
 *  finer step there than the kernel's global timestep provides. */
const SUBSTEPS = 4;

interface Sector {
  pts: [number, number][];
  done: boolean;
}

interface State {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  trail: [number, number][];
  sectors: Sector[];
  sweepAccum: number;
  /** World units → pixels, fixed at init so the view doesn't jitter. */
  scale: number;
  /** World-space point to place at canvas centre. */
  cx: number;
  cy: number;
  /** Derived orbital elements, computed once from the initial conditions. */
  a: number;
  e: number;
  h: number;
  energy: number;
  bound: boolean;
  period: number;
  captured: boolean;
}

const params = {
  speed: {
    label: 'Launch speed',
    min: 0.3,
    max: 1.6,
    step: 0.01,
    value: 0.86,
    unit: '× circular',
    reinit: true,
    hint: 'Measured against the speed needed for a perfect circle. √2 ≈ 1.414 is escape velocity.',
  },
  angle: {
    label: 'Launch angle',
    min: -60,
    max: 60,
    step: 1,
    value: 0,
    unit: '°',
    reinit: true,
    hint: 'Tilt away from sideways-on. Kepler found orbits are ellipses however you aim.',
  },
  mass: {
    label: 'Star mass',
    min: 0.4,
    max: 2.5,
    step: 0.05,
    value: 1,
    unit: 'M☉',
    reinit: true,
    hint: 'Heavier star, stronger pull — and a shorter year.',
  },
} satisfies Record<string, ParamSpec>;

type P = typeof params;

/** Sweep one sector every this many simulated seconds. */
const SWEEP_INTERVAL = 0.45;

const orbit: SimDef<State, P> = {
  id: 'orbit',
  title: 'Gravity: one law, every orbit',
  mode: 'sandbox',
  aspect: 16 / 9,
  params,

  init(values) {
    const mu = G * values.mass;
    const vCirc = Math.sqrt(mu / R0);
    const v = vCirc * values.speed;
    const th = (values.angle * Math.PI) / 180;

    // Start to the right of the star, moving "upward" (tangential) by default.
    // Body starts to the right of the star. At angle 0 the velocity is purely
    // tangential (+y); the angle tilts it radially outward (+x).
    const x = R0;
    const y = 0;
    const vx = v * Math.sin(th);
    const vy = v * Math.cos(th);

    const r = Math.hypot(x, y);
    const v2 = vx * vx + vy * vy;
    const energy = v2 / 2 - mu / r;
    const h = x * vy - y * vx;

    // Eccentricity vector — points at periapsis, magnitude is e.
    const ex = (v2 / mu - 1 / r) * x - ((x * vx + y * vy) / mu) * vx;
    const ey = (v2 / mu - 1 / r) * y - ((x * vx + y * vy) / mu) * vy;
    const e = Math.hypot(ex, ey);

    const bound = energy < -1e-9;
    const a = bound ? -mu / (2 * energy) : Infinity;
    const period = bound ? 2 * Math.PI * Math.sqrt((a * a * a) / mu) : Infinity;

    // Frame the whole orbit: centre the ellipse, scale to fit apoapsis.
    let cx = 0;
    let cy = 0;
    let extent = R0 * 2.2;
    if (bound && e < 1) {
      const ux = e > 1e-9 ? ex / e : 1;
      const uy = e > 1e-9 ? ey / e : 0;
      cx = -a * e * ux;
      cy = -a * e * uy;
      extent = a * (1 + e) * 1.06;
    }

    return {
      x,
      y,
      vx,
      vy,
      t: 0,
      trail: [[x, y]],
      sectors: [{ pts: [[x, y]], done: false }],
      sweepAccum: 0,
      scale: 1 / extent,
      cx,
      cy,
      a,
      e,
      h,
      energy,
      bound,
      period,
      captured: false,
    };
  },

  step(s, dt, values) {
    const mu = G * values.mass;
    const h = dt / SUBSTEPS;

    for (let i = 0; i < SUBSTEPS; i++) {
      let r2 = s.x * s.x + s.y * s.y;
      // Softening: without it, a near-radial orbit hits the singularity and
      // the body is flung to infinity by a numerical artefact rather than by
      // physics. This keeps a grazing pass believable.
      const soft = 0.0016;
      let r = Math.sqrt(r2 + soft);
      let inv3 = 1 / (r * r * r);
      const ax = -mu * s.x * inv3;
      const ay = -mu * s.y * inv3;

      // Velocity Verlet — symplectic, so the orbit doesn't spiral in or out
      // from accumulated integration error the way naive Euler would.
      s.x += s.vx * h + 0.5 * ax * h * h;
      s.y += s.vy * h + 0.5 * ay * h * h;

      r2 = s.x * s.x + s.y * s.y;
      r = Math.sqrt(r2 + soft);
      inv3 = 1 / (r * r * r);
      const ax2 = -mu * s.x * inv3;
      const ay2 = -mu * s.y * inv3;

      s.vx += 0.5 * (ax + ax2) * h;
      s.vy += 0.5 * (ay + ay2) * h;
    }

    s.t += dt;

    // A bound orbit is framed once at init and stays put. An escaping one has
    // no fixed extent, so the view eases outward to keep the body in shot —
    // otherwise "this one never comes back" is delivered by the body simply
    // vanishing off the top edge two seconds in.
    if (!s.bound) {
      const r = Math.hypot(s.x, s.y);
      const want = 1 / Math.max(R0 * 2.2, r * 1.25);
      s.scale += (want - s.scale) * Math.min(1, dt * 1.5);
    }

    s.trail.push([s.x, s.y]);
    const maxTrail = s.bound ? 1400 : 700;
    if (s.trail.length > maxTrail) s.trail.shift();

    // Kepler's second law, made visible: close one sector and open the next
    // at a fixed cadence, so every shaded wedge covers the same elapsed time.
    const current = s.sectors[s.sectors.length - 1];
    if (current && !current.done) {
      current.pts.push([s.x, s.y]);
      if (current.pts.length > 400) current.pts.shift();
    }
    s.sweepAccum += dt;
    if (s.sweepAccum >= SWEEP_INTERVAL) {
      s.sweepAccum = 0;
      if (current) current.done = true;
      s.sectors.push({ pts: [[s.x, s.y]], done: false });
      if (s.sectors.length > 7) s.sectors.shift();
    }
  },

  draw(surface, s, values) {
    const { palette, width, height } = surface;
    const ctx = surface.ctx;
    clear(surface);

    const view = Math.min(width, height) * 0.44;
    const px = (wx: number, wy: number): [number, number] => [
      width / 2 + (wx - s.cx) * s.scale * view,
      height / 2 - (wy - s.cy) * s.scale * view,
    ];

    // Swept sectors, oldest faintest.
    s.sectors.forEach((sec, i) => {
      if (sec.pts.length < 3) return;
      const alpha = 0.06 + 0.05 * (i / Math.max(1, s.sectors.length - 1));
      ctx.save();
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha + 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const [sx, sy] = px(0, 0);
      ctx.moveTo(sx, sy);
      for (const [wx, wy] of sec.pts) {
        const [x, y] = px(wx, wy);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Trail, fading toward the past.
    if (s.trail.length > 1) {
      ctx.save();
      ctx.lineWidth = 1.75;
      ctx.lineCap = 'round';
      for (let i = 1; i < s.trail.length; i++) {
        const p0 = s.trail[i - 1]!;
        const p1 = s.trail[i]!;
        ctx.globalAlpha = (i / s.trail.length) * 0.85;
        ctx.strokeStyle = palette.cool;
        ctx.beginPath();
        const [x0, y0] = px(p0[0], p0[1]);
        const [x1, y1] = px(p1[0], p1[1]);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Periapsis / apoapsis markers for bound orbits.
    if (s.bound && s.e > 0.02 && s.e < 1) {
      const ux = s.cx === 0 && s.cy === 0 ? 1 : -s.cx / Math.hypot(s.cx, s.cy);
      const uy = s.cx === 0 && s.cy === 0 ? 0 : -s.cy / Math.hypot(s.cx, s.cy);
      const rp = s.a * (1 - s.e);
      const ra = s.a * (1 + s.e);
      const [pxp, pyp] = px(ux * rp, uy * rp);
      const [pxa, pya] = px(-ux * ra, -uy * ra);
      ctx.save();
      ctx.globalAlpha = 0.75;
      chip(surface, 'periapsis · fastest', pxp, pyp - 16, palette.warm);
      chip(surface, 'apoapsis · slowest', pxa, pya - 16, palette.muted);
      ctx.restore();
    }

    // The star.
    const [starX, starY] = px(0, 0);
    const starR = 6 + values.mass * 4;
    ctx.save();
    const grd = ctx.createRadialGradient(starX, starY, 0, starX, starY, starR * 5);
    grd.addColorStop(0, 'rgba(251, 191, 36, 0.5)');
    grd.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(starX, starY, starR * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    dot(surface, starX, starY, starR, palette.warm, 24);

    // The orbiting body, plus its velocity vector.
    const [bx, by] = px(s.x, s.y);
    const v = Math.hypot(s.vx, s.vy);
    if (v > 1e-6) {
      const len = 16 + Math.min(46, v * 26);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = palette.good;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (s.vx / v) * len, by - (s.vy / v) * len);
      ctx.stroke();
      ctx.restore();
    }
    dot(surface, bx, by, 5.5, palette.cool, 16);

    // Verdict on the trajectory, top-left.
    const kind =
      s.e < 0.02
        ? 'CIRCLE'
        : s.e < 0.98
          ? 'ELLIPSE'
          : s.e < 1.02
            ? 'PARABOLA — escaping'
            : 'HYPERBOLA — escaping';
    text(surface, kind, 16, 20, {
      size: 12,
      weight: 700,
      color: s.bound ? palette.cool : palette.hot,
      baseline: 'top',
    });
    text(
      surface,
      s.bound
        ? `eccentricity ${s.e.toFixed(3)} · year ${s.period.toFixed(2)} s`
        : 'this one never comes back',
      16,
      38,
      { size: 11, color: palette.muted, baseline: 'top' },
    );
    text(surface, 'equal areas = equal times', 16, height - 18, {
      size: 10,
      weight: 600,
      color: 'rgba(251, 191, 36, 0.8)',
      baseline: 'bottom',
    });
  },

  readouts(s, values) {
    const r = Math.hypot(s.x, s.y);
    const v = Math.hypot(s.vx, s.vy);
    const mu = G * values.mass;
    const hNow = s.x * s.vy - s.y * s.vx;
    const eNow = (v * v) / 2 - mu / Math.max(r, 1e-6);
    return [
      { label: 'Distance', value: r.toFixed(3), tone: 'plain' },
      { label: 'Speed', value: v.toFixed(3), tone: 'good' },
      // These two barely move while distance and speed swing wildly — that is
      // conservation of angular momentum and energy, measured live.
      { label: 'Ang. momentum', value: hNow.toFixed(4), tone: 'warm' },
      { label: 'Energy', value: eNow.toFixed(4), tone: 'cool' },
      { label: 'Eccentricity', value: s.e.toFixed(3) },
    ];
  },

  equation:
    'F = G\\frac{m_1 m_2}{r^2} \\qquad\\Longrightarrow\\qquad r(\\theta) = \\frac{a(1-e^2)}{1 + e\\cos\\theta}',
  notice:
    'Drag launch speed slowly upward. The orbit swells from a circle through ever-longer ellipses, and somewhere past 1.41× — √2, escape velocity — it stops closing and the body leaves for good. Nothing in the force law changed at that point; the same single equation produced all of it. Meanwhile watch "Ang. momentum" while distance and speed swing by a factor of ten: it barely moves. That constancy is why the shaded wedges all have the same area, which is what Kepler noticed eighty years before Newton explained it.',
};

export default orbit;
