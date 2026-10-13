/**
 * Turn a books batch (scripts/batches/books-*.mjs, see BRIEF.md) into MDX records.
 * Usage: node scripts/publish-books.mjs scripts/batches/books-modern.mjs [...]
 * Existing ids are kept, never overwritten.
 */
import {writeFile,access,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await mkdir('src/content/books',{recursive:true});
let wrote=0,kept=0;
for(const file of process.argv.slice(2)){
 const {books}=await import(pathToFileURL(resolve(file)).href);
 for(const b of books){
  const {id,...data}=b;
  const clean=Object.fromEntries(Object.entries(data).filter(([,v])=>v!==undefined&&v!==''));
  const path=`src/content/books/${id}.mdx`;
  try{await access(path);kept++;console.log(`Kept ${id}`);}
  catch{await writeFile(path,`---\n${JSON.stringify(clean,null,2)}\n---\n\n${b.summary}\n\n## Why it matters\n\n${b.whyItMatters}\n`);wrote++;}
 }
}
console.log(`Books written: ${wrote}, kept: ${kept}`);
