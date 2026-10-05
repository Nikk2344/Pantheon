# The Pantheon — project brief and handoff

## Vision recovered from the original planning notes

A personal learning website covering influential scientists and philosophers across the world and across eras. Rich individual profiles should explain contributions precisely, not merely list achievements. Physics should be understandable through actual interactive models, and important experiments should be reconstructed as narrated sequences. Philosophy should have its own interaction model: remove assumptions and inspect the resulting argument.

The original aspiration is an expandable archive of 100+ figures. Content and coverage remain ongoing editorial work. Historical claims should be researched; contested accounts must be identified. Use historical portraits with credit. The preferred style is modern, and the user prefers judging a working artifact over abstract design options.

## Implemented September 2026

- Rebuilt the home page and global navigation around the two wings and laboratory.
- Expanded to 125 profiles (74 philosophers and 51 scientists), preserving the original four long biographies.
- Added historical portraits and repaired the portrait fetcher’s handling of generated thumbnail filenames.
- Added four physics models and four argument reconstructions to the existing engines.
- Added standalone lab pages with model limits, a sequence of prompts, and immediate-feedback quizzes.
- Added full filtering with URL state, chronological sorting, accent-insensitive search, and a random matching profile.
- Added a cross-category contribution timeline and fourteen guided learning paths.
- Added local-only saved profiles, notes, read status, and progress derived from read profiles.
- Added About/editorial context, a 404 page, and automated model and browser verification.

## Important decisions

- Keep Astro static output and React islands. No backend is needed for the current personal learning workflows.
- All scientific canvas visuals are functional models with stated limits. The homepage solar system calculates approximate current heliocentric positions using JPL Table 1 (1800–2050), with real-time and explicit time-lapse modes. Textures, globe lighting, sizes and ring presentation are illustrative.
- Seven canvas simulations, eight argument maps, and a two-qubit quantum circuit playground are available. The catalogue contains 274 contributions and seven topic guides.
- Saved state is scoped to browser + origin. Storage failures are surfaced; there is no implicit cloud sync.
- Region means birth region. Categories are navigation aids, not exclusive intellectual identities.
- Introductory argument maps are labelled reconstructions, not historical quotations or automated truth judges.

## Remaining scope

1. Deepen and broaden the 125-profile catalogue in reviewable batches. See CATALOGUE.md for coverage gaps; the collection is not exhaustive.
2. Deepen the new introductory biographies with primary-source-led discovery narratives and additional objections/replies.
3. Add narrated historical reconstructions beyond the original Rutherford experience. The new physics additions currently illustrate concepts rather than reconstruct historical apparatus.
4. Consider a separate playable thought-experiment format after reviewing the current argument interactions.
5. Optional later work: offline access and an explicit notebook export/import workflow. The user has requested a database for future expansion. HOSTING.md documents the recommended architecture; /catalogue.json is a migration export. No database, admin editor, accounts, or synchronisation are connected yet.
6. Choose a production domain and hosting destination when ready to publish. No site was published in this change.

## Verification commands

`npm test`, `npm run check`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4322` and `npm run verify:app` and `npm run verify:catalogue`. The browser suite writes screenshots under `.shots/v2/`. `npm run verify` retains the original simulation/Descartes checks.

## Catalogue release additions

The Ideas page searches every contribution independently of its author. New entries are explicitly marked Introduction; the original four are marked In depth. Portraits without verified reuse metadata render as typographic placeholders. The quantum model has tests for unitarity, wire ordering, complex phase, Bell states, measurement collapse, and shot sampling. The public JSON export is generated from validated content, including references and portrait metadata.

## Philosophy atlas and sensory learning

Added 75 school/position entries, 13 cultural introductions, 21 guides to Hindu texts/textual families, and 51 evidence-labeled scientist outlooks linked from their profiles and a comparison index. The atlas supports search, area filtering, URL restoration, and side-by-side comparison. Top navigation now opens the Philosophy atlas; the philosophers directory is linked prominently from it.

`/lab/matter-and-sound` contains a narrated contact/energy illustration and a playable electronic sound model with pitch, harmonics, amplitude, vacuum, pause, and manual-step controls. Audio is synthesized locally with Web Audio and no microphone, account, or network service. This is a simplified scientific explanation, not direct sensory access to individual atoms.

New validation: `npm run verify:atlas`; model and catalogue integrity checks are included in `npm test`. Build count is 256 static pages. No hosting deployment or database provisioning occurred.

## Solar-system homepage and reading languages

October homepage redesign: an editorial introduction and question-led starting points lead into science, philosophy, featured people, the solar model, and laboratory experiences. Phone layouts use compact portrait rows, stacked primary actions, paired question cards, and a two-column solar control panel. The solar model and its limitations remain intact. Layouts were checked at 320, 390, 620, 768, 1024, and 1440 pixels in addition to the existing browser suites.

The homepage now contains all eight planets, current UTC positions, selectable planet details, a date picker (1800–2049), pause/play, three time-lapse speeds and a common-AU-scale toggle. The local JPL-element model requires no service key or live API. Earth means the Earth–Moon barycenter; UTC approximates TDB. Surface maps are local CC BY 4.0 Solar System Scope / INOVE assets; see public/textures/CREDITS.md. No current weather, surface rotation or observing-site sky is simulated.

English/Hinglish preference persists across routes. Curated Hinglish currently covers the home introduction, navigation, planet descriptions and an Oppenheimer reading note; it does not translate the entire catalogue. More languages offers user-initiated Google website translation on public hosts and browser-translation instructions on localhost. No external translation script is loaded. Full reviewed article translations remain editorial work.

Oppenheimer brought the catalogue to 112 people; the October expansion now brings it to 125 people, 274 contributions and 51 scientist outlooks. He is identified as Los Alamos scientific director, not the sole inventor of the bomb. Solar checks: npm run verify:solar. Model tests are included in npm test.

## Modern AI research expansion

Added 12 detailed, team-attributed research articles (11 AI, one CRISPR-Cas9) under `/innovations`. The catalogue now has 274 contributions: 262 on profiles and 12 standalone innovations. Every article includes sources, date qualifications, a mechanism overview, worked conceptual examples, limitations, related reading, and an expandable understanding check. Unified search, chronological browsing, homepage entry points, and static JSON export include the new records. `npm run verify:innovations` checks their integration and mobile layouts. No new live AI service, database, or generated scientific evidence is connected.
