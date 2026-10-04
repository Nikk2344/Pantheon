# Catalogue coverage and editorial workflow

October 2026: 125 profiles, comprising 74 philosophers and 51 scientists/mathematicians. This is a substantial curated catalogue, not an exhaustive list of important thinkers. Four original profiles are longer studies; the other entries are introductions.

The collection spans ancient, medieval, early modern, Enlightenment, and modern work. New coverage includes Jain, Buddhist, Vedānta, Confucian, Daoist, Mohist, Islamic, Jewish, Christian, Greek, feminist, analytic, and continental traditions, alongside chemistry, genetics, computing, quantum theory, and mathematical astronomy. Categories help navigation and do not claim that a person belongs to only one discipline.

## What readers can do

- Browse every profile at `/explore`, or either disciplinary wing.
- Search individual contributions at `/discoveries`, filter by field, sort chronologically, and expand their significance.
- Follow 14 paths at `/paths`, seven science guides at `/topics`, and a contribution timeline at `/timeline`.
- Inspect eight argument maps, seven canvas experiments, and the two-qubit circuit playground.
- Save profiles and personal notes in the current browser.
- Read or export the public structured catalogue at `/catalogue.json`.
- Search 75 philosophical schools/positions and compare two at `/philosophy`; explore 13 cultural tradition introductions and 21 Hindu text/text-family guides.
- Read evidence-labeled philosophical outlooks alongside discoveries on all 51 scientist profiles, or browse `/philosophy/scientists`.
- Explore why solids resist overlap and how electronic sound reaches the ear at `/lab/matter-and-sound`.

## Adding and deepening records

Edit the MDX record, not its one-time authoring script. Each profile needs a precise question, contextual biography, explained contributions, reliable source links, and valid related profile IDs. Preserve stable slugs. Add work-level citations where they sharpen support for a claim. Do not manufacture quotations, exact ancient dates, or historical priority.

`entryLevel` distinguishes `Introduction` from `In depth`. Promote a profile only after adding substantial source-led context and reasoning. A longer generic paragraph is not equivalent to greater depth.

New photographs and artwork must have verified attribution and reuse terms. Unavailable or unverified portraits use a typographic placeholder. Ancient depictions are not authenticated likenesses. Images are resized/cropped for presentation; credits on profiles link to the source and license.

After editing, run `npm test`, `npm run check`, and `npm run build`. Start the production preview, then run `npm run verify:app` and `npm run verify:catalogue`. The build validates profile cross-references; model tests validate topic/path links and interactive behavior.

## Still worth expanding

African, Indigenous, and Latin American traditions now have introductory guides but still need more named thinkers and detailed, community-specific coverage. More women across periods, logic and mathematics outside the current selection, earth sciences, ecology, and contemporary discoveries remain underrepresented. Deepening the existing introductions is as important as adding names. Prioritize evidence, collaborators, contested interpretations, and connections between traditions.

## Philosophy and sensory learning additions

Schools live in `src/data/schools.ts`; tradition and text introductions in `src/data/traditions.ts`; scientist outlooks in `src/data/scientist-views.ts`. Each scientist entry identifies its evidence type. Do not infer a religion from nationality, identify a methodological reading as a personal creed, or present a scientific result as proof of a spiritual doctrine. The new atlas is broad and curated, not every school or text in the world.

`/catalogue.json` is now schema version 2, retaining earlier fields and adding `schools`, `traditions`, `textGuides`, and `scientistViews`. It remains a static export, not a database connection.

The matter curve is a dimensionless Lennard-Jones illustration, not a quantum simulation of a wall. Sound is a collective mechanical wave: the organized molecule rows omit thermal motion, and the animation is slowed and not phase-synchronized with audible output. Sound requires an explicit Play action, stops automatically, and stops on vacuum, hidden-tab, or page-exit events. Reduced-motion settings start both animations paused. `npm run verify:atlas` checks the new pages, interactions, audio lifecycle, and responsive layouts.
