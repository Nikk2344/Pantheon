/**
 * Visual smoke test.
 *
 * With every simulation painting to a canvas, "it compiled" proves very little
 * — a sim can typecheck perfectly and render an empty black rectangle. So this
 * drives a real browser, scrolls each simulation into view (they are
 * `client:visible`, so they do not exist in the DOM until you do), lets the
 * physics run, and then samples the canvas pixels to confirm something was
 * actually drawn. It also drives the controls and checks the readouts respond.
 *
 * Usage: node scripts/verify-visual.mjs   (with `npm run dev` already running)
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SHOT_DIR ?? '.shots/legacy';
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const errors = [];

/** Sample a canvas's pixels. A blank canvas reports one distinct colour. */
const CANVAS_PROBE = () => {
  const c = document.querySelector('figure canvas');
  if (!c) return { error: 'no canvas found' };
  const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const seen = new Set();
  let lit = 0;
  for (let i = 0; i < d.length; i += 4 * 53) {
    seen.add(`${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`);
    if (d[i] + d[i + 1] + d[i + 2] > 90) lit++;
  }
  return { w: c.width, h: c.height, distinctColours: seen.size, litSamples: lit };
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

const shot = async (name, box) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, ...(box ? { clip: box } : {}) });
  console.log(`     saved ${name}.png`);
};

const readouts = async (fig) =>
  (await fig.locator('dl').first().innerText()).replace(/\n/g, ' ').replace(/\s+/g, ' ');

/** Scroll the discovery into view, wait for the island to hydrate and paint. */
async function openSim(anchor, settleMs = 4000) {
  await page.locator(anchor).scrollIntoViewIfNeeded();
  await page.waitForSelector('figure canvas', { timeout: 20000 });
  await page.waitForTimeout(settleMs);
  const fig = page.locator('figure').filter({ has: page.locator('canvas') }).first();
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return fig;
}

// ---------------------------------------------------------------- homepage
console.log('\n=== homepage ===');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log('  title:', await page.title());
console.log('  h1:', (await page.locator('h1').first().innerText()).replace(/\n/g, ' '));
await shot('01-home-light');
await page.click('#theme-toggle');
await page.waitForTimeout(500);
await shot('02-home-dark');
await page.click('#theme-toggle');
await page.waitForTimeout(300);

