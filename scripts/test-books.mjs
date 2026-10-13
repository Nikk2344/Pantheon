import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const frontmatter = (path) => {
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'));
  assert.ok(m, `${path}: no frontmatter`);
  return JSON.parse(m[1]);
};
const bookIds = readdirSync('src/content/books').filter((f) => f.endsWith('.mdx')).map((f) => f.replace('.mdx', ''));
const norm = (t) => t.toLowerCase().replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();

test('books are complete and cross-references resolve', () => {
  assert.ok(bookIds.length >= 100);
  for (const id of bookIds) {
    const b = frontmatter(`src/content/books/${id}.mdx`);
    assert.equal(b.keyIdeas.length, 3, `${id}: needs exactly 3 key ideas`);
    assert.ok(b.sources.length >= 2, `${id}: needs 2+ sources`);
    assert.ok(b.caveat && b.whereToStart && b.whyItMatters, `${id}: missing required text`);
    for (const s of b.sources) assert.equal(new URL(s.url).protocol, 'https:', `${id}: non-https source`);
    for (const p of [...b.authorIds, ...b.related]) assert.ok(existsSync(`src/content/people/${p}.mdx`), `${id}: unknown person ${p}`);
  }
});

test('no two books share a normalised title and author', () => {
  const seen = new Map();
  for (const id of bookIds) {
    const b = frontmatter(`src/content/books/${id}.mdx`);
    const t = `${norm(b.title.split(':')[0])} | ${norm(b.author)}`;
    assert.ok(!seen.has(t), `duplicate title "${t}": ${seen.get(t)} and ${id}`);
    seen.set(t, id);
  }
});
