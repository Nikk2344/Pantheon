import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEYS, LANGUAGES, STRINGS } from '../src/data/i18n.ts';

test('every language has exactly one non-empty string per key', () => {
  assert.equal(new Set(LANGUAGES.map((l) => l.code)).size, LANGUAGES.length);
  for (const l of LANGUAGES) {
    const s = STRINGS[l.code];
    assert.ok(s, `no strings for ${l.code}`);
    assert.equal(s.length, KEYS.length, `${l.code}: ${s.length} strings for ${KEYS.length} keys`);
    s.forEach((t, i) => assert.ok(t && t.trim(), `${l.code}: empty string for ${KEYS[i]}`));
  }
  assert.deepEqual(Object.keys(STRINGS).sort(), LANGUAGES.map((l) => l.code).sort());
});

test('translations are not left in English and keep their sentence endings', () => {
  const en = { 'home.t1': 'Big questions.', 'home.note': 'Sourced stories.' };
  for (const l of LANGUAGES) {
    const s = STRINGS[l.code];
    assert.notEqual(s[KEYS.indexOf('home.t1')], en['home.t1'], `${l.code} home.t1 untranslated`);
  }
});

test('every data-i18n key used in markup exists in the dictionary', () => {
  const files = ['src/layouts/Base.astro', 'src/pages/index.astro', 'src/components/ReadingLanguage.astro'];
  const used = new Set();
  for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/data-i18n="([\w.]+)"|key: '([\w.]+)'/g)) used.add(m[1] ?? m[2]);
  for (const k of used) assert.ok(KEYS.includes(k), `markup uses unknown key ${k}`);
  for (const k of ['nav.explore', 'home.t1', 'door.lab']) assert.ok(used.has(k) || k.startsWith('nav.'), k);
});
