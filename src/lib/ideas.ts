import { getCollection } from 'astro:content';
import { allPeople } from './people';
import { chronologicalYear } from '../data/learning';

export async function allInnovations() {
  const entries = await getCollection('innovations');
  const ids = new Set(entries.map(entry => entry.id));
  for (const entry of entries) for (const id of entry.data.related) {
    if (!ids.has(id) || id === entry.id) throw new Error(`Invalid innovation link: ${entry.id} -> ${id}`);
  }
  return entries.sort((a,b) => b.data.year-a.data.year || a.data.title.localeCompare(b.data.title));
}

/** One search/timeline record per contribution, retaining each collection's attribution. */
export async function allIdeas() {
  const [people, innovations] = await Promise.all([allPeople(), allInnovations()]);
  return [
    ...people.flatMap(person => person.data.discoveries.map((idea,index) => ({
      title:idea.title, year:idea.year, sortYear:chronologicalYear(idea.year),
      summary:idea.summary, significance:idea.significance, caveat:idea.disputed,
      category:person.data.category, fields:person.data.fields, credit:person.data.name,
      href:`/p/${person.id}#discovery-${index+1}`, creditHref:`/p/${person.id}`,
      interactive:!!(idea.argument || idea.interactiveDemo), kind:'Profile contribution',
    }))),
    ...innovations.map(({id,data}) => ({
      title:data.title,year:data.year,sortYear:data.year,summary:data.summary,
      significance:data.significance,caveat:data.limitation,category:'scientist' as const,
      fields:data.fields,credit:data.credit,href:`/innovations/${id}`,creditHref:`/innovations/${id}#credit`,
      interactive:false,kind:data.kind,
    })),
  ];
}
