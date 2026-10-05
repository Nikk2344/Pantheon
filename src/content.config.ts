import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imported directly rather than re-exported from astro:content, which Astro 7
// deprecates.
import { z } from 'zod';
import { ARGUMENT_IDS } from './arguments/kernel/registry';
import { SIM_IDS } from './sims/kernel/registry';

/**
 * The content contract.
 *
 * With a hundred-plus hand-written entries ahead, the failure mode that
 * matters is not a crash — it is an entry that renders *almost* right and
 * quietly says something false. So the schema is deliberately strict:
 *
 *  - every entry must cite at least one source
 *  - every quote must carry its attribution, or it doesn't ship
 *  - `interactiveDemo` and `argument` are checked against their registries, so
 *    a typo fails the build instead of silently rendering nothing
 *  - `relatedFigures` ids are cross-checked after load (see `verifyLinks`)
 *
 * Every one of those is a mistake that is easy to make at entry #60 and hard
 * to notice by eye.
 */

const source = z.object({
  title: z.string(),
  url: z.url(),
  /** What this source is being relied on for. */
  note: z.string().optional(),
});

const discovery = z.object({
  title: z.string(),
  /** Number for a clean year, string for "c. 1666" or "1665–1667". */
  year: z.union([z.number(), z.string()]),
  /** What was found, in plain language. */
  summary: z.string(),
  /** Why it mattered — the part that makes it worth a page. */
  significance: z.string(),
  /** Id of an interactive from the simulation registry. */
  interactiveDemo: z
    .string()
    .refine((id) => SIM_IDS.includes(id), {
      message: `Unknown simulation. Registered ids: ${SIM_IDS.join(', ')}`,
    })
    .optional(),
  /**
   * Id of an argument from the argument registry — the philosophy wing's
   * equivalent of `interactiveDemo`. Checked the same way, for the same reason:
   * a typo should fail the build, not render nothing.
   */
  argument: z
    .string()
    .refine((id) => ARGUMENT_IDS.includes(id), {
      message: `Unknown argument. Registered ids: ${ARGUMENT_IDS.join(', ')}`,
    })
    .optional(),
  /** Where the popular story is contested, say so here rather than repeating
   *  the tidy version. Rendered as an explicit caveat. */
  disputed: z.string().optional(),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    entryLevel: z.enum(['Introduction','In depth']).default('Introduction'),
    portraitNote: z.string().optional(),
    /** Name in the subject's own language/script, where different. */
    nativeName: z.string().optional(),
    category: z.enum(['scientist', 'philosopher']),
    fields: z.array(z.string()).min(1),
    era: z.string(),
    region: z.string().default('Europe'),
    /** ISO date where known, else a year or "c. 470 BC". */
    born: z.string(),
    died: z.string().optional(),
    /** For calendar caveats — Newton's dates differ by eleven days. */
    datesNote: z.string().optional(),
    birthplace: z.string().optional(),
    nationality: z.array(z.string()).min(1),
    /** One line, used on cards and under the name. */
    tagline: z.string().max(220),
    /** Two or three sentences. Card and meta description. */
    summary: z.string(),
    quote: z
      .object({
        text: z.string(),
        /** Where it is actually recorded. No source, no quote. */
        source: z.string(),
      })
      .optional(),
    discoveries: z.array(discovery).min(1),
    timeline: z
      .array(
        z.object({
          year: z.union([z.number(), z.string()]),
          event: z.string(),
        }),
      )
      .default([]),
    relatedFigures: z.array(z.string()).default([]),
    sources: z.array(source).min(1),
    featured: z.boolean().default(false),
  }),
});

const innovations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/innovations' }),
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
    dateNote: z.string(),
    fields: z.array(z.string()).min(1),
    kind: z.enum(['Architecture', 'Training method', 'Research system', 'Biotechnology']),
    credit: z.string(),
    summary: z.string(),
    significance: z.string(),
    limitation: z.string(),
    steps: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
    related: z.array(z.string()).min(1),
    sources: z.array(source).min(2),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { people, innovations };
