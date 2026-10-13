# Content batch brief (read fully before writing)

The Pantheon is a sourced, accuracy-first learning site. A wrong or invented fact is worse than a missing entry.
Existing people live in `src/content/people/*.mdx` (ids = filenames). Read 2-3 of them and `scripts/catalogue-mathematicians.mjs`
to see the house style: precise, hedged where the record is uncertain, no hype, no invented quotes, no sole-inventor myths.

## Hard rules
1. **Verify before writing.** Use WebSearch/WebFetch. Dates, works, and claims must be checkable. If uncertain, hedge ("c.", "traditionally attributed", "disputed") or leave it out.
2. **Every source URL must return HTTP 200.** Check each with `curl -s -o /dev/null -w "%{http_code}" -L URL`. Prefer MacTutor (mathshistory.st-andrews.ac.uk), Stanford Encyclopedia (plato.stanford.edu), IEP (iep.utm.edu), Britannica, Nobel Prize site, Project Gutenberg, university/library pages. Wikipedia is added automatically for people.
3. **No duplicates.** `ls src/content/people` and `ls src/content/books` (may not exist yet) first. Never reuse an id. Do not re-do someone already present.
4. **No fabricated quotations**, no invented anecdotes. Mark legends as legends. Do not reproduce long copyrighted text; summarise in your own words.
5. **Neutral on religion and politics.** Describe what a tradition or text claims and how it was received; do not endorse or mock.
6. Use typographic apostrophes (’) inside JS single-quoted strings, or escape properly, so the script parses. Run `node --check yourfile.mjs`.
7. **Only write your own batch file** (path given in your task). Do NOT run it, do NOT edit any other file, do NOT run git, npm, or the portrait fetcher. The lead integrates and commits all batches sequentially.
8. Breadth matters: spread across regions, eras, genders, and fields. Quality over quantity: if you cannot verify an entry, drop it.

## PEOPLE batch format
File exports up to three arrays: `export const scientists=[...]; export const mathematicians=[...]; export const philosophers=[...];`
(Use `[]` for any you don't need.) Each row is an array of 14 fields, exactly like `scripts/catalogue-mathematicians.mjs`:

[id, name, born, died, region, nationality, 'Field A|Field B', wikipediaTitle, sourceUrl, tagline, intro, ideas, readingNote, related]

- `id`: lowercase-hyphen slug of the name, ASCII, unique.
- `name`: common English form, no "of Place" suffix unless unavoidable (use `Madhava`, not `Madhava of Sangamagrama`).
- `born` / `died`: string years like '1707', or 'c. 1170', '384 BCE', 'c. 220 CE'. Omit `died` with '' only if living (prefer people who have died; a few living laureates are fine if sourced).
- `region`: one of 'Africa','Asia','Europe','North America','South America','Oceania' (birth region).
- `nationality`: short string ('Egyptian', 'Mali Empire', 'Brazilian').
- `wikipediaTitle`: exact English Wikipedia article title with underscores, percent-encode non-ASCII (e.g. `Bh%C4%81skara_II`). Must exist; it is used to fetch a portrait.
- `sourceUrl`: one strong reference URL (verified 200).
- `tagline`: ONE question (<=200 chars) the person's work raises.
- `intro`: 1-2 careful sentences.
- `ideas`: 2-3 items `[title, year(number|string), summary, significance]`, one sentence each.
- `readingNote`: 1-2 sentences on limits, disputes, legends, or how to read the evidence.
- `related`: 'id|id|id' of 2-4 people that EXIST (in `src/content/people` or in your own batch).
Choose the array by main identity: scientists (natural sciences, medicine, technology, astronomy, earth/life science), mathematicians (maths/logic/statistics), philosophers (philosophy, ethics, political thought, religion-as-philosophy, social thought, historiography).

## BOOKS batch format
File exports `export const books=[...]`, each an OBJECT:
{
 id: 'slug', title: 'English title', originalTitle: 'original-language title (optional)',
 author: 'Display name(s)', authorIds: ['existing-or-batch-person-ids'] (may be [] for anonymous/collective/uncatalogued authors),
 year: 1687 | 'c. 150 BCE' | '8th century BCE–4th century CE', originalLanguage: 'Latin',
 region: 'Africa'|'Asia'|'Europe'|'North America'|'South America'|'Oceania',
 kind: one of 'Science','Mathematics','Philosophy','Literature','History','Foundational text','Politics & society','Medicine','Technology & AI',
 summary: 2-3 sentences of what the book is and argues,
 whyItMatters: 1-2 sentences,
 keyIdeas: exactly 3 short strings,
 whereToStart: 1-2 sentences of practical reading guidance (which translation/edition type, which section first, what it assumes),
 caveat: 1-2 sentences on disputes, authorship, reception, outdated claims (required),
 related: ['person ids that exist'] (may be []),
 readOnline: 'https://...' only if a legal full text exists (Gutenberg, Wikisource, Internet Archive, publisher open access) and it returns 200; else omit,
 sources: [ {title, url, note?}, ... ] at least 2, all verified 200.
}
Books must be genuinely famous/influential. Mix eras and regions. Do not include a book whose date, author or basic content you cannot verify.

## When done
Reply with: the file path, counts, and any ids you were unsure about. Keep the reply under 150 words.
