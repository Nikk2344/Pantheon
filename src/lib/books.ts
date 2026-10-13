import { getCollection, type CollectionEntry } from 'astro:content';
import { chronologicalYear } from '../data/learning';
import { allPeople } from './people';

export type Book = CollectionEntry<'books'>;

export async function allBooks(): Promise<Book[]> {
  const books = await getCollection('books');
  return books.sort(
    (a, b) => chronologicalYear(a.data.year) - chronologicalYear(b.data.year) || a.data.title.localeCompare(b.data.title),
  );
}

/** Fails the build on a book that points at a person who has no profile. */
export async function verifyBookLinks(): Promise<void> {
  const ids = new Set((await allPeople()).map((p) => p.id));
  const problems: string[] = [];
  for (const book of await allBooks()) {
    for (const ref of [...book.data.authorIds, ...book.data.related]) {
      if (!ids.has(ref)) problems.push(`  ${book.id}.mdx → "${ref}" has no profile`);
    }
  }
  if (problems.length) throw new Error(`Broken book references:\n${problems.join('\n')}`);
}

export async function booksFor(personId: string): Promise<Book[]> {
  return (await allBooks()).filter(
    (b) => b.data.authorIds.includes(personId) || b.data.related.includes(personId),
  );
}

export function eraOf(book: Book): string {
  const y = chronologicalYear(book.data.year);
  return y < 500 ? 'Ancient (before 500 CE)' : y < 1400 ? 'Medieval (500–1400)' : y < 1700 ? 'Early modern (1400–1700)' : y < 1800 ? 'Enlightenment (1700–1800)' : 'Modern (1800–present)';
}
