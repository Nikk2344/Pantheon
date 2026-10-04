/**
 * Fetch subject portraits from Wikimedia Commons.
 *
 * These are photographs and paintings of real people, and almost all of them
 * are public domain by age — but "almost all" is not "all", and the licence
 * that makes them free to use generally asks for attribution in return. So
 * this script records the licence and credit alongside every file, and the
 * profile page renders it. Getting that right costs one API call per person.
 *
 * Usage:  node scripts/fetch-portraits.mjs [id ...]
 *         (no arguments = every id in scripts/portraits.json)
 *
 * Output: src/assets/portraits/<id>.jpg   — optimised at build by Astro
 *         src/data/portraits.json         — credit + licence per id
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_DIR = resolve(root, 'src/assets/portraits');
const DATA_FILE = resolve(root, 'src/data/portraits.json');
const MANIFEST = resolve(root, 'scripts/portraits.json');

const UA = 'ThePantheon/0.1 (educational project; contact: local)';

/** Strip the HTML Commons returns in its metadata fields. */
function plain(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function request(url) {
  for(let attempt=0;attempt<4;attempt++) {
    const res = await fetch(url, {headers:{'User-Agent':UA},signal:AbortSignal.timeout(30000)});
    if((res.status!==429 && res.status<500) || attempt===3)return res;
    await res.body?.cancel();
    await new Promise(r=>setTimeout(r,Math.min(15000,3000*(attempt+1))));
  }
}
async function getJson(url) {
  const res = await request(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

/** Page summary → the lead image, which is the canonical portrait. */
async function lead(title) {
  const data = await getJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  const src = data?.originalimage?.source ?? data?.thumbnail?.source;
  if (!src) throw new Error(`no lead image for "${title}"`);
  // The API decorates URLs with analytics params; the bare URL is the file.
  const clean = src.split('?')[0];
  // Wikipedia sometimes returns a generated thumbnail even as originalimage.
  // Its final segment is not a Commons file title (e.g. 3840px-Name.jpg).
  const segments = clean.split('/');
  const file = decodeURIComponent(segments.includes('thumb') ? segments.at(-2) : segments.at(-1));
  return { url: clean, file, description: data.description ?? '' };
}

/** Commons metadata → who made it and under what licence. */
async function licence(fileName) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=imageinfo&iiprop=extmetadata|url&titles=File:${encodeURIComponent(fileName)}`;
  try {
    const data = await getJson(url);
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const meta = page?.imageinfo?.[0]?.extmetadata ?? {};
    return {
      credit: plain(meta.Artist?.value) || 'Unknown',
      license: plain(meta.LicenseShortName?.value) || 'See source',
      sourceUrl: page?.imageinfo?.[0]?.descriptionurl ?? `https://commons.wikimedia.org/wiki/File:${fileName}`,
    };
  } catch {
    return {
      credit: 'Unknown',
      license: 'See source',
      sourceUrl: `https://commons.wikimedia.org/wiki/File:${fileName}`,
    };
  }
}

async function download(url, dest) {
  const res = await request(url);
  if (!res.ok) throw new Error(`${res.status} downloading ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const wanted = process.argv.slice(2);
  const ids = wanted.length > 0 ? wanted : Object.keys(manifest);

  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(dirname(DATA_FILE), { recursive: true });

  let existing = {};
  try {
    existing = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    /* first run */
  }

  let failed = false;
  for (const id of ids) {
    const title = manifest[id];
    if (!title) {
      console.warn(`  ! ${id}: not in scripts/portraits.json — skipped`);
      continue;
    }
    try {
      const { url, file, description } = await lead(title);
      const ext = /\.(jpe?g|png)$/i.exec(file)?.[1]?.toLowerCase() ?? 'jpg';
      const name = `${id}.${ext === 'jpeg' ? 'jpg' : ext}`;
      const bytes = await download(url, resolve(IMAGE_DIR, name));
      const cred = await licence(file);
      existing[id] = { file: name, description, ...cred, wikipedia: `https://en.wikipedia.org/wiki/${title}` };
      console.log(`  ✓ ${id}  ${name}  ${(bytes / 1024).toFixed(0)} KB  [${cred.license}]`);
    } catch (err) {
      failed = true;
      console.error(`  ✗ ${id}: ${err.message}`);
    }
    // Be a good citizen with a shared free API.
    await new Promise((r) => setTimeout(r, 2000));
  }

  await writeFile(DATA_FILE, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(`\nWrote ${DATA_FILE}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
