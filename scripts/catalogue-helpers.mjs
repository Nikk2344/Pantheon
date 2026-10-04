import {readFile,writeFile,access} from 'node:fs/promises';
import {chronologicalYear} from '../src/data/learning.ts';
export async function publishBatch(rows,category){
 const manifest=JSON.parse(await readFile('scripts/portraits.json','utf8'));
 for(const r of rows){
  const [id,name,born,died,region,nation,fields,wiki,source,tagline,intro,ideas,reflection,related]=r;
  const yr=chronologicalYear(born);
  const era=yr<500?'Ancient (before 500 CE)':yr<1400?'Medieval (500–1400)':yr<1700?'Early modern (1400–1700)':yr<1800?'Enlightenment (1700–1800)':'Modern (1800–present)';
  const data={name,category,fields:fields.split('|'),era,born,...(died?{died}:{}),region,nationality:[nation],tagline,summary:intro,entryLevel:'Introduction',discoveries:ideas.map(([title,year,summary,significance])=>({title,year,summary,significance})),timeline:ideas.map(([title,year])=>({year,event:title})),relatedFigures:related.split('|'),sources:[{title:source.includes('stanford.edu')?'Stanford Encyclopedia of Philosophy':source.includes('st-andrews')?'University of St Andrews: MacTutor history archive':source.includes('nobelprize')?'Nobel Prize: biographical and scientific background':'Further reading and historical context',url:source},{title:`${name}: biography and references`,url:`https://en.wikipedia.org/wiki/${wiki}`}],...(/c\.|century|Tradition/.test(born)?{datesNote:'Ancient and approximate dates are not exact records. Traditional chronologies and later reconstructions may differ.'}:{})};
  const body=`${intro}\n\n## The central question\n\n${tagline}\n\n${reflection}\n\n## Read actively\n\nChoose one contribution below. Separate its central claim from the reasons supporting it, then compare the account with the linked sources. The connected profiles offer different approaches, not necessarily agreement.\n`;
  const path=`src/content/people/${id}.mdx`;try{await access(path);console.log(`Kept ${id}`);}catch{await writeFile(path,`---\n${JSON.stringify(data,null,2)}\n---\n\n${body}`);}
  manifest[id]=decodeURIComponent(wiki);
 }
 await writeFile('scripts/portraits.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Prepared ${rows.length} ${category} entries.`);
}
