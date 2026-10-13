/**
 * Turn people batches (scripts/batches/people-*.mjs, see BRIEF.md) into MDX records.
 * Usage: node scripts/publish-people.mjs scripts/batches/people-africa.mjs [...]
 * Existing ids are kept. Portrait manifest is updated once at the end of each batch.
 */
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {publishBatch} from './catalogue-helpers.mjs';
for(const file of process.argv.slice(2)){
 const mod=await import(pathToFileURL(resolve(file)).href);
 for(const [exportName,category] of [['scientists','scientist'],['mathematicians','mathematician'],['philosophers','philosopher']]){
  const rows=mod[exportName]??[];
  if(rows.length)await publishBatch(rows,category);
 }
}
