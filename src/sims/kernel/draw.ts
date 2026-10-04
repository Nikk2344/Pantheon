/**
 * Shared drawing primitives.
 *
 * Half of understanding a physical process is watching a graph move while the
 * thing itself moves. Rather than let every simulation re-invent axes, tick
 * labels and clipping, they live here once. This file is the reason a new
 * simulation is mostly physics and barely any painting.
 *
 * All coordinates are CSS pixels — the kernel has already applied the device
 * pixel ratio transform, so nothing here needs to know about retina displays.
 */

import type { Surface } from './types';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Inset a rect by a uniform (or per-side) padding. */
export function inset(r: Rect, all: number, bottom = all, left = all, right = all): Rect {
  return { x: r.x + left, y: r.y + all, w: r.w - left - right, h: r.h - all - bottom };
}

/** Split a rect into left/right halves with a gutter between them. */
export function splitH(r: Rect, leftFraction: number, gutter = 16): [Rect, Rect] {
  const lw = (r.w - gutter) * leftFraction;
  return [
    { x: r.x, y: r.y, w: lw, h: r.h },
    { x: r.x + lw + gutter, y: r.y, w: r.w - lw - gutter, h: r.h },
  ];
}

export function clear({ ctx, width, height, palette }: Surface): void {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// Fitting a world into the canvas
// ---------------------------------------------------------------------------

/** The world-space region a simulation needs to be able to see. */
export interface ViewBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface View {
  /** Map world coordinates to canvas pixels. */
  px(wx: number, wy: number): [number, number];
  /** One world unit, in pixels. */
  u: number;
  /**
   * Scale factor for fixed-size furniture — label offsets, apparatus drawn in
   * pixels, font sizes. Multiply every hard-coded pixel constant by this.
   */
  k: number;
}

/**
 * Fit a world-space box into the surface, preserving aspect ratio and centring
 * what is left over.
 *
 * The bug this exists to prevent: scaling positions by `width` alone. The
 * canvas is 16:9, so its height is a little over half its width — a world that
 * is as tall as it is wide silently loses its top and bottom the moment anyone
 * looks at the page in a narrower window. Fitting to *both* dimensions is the
 * only way the same drawing code holds at every size.
 *
 * The second half of the problem is that positions scaling while labels and
 * apparatus stay a fixed pixel size is just as broken — the furniture grows to
 * swallow the frame as the canvas shrinks. So `k` comes back alongside the
 * mapper, and the rule for simulation authors is: every literal pixel value in
 * a `draw` gets multiplied by `k`.
 *
 * `ref` is the world-unit size at which the fixed constants were chosen, and
 * `minK` stops text shrinking into illegibility on a phone.
 */
export function fit(
  s: Surface,
  box: ViewBox,
  { ref = 700, minK = 0.66 }: { ref?: number; minK?: number } = {},
): View {
  const w = Math.max(1e-6, box.x1 - box.x0);
  const h = Math.max(1e-6, box.y1 - box.y0);
  const u = Math.min(s.width / w, s.height / h);
  // Centre the fitted world in whatever the canvas actually is.
  const ox = (s.width - w * u) / 2 - box.x0 * u;
  const oy = (s.height - h * u) / 2 - box.y0 * u;
  return {
    u,
    k: Math.max(minK, Math.min(1, u / ref)),
    px: (wx, wy) => [ox + wx * u, oy + wy * u],
  };
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  radius = 8,
): void {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
}

/** Faint reference grid. Gives the eye a sense of scale without competing. */
export function grid(s: Surface, r: Rect, cell = 40): void {
  const { ctx, palette } = s;
  ctx.save();
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = r.x; x <= r.x + r.w + 0.5; x += cell) {
    ctx.moveTo(Math.round(x) + 0.5, r.y);
    ctx.lineTo(Math.round(x) + 0.5, r.y + r.h);
  }
  for (let y = r.y; y <= r.y + r.h + 0.5; y += cell) {
    ctx.moveTo(r.x, Math.round(y) + 0.5);
    ctx.lineTo(r.x + r.w, Math.round(y) + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

export interface TextOpts {
  size?: number;
  weight?: number;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  mono?: boolean;
}

export function text(
  s: Surface,
  str: string,
  x: number,
  y: number,
  opts: TextOpts = {},
): void {
  const { ctx, palette } = s;
  const {
    size = 12,
    weight = 500,
    color = palette.muted,
    align = 'left',
    baseline = 'alphabetic',
    mono = false,
  } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px ${
    mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : "'Inter Variable', system-ui, sans-serif"
  }`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** A small caption chip — used to label parts of an apparatus. Pass the `k`
 *  from `fit()` so it shrinks with the canvas instead of swallowing it. */
export function chip(
  s: Surface,
  str: string,
  x: number,
  y: number,
  color?: string,
  k = 1,
): void {
  const { ctx, palette } = s;
  ctx.save();
  ctx.font = `600 ${11 * k}px 'Inter Variable', system-ui, sans-serif`;
  const w = ctx.measureText(str).width + 14 * k;
  const h = 20 * k;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, { x: x - w / 2, y: y - h / 2, w, h }, 6 * k);
  ctx.fill();
  ctx.fillStyle = color ?? palette.muted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y + 0.5);
  ctx.restore();
}

export function arrow(
  s: Surface,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
): void {
  const { ctx } = s;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 8;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A filled dot with an optional soft halo — the workhorse for particles. */
export function dot(
  s: Surface,
  x: number,
  y: number,
  r: number,
  color: string,
  glow = 0,
): void {
  const { ctx } = s;
  ctx.save();
  if (glow > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Plotting
// ---------------------------------------------------------------------------

export interface PlotSpec {
  rect: Rect;
  xLabel: string;
  yLabel: string;
  xMax: number;
  yMax: number;
  xMin?: number;
  yMin?: number;
  /** Number of labelled ticks per axis. */
  xTicks?: number;
  yTicks?: number;
  /** Format tick values for display. */
  fmtX?: (v: number) => string;
  fmtY?: (v: number) => string;
}

export interface Plot {
  /** Map data coordinates to canvas pixels. */
  px(x: number, y: number): [number, number];
  /** Draw a polyline through data-space points. */
  line(points: readonly (readonly [number, number])[], color: string, width?: number): void;
  /** Fill the area under a data-space polyline. */
  area(points: readonly (readonly [number, number])[], color: string): void;
  /** A dashed horizontal reference line (e.g. the half-way mark). */
  hRule(y: number, color: string, label?: string): void;
  /** A dashed vertical reference line (e.g. one half-life). */
  vRule(x: number, color: string, label?: string): void;
  /** A single marked data point. */
  mark(x: number, y: number, color: string, r?: number): void;
  /** The plot's inner drawing area, in pixels. */
  inner: Rect;
}

/**
 * Draw axes, frame and gridlines, and return a small object that maps data
 * coordinates into pixels. Simulations then plot in physical units and never
 * touch pixel arithmetic.
 */
export function axes(s: Surface, spec: PlotSpec): Plot {
  const { ctx, palette } = s;
  const { rect, xMin = 0, yMin = 0, xMax, yMax } = spec;
  const padL = 44;
  const padB = 30;
  const padT = 18;
  const padR = 12;
  const inner: Rect = {
    x: rect.x + padL,
    y: rect.y + padT,
    w: Math.max(10, rect.w - padL - padR),
    h: Math.max(10, rect.h - padT - padB),
  };

  const px = (x: number, y: number): [number, number] => [
    inner.x + ((x - xMin) / (xMax - xMin || 1)) * inner.w,
    inner.y + inner.h - ((y - yMin) / (yMax - yMin || 1)) * inner.h,
  ];

  const xTicks = spec.xTicks ?? 4;
  const yTicks = spec.yTicks ?? 4;
  const fmtX = spec.fmtX ?? ((v: number) => String(Math.round(v)));
  const fmtY = spec.fmtY ?? ((v: number) => String(Math.round(v)));

  ctx.save();

  // Gridlines
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= yTicks; i++) {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    const [, y] = px(xMin, v);
    ctx.moveTo(inner.x, Math.round(y) + 0.5);
    ctx.lineTo(inner.x + inner.w, Math.round(y) + 0.5);
  }
  for (let i = 0; i <= xTicks; i++) {
    const v = xMin + ((xMax - xMin) * i) / xTicks;
    const [x] = px(v, yMin);
    ctx.moveTo(Math.round(x) + 0.5, inner.y);
    ctx.lineTo(Math.round(x) + 0.5, inner.y + inner.h);
  }
  ctx.stroke();

  // Tick labels
  for (let i = 0; i <= yTicks; i++) {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    const [, y] = px(xMin, v);
    text(s, fmtY(v), inner.x - 8, y, {
      align: 'right',
      baseline: 'middle',
      size: 10,
      color: palette.muted,
      mono: true,
    });
  }
  for (let i = 0; i <= xTicks; i++) {
    const v = xMin + ((xMax - xMin) * i) / xTicks;
    const [x] = px(v, yMin);
    text(s, fmtX(v), x, inner.y + inner.h + 8, {
      align: 'center',
      baseline: 'top',
      size: 10,
      color: palette.muted,
      mono: true,
    });
  }

  // Axis titles
  text(s, spec.xLabel, inner.x + inner.w, inner.y + inner.h + 22, {
    align: 'right',
    baseline: 'top',
    size: 10,
    weight: 600,
    color: palette.muted,
  });
  text(s, spec.yLabel, inner.x - 34, inner.y - 8, {
    align: 'left',
    baseline: 'bottom',
    size: 10,
    weight: 600,
    color: palette.muted,
  });

  ctx.restore();

  const clipped = (fn: () => void): void => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(inner.x, inner.y, inner.w, inner.h);
    ctx.clip();
    fn();
    ctx.restore();
  };

  return {
    inner,
    px,
    line(points, color, width = 2) {
      if (points.length < 2) return;
      clipped(() => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        points.forEach(([dx, dy], i) => {
          const [x, y] = px(dx, dy);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    },
    area(points, color) {
      if (points.length < 2) return;
      clipped(() => {
        ctx.fillStyle = color;
        ctx.beginPath();
        const [x0, y0] = px(points[0]![0], points[0]![1]);
        ctx.moveTo(x0, y0);
        for (const [dx, dy] of points.slice(1)) {
          const [x, y] = px(dx, dy);
          ctx.lineTo(x, y);
        }
        const last = points[points.length - 1]!;
        ctx.lineTo(px(last[0], yMin)[0], px(last[0], yMin)[1]);
        ctx.lineTo(x0, px(points[0]![0], yMin)[1]);
        ctx.closePath();
        ctx.fill();
      });
    },
    hRule(y, color, label) {
      clipped(() => {
        const [, cy] = px(xMin, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(inner.x, cy);
        ctx.lineTo(inner.x + inner.w, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        if (label) {
          text(s, label, inner.x + 6, cy - 5, { size: 10, color, weight: 600 });
        }
      });
    },
    vRule(x, color, label) {
      clipped(() => {
        const [cx] = px(x, yMin);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, inner.y);
        ctx.lineTo(cx, inner.y + inner.h);
        ctx.stroke();
        ctx.setLineDash([]);
        if (label) {
          // Along the bottom axis rather than the top: the top is where a
          // legend or a decaying curve usually is, and they collided.
          text(s, label, cx + 5, inner.y + inner.h - 6, {
            size: 10,
            color,
            weight: 600,
          });
        }
      });
    },
    mark(x, y, color, r = 3.5) {
      clipped(() => {
        const [cx, cy] = px(x, y);
        dot(s, cx, cy, r, color, 8);
      });
    },
  };
}
