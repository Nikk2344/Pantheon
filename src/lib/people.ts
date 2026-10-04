import { getCollection, type CollectionEntry } from 'astro:content';
import creditsJson from '../data/portraits.json';

export type Person = CollectionEntry<'people'>;
export type Category = 'scientist' | 'philosopher';

interface PortraitCredit {
  file: string;
  description?: string;
  credit: string;
  license: string;
  sourceUrl: string;
  wikipedia?: string;
}

const credits = creditsJson as Record<string, PortraitCredit>;

/** Astro optimises images it can see statically, so the whole portrait folder
 *  is globbed once here and looked up by filename. */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/portraits/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

export interface Portrait extends PortraitCredit {
  image: ImageMetadata;
}

export function portraitFor(id: string): Portrait | null {
  const meta = credits[id];
  if (!meta || !meta.license || meta.license === 'See source') return null;
  const mod = images[`/src/assets/portraits/${meta.file}`];
  if (!mod) return null;
  return { ...meta, image: mod.default };
}

export const CATEGORY = {
  scientist: {
    plural: 'Scientists',
    singular: 'Scientist',
    slug: 'scientists',
    wing: 'wing-science',
    blurb: 'The people who worked out how the world actually behaves — and, just as importantly, how to find out.',
  },
  philosopher: {
    plural: 'Philosophers',
    singular: 'Philosopher',
    slug: 'philosophers',
    wing: 'wing-philosophy',
    blurb: 'The people who asked what we can know, what we owe each other, and what any of it means.',
  },
} as const satisfies Record<Category, Record<string, string>>;

export function categoryFromSlug(slug: string): Category | null {
  if (slug === 'scientists') return 'scientist';
  if (slug === 'philosophers') return 'philosopher';
  return null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** ISO dates become readable; anything else ("c. 470 BC") passes through. */
export function formatDate(value: string | undefined): string {
  if (!value) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!iso) return value;
  const [, y, m, d] = iso;
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function year(value: string | undefined): string {
  if (!value) return '';
  const iso = /^(\d{4})/.exec(value);
  return iso ? iso[1]! : value;
}

export function lifespan(person: Person): string {
  const b = year(person.data.born);
  const d = year(person.data.died);
  return d ? `${b} – ${d}` : `b. ${b}`;
}

export async function allPeople(): Promise<Person[]> {
  const people = await getCollection('people');
  return people.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function peopleIn(category: Category): Promise<Person[]> {
  return (await allPeople()).filter((p) => p.data.category === category);
}

/**
 * Cross-reference check, run at build time.
 *
 * Zod validates each file on its own, but it cannot catch a `relatedFigures`
 * entry pointing at somebody who doesn't exist — the classic typo at entry #60,
 * which otherwise ships as a dead link nobody notices. Failing the build is the
 * cheapest possible place to find it.
 */
export async function verifyLinks(): Promise<void> {
  const people = await allPeople();
  const ids = new Set(people.map((p) => p.id));
  const problems: string[] = [];

  for (const person of people) {
    for (const ref of person.data.relatedFigures) {
      if (!ids.has(ref)) {
        problems.push(`  ${person.id}.mdx → relatedFigures: "${ref}" does not exist`);
      }
      if (ref === person.id) {
        problems.push(`  ${person.id}.mdx → relatedFigures links to itself`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Broken cross-references in content:\n${problems.join('\n')}\n` +
        `Known ids: ${[...ids].join(', ')}`,
    );
  }
}

/** Resolve related ids to the actual entries, preserving author order. */
export async function relatedTo(person: Person): Promise<Person[]> {
  const people = await allPeople();
  const byId = new Map(people.map((p) => [p.id, p]));
  return person.data.relatedFigures
    .map((id) => byId.get(id))
    .filter((p): p is Person => p != null);
}

/** Count of discoveries across the collection that ship something the reader
 *  can operate — a simulation in the science wing, an argument in philosophy. */
export async function interactiveCount(): Promise<number> {
  const people = await allPeople();
  return people.reduce(
    (n, p) => n + p.data.discoveries.filter((d) => d.interactiveDemo || d.argument).length,
    0,
  );
}
