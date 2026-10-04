# The Pantheon

An interactive atlas of scientific discoveries and philosophical ideas. Built with Astro 7, React islands, TypeScript, MDX, and Tailwind. Everything builds to a static site; no account, database, or service key is required.

## Current release

- **125 sourced profiles**: 51 scientists and 74 philosophers, spanning antiquity through modern science, with historical portraits and attribution.
- **7 physics experiences**: orbits, radioactive decay, the gold-foil reconstruction, a nonlinear pendulum, photoelectric emission, induction, and wave superposition.
- **8 interactive argument maps**, including Stoic agency, Epicurus on death, and Wollstonecraft on education.
- **262 contributions** in a searchable idea index with field filters, chronology, expandable significance, and pagination.
- **7 science guides** and an ideal two-qubit quantum circuit playground with gates, phase, entanglement, and measurement.
- **75 philosophical schools and positions**, searchable by question/term and area, with a two-school comparison.
- **13 cultural tradition guides** and **21 Hindu text/text-family introductions**, including the four Vedas, principal Upanishads, Gītā, and the six darśanas with competing Vedānta interpretations.
- **51 scientist outlook entries**, distinguishing documented beliefs, methodological readings, and gaps in personal evidence.
- **Matter and sound animations**: surface overlap/energy, quantum exclusion explanations, a longitudinal air-wave model, and user-initiated electronic tones and a four-note phrase.
- Search by people and ideas; combine discipline, field, era, birth region, and interactive filters. Search state is shareable in the URL.
- Historical timeline, 14 guided learning paths, experiment guides, and knowledge checks.
- Saved profiles, personal notes, and reading progress in browser localStorage.
- Responsive navigation, dark/light themes, reduced-motion support, and keyboard focus states.

This is a substantial curated catalogue, not an exhaustive history of science and philosophy. Four profiles are in-depth studies; the others are sourced introductions. See `CATALOGUE.md` for coverage, editorial standards, and areas still underrepresented.

## Run

Requires Node 22.12+ for the app, or Node 24+ for the native TypeScript model tests.

```sh
npm install
npm run dev -- --background
# http://localhost:4321
npm run astro -- dev status
npm run astro -- dev stop
```

## Build and verify

```sh
npm test                 # physics, chronology, argument, and content-link checks
npm run check            # Astro + TypeScript diagnostics
npm run build            # schema and cross-reference validation; 243 static pages
npm run preview -- --host 127.0.0.1 --port 4322
npm run verify:app       # production regression suite on port 4322
npm run verify:catalogue # idea index, quantum lab, new arguments, and responsive layouts
npm run verify:atlas     # schools, traditions, scientist views, matter, sound, and audio lifecycle
```

`BASE_URL` overrides the browser suite target. `npm run verify` retains the earlier visual regression script for the original engines; it targets port 4321 by default. Set `SHOT_DIR` to a directory inside the project to keep its screenshots here. Browser suites require the Playwright Chromium browser already installed on this machine.

## Structure

- `src/content/people/*.mdx`: individual profiles, structured contributions, timelines, and sources.
- `src/content.config.ts`: schema validation. Unknown simulation/argument IDs fail validation.
- `src/lib/people.ts`: collection helpers, portraits, related-person validation.
- `src/data/topics.ts`: seven topic guides, glossaries, quizzes, and references.
- `src/data/schools.ts`, `traditions.ts`, `scientist-views.ts`: the philosophy atlas and sourced scientist outlooks.
- `src/components/MatterSoundLab.tsx`: interactive contact and audio experiences; `src/lib/matter-sound.ts` holds pure model functions.
- `src/lib/quantum.ts`: pure two-qubit state-vector operations and measurement.
- `src/pages/discoveries.astro`: searchable contribution index.
- `src/pages/catalogue.json.ts`: versioned public catalogue export for migration.
- `src/data/learning.ts`: laboratory catalogue, knowledge checks, learning paths, date sorting.
- `src/lib/learning.ts`: validated local storage with a session fallback when storage is unavailable.
- `src/sims/kernel/`: fixed-step animation engine, controls, seeded randomness, drawing primitives.
- `src/sims/defs/`: individual physics models; the registry loads each on demand.
- `src/arguments/kernel/`: conjunctive support propagation, graph validation, interactive display.
- `src/arguments/defs/`: sourced argument reconstructions.
- `src/styles/theme.css`: design tokens and responsive component styling.
- `src/pages/lab/[id].astro`: standalone experiments with guides and quizzes.

A simulation declares `params`, `init`, `step`, and `draw`. Register it and reference it in a profile. `step` mutates state at a fixed timestep; `draw` must not mutate it. Use seeded randomness, never `Math.random()` inside physics. Label assumptions, units, approximations, and schematic visuals.

Argument support is conjunctive: all declared supports must stand. A rejected premise withdraws this argument’s support for dependent conclusions; it does not prove those conclusions false. New argument maps explicitly identify simplified reconstructions. Build-time validation catches cycles and dangling claims.

## Editorial and portrait workflow

Keep factual claims traceable to the profile’s sources. Prefer original texts, institutional collections, and scholarly references. Retain uncertainty in historical dates and disputed priority claims. Ancient depictions are not authenticated photographs; the About page explains this limitation.

Birth region supports discovery, and is not a claim about modern citizenship or the only region where a figure worked. A single primary category is a navigation convention; people can have several fields.

To add a portrait, add a Wikipedia title to `scripts/portraits.json`, then run `npm run portraits -- person-id`. The fetcher handles Wikimedia thumbnail paths and records original-file credits. Astro generates local WebP variants. Inspect both the image and the attribution before shipping.

The one-time expansion script in `scripts/expand-archive.mjs` records the September 2026 batch. It overwrites that batch’s MDX files if rerun; edit the MDX files directly for ongoing editorial work.

## Data and deployment

Notes, saved IDs, and read status remain in this browser on this origin. They do not sync across devices, and clearing site data removes them. A different port is a different storage origin. There is no user tracking or remote storage in these features.

`npm run build` produces `dist/`, ready for a static host that serves directory `index.html` files and uses `404.html` for missing routes. No public deployment has been created.

See `PROJECT.md` for the project brief, `CATALOGUE.md` for editorial scope, and `HOSTING.md` for free hosting and a future database migration. No cloud database is connected.

### Solar-system homepage

Eight textured planets, current calculated positions from JPL orbital elements, time-lapse, date selection and planet facts in English/Hinglish. Globe lighting and sizes are illustrative; this is an approximate ephemeris, not live telemetry. Planet maps are locally hosted and credited in public/textures/CREDITS.md. Run `npm run verify:solar` for browser checks.

A shared language control remembers English/Hinglish. Curated Hinglish covers the homepage introduction, navigation and planet descriptions, with a reading note on Oppenheimer; full catalogue translations are not yet available. Other languages use an explicit external translation link after public hosting, or browser translation during local preview.
