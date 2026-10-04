/**
 * Reproduce the "animation is not in the right frame unless full screen" bug.
 *
 * Renders each simulation at a range of viewport widths and reports, per width,
 * whether anything was drawn outside the canvas — specifically whether the top
 * and bottom margins are empty. A sim that fits reports blank edge bands; a sim
 * that is clipping reports ink hard against the edge.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SHOT_DIR ?? 'C:/Users/Nikhil/Desktop/Deep Learning/pantheon/.shots/widths';
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:4321';

const WIDTHS = [1440, 1100, 900, 768, 640, 480, 380];

const SIMS = [
  { who: 'ernest-rutherford', anchor: '#discovery-3', name: 'gold-foil' },
  { who: 'marie-curie', anchor: '#discovery-1', name: 'decay' },
  { who: 'isaac-newton', anchor: '#discovery-1', name: 'orbit' },
];

/**
 * Scan the canvas edges. Returns how many pixels in from each edge you have to
 * go before the first non-background pixel — i.e. the real margin. 0 means ink
 * is touching the edge, which for these sims means something is being cut off.
 */
const EDGE_PROBE = () => {
  const c = document.querySelector('figure canvas');
  if (!c) return { error: 'no canvas' };
  const ctx = c.getContext('2d');
  const { width: W, height: H } = c;
  const d = ctx.getImageData(0, 0, W, H).data;
  const at = (x, y) => {
    const i = (y * W + x) * 4;
    return d[i] + d[i + 1] + d[i + 2];
  };
  // Background is the darkest thing on screen; treat clearly-lit pixels as ink.
  const bg = at(1, 1);
  const isInk = (x, y) => at(x, y) > bg + 42;
  const rowHasInk = (y) => {
    for (let x = 0; x < W; x += 2) if (isInk(x, y)) return true;
    return false;
  };
  const colHasInk = (x) => {
    for (let y = 0; y < H; y += 2) if (isInk(x, y)) return true;
    return false;
  };
  let top = 0;
  while (top < H && !rowHasInk(top)) top++;
  let bottom = 0;
  while (bottom < H && !rowHasInk(H - 1 - bottom)) bottom++;
  let left = 0;
  while (left < W && !colHasInk(left)) left++;
  let right = 0;
  while (right < W && !colHasInk(W - 1 - right)) right++;
  return { W, H, top, bottom, left, right };
};

const browser = await chromium.launch();

for (const sim of SIMS) {
  console.log(`\n=== ${sim.name} (${sim.who}) ===`);
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    try {
      await page.goto(`${BASE}/p/${sim.who}`, { waitUntil: 'networkidle' });
      await page.locator(sim.anchor).scrollIntoViewIfNeeded();
      await page.waitForSelector('figure canvas', { timeout: 20000 });
      await page.waitForTimeout(3500);
      const fig = page.locator('figure').filter({ has: page.locator('canvas') }).first();
      await fig.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const r = await page.evaluate(EDGE_PROBE);
      const flag = r.top === 0 || r.bottom === 0 || r.left === 0 || r.right === 0 ? '  <-- INK ON EDGE' : '';
      console.log(
        `  ${String(w).padStart(4)}px  canvas ${String(r.W).padStart(4)}x${String(r.H).padStart(3)}` +
          `  margins T${String(r.top).padStart(3)} B${String(r.bottom).padStart(3)}` +
          ` L${String(r.left).padStart(3)} R${String(r.right).padStart(3)}${flag}`,
      );
      await page.screenshot({ path: `${OUT}/${sim.name}-${w}.png`, clip: await fig.boundingBox() });
    } catch (e) {
      console.log(`  ${w}px  FAILED: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
}

await browser.close();