// ------------------------------------------------------------ Curie / decay
console.log('\n=== Marie Curie — radioactive decay (sandbox) ===');
await page.goto(`${BASE}/p/marie-curie`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await shot('03-curie-hero');

let fig = await openSim('#discovery-1', 5000);
console.log('  heading:', await fig.locator('h3').first().innerText());
console.log('  canvas:', JSON.stringify(await page.evaluate(CANVAS_PROBE)));
console.log('  readouts:', await readouts(fig));
await shot('04-curie-decay', await fig.boundingBox());

// Long half-life: fewer atoms should have decayed by the same elapsed time.
await fig.locator('input[type=range]').first().fill('20');
await page.waitForTimeout(3500);
console.log('  after half-life=20s:', await readouts(fig));
await shot('05-curie-decay-slow', await fig.boundingBox());

// ---------------------------------------------------- Rutherford / gold foil
console.log('\n=== Ernest Rutherford — gold foil (re-enactment) ===');
await page.goto(`${BASE}/p/ernest-rutherford`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

fig = await openSim('#discovery-3', 3500);
console.log('  beat 1:', await fig.locator('h4').first().innerText());
await shot('06-foil-beat1', await fig.boundingBox());

for (const n of [2, 3, 4]) {
  const next = fig.getByRole('button', { name: /^Next$/ });
  if (!(await next.isEnabled().catch(() => false))) {
    console.log(`  beat ${n}: Next disabled — stopping`);
    break;
  }
  await next.click();
  // Beat 3 stages the backscatter on a delay; give it room to actually occur.
  await page.waitForTimeout(n === 3 ? 11000 : 5500);
  console.log(`  beat ${n}:`, await fig.locator('h4').first().innerText());
  console.log('     canvas:', JSON.stringify(await page.evaluate(CANVAS_PROBE)));
  console.log('     readouts:', await readouts(fig));
  const insight = fig.locator('p.border-l-2');
  if (await insight.count()) {
    console.log('     insight shown:', (await insight.first().innerText()).slice(0, 90) + '…');
  }
  await shot(`0${5 + n}-foil-beat${n}`, await fig.boundingBox());
}

// ------------------------------------------------------------ Newton / orbit
console.log('\n=== Isaac Newton — orbit (sandbox) ===');
await page.goto(`${BASE}/p/isaac-newton`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

fig = await openSim('#discovery-1', 5000);
console.log('  canvas:', JSON.stringify(await page.evaluate(CANVAS_PROBE)));
console.log('  readouts:', await readouts(fig));
await shot('10-newton-orbit', await fig.boundingBox());

await fig.locator('input[type=range]').first().fill('1.5');
await page.waitForTimeout(4500);
console.log('  after launch speed=1.5x (past escape):', await readouts(fig));
await shot('11-newton-escape', await fig.boundingBox());

await fig.locator('input[type=range]').first().fill('0.45');
await page.waitForTimeout(4500);
console.log('  after launch speed=0.45x (eccentric):', await readouts(fig));
await shot('12-newton-eccentric', await fig.boundingBox());

// ------------------------------------------------- Descartes / argument map
/**
 * The argument kernel has no canvas, so the equivalent of "did it paint?" is
 * "did rejecting a claim actually propagate?". The check below is the one
 * structural fact the whole interactive exists to demonstrate: refusing the
 * dream premise must bring down the thinking-thing conclusion and leave the
 * cogito standing. If that ever inverts, the argument has been mis-wired and
 * the page is quietly asserting something false.
 */
console.log('\n=== René Descartes — method of doubt (argument) ===');
await page.goto(`${BASE}/p/rene-descartes`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await shot('13-descartes-hero');

await page.locator('#discovery-1').scrollIntoViewIfNeeded();
const arg = page.locator('figure').filter({ hasText: 'Take it apart' }).first();
await arg.locator('li').first().waitFor({ timeout: 20000 });
await page.waitForTimeout(1200);
await arg.scrollIntoViewIfNeeded();

const claims = arg.locator('ol > li');
console.log('  claims:', await claims.count());
console.log('  verdict:', await arg.locator('p.mr-auto').innerText());
await shot('14-descartes-argument', await arg.boundingBox());

/** A claim's card text, by its P1/S2/C1 label. */
const card = (label) => claims.filter({ has: page.getByText(label, { exact: true }) }).first();
const fell = async (label) => (await card(label).locator('div').first().getAttribute('class')).includes('opacity-55');

// P3 is the dream premise; C1 the cogito; C2 the thinking thing.
await card('P3').getByRole('button', { name: 'Reject' }).click();
await page.waitForTimeout(700);
console.log('  rejected P3 (the dream) →');
console.log('     C1 (cogito) down?        ', await fell('C1'), '(expected false)');
console.log('     C2 (thinking thing) down?', await fell('C2'), '(expected true)');
console.log('     verdict:', await arg.locator('p.mr-auto').innerText());
if (await fell('C1')) errors.push('[argument] rejecting the dream premise brought down the cogito');
if (!(await fell('C2'))) errors.push('[argument] rejecting the dream premise left the thinking thing standing');
await shot('15-descartes-dream-rejected', await arg.boundingBox());

await arg.getByRole('button', { name: "What's load-bearing?" }).click();
await page.waitForTimeout(500);
const bearing = await claims
  .filter({ hasText: 'Load-bearing' })
  .allInnerTexts()
  .then((t) => t.map((s) => s.split('\n')[0]));
console.log('  load-bearing for the cogito:', bearing.join(', '), '(expected P5, P6)');
await shot('16-descartes-load-bearing', await arg.boundingBox());

await arg.getByRole('button', { name: 'Grant it all again' }).click();
await page.waitForTimeout(500);

// Objections: the reply is withheld until pressed, so pressing must reveal it.
const objection = arg.locator('li').filter({ hasText: 'Hobbes' }).first();
console.log('  objection replies visible before pressing:', await arg.getByText('He answered —').count());
await objection.getByRole('button', { name: 'Press it' }).click();
await page.waitForTimeout(700);
console.log('  after pressing Hobbes →');
console.log('     reply revealed:', await objection.getByText('He answered —').isVisible());
console.log('     C2 down?', await fell('C2'), '(expected true)');
if (!(await objection.getByText('He answered —').isVisible())) {
  errors.push('[argument] pressing an objection did not reveal the reply');
}
await objection.scrollIntoViewIfNeeded();
await shot('17-descartes-hobbes-pressed', await arg.boundingBox());

// ------------------------------------------------------------- other pages
await page.goto(`${BASE}/philosophers`, { waitUntil: 'networkidle' });
await shot('18-philosophers');
await page.goto(`${BASE}/scientists`, { waitUntil: 'networkidle' });
await shot('19-scientists');

console.log('\n=== console / page errors ===');
console.log(errors.length === 0 ? '  none' : errors.map((e) => '  ' + e).join('\n'));

await browser.close();
if (errors.length) process.exitCode = 1;
