import {mkdir,writeFile,access} from 'node:fs/promises';
const maps={mercury:'mercury',venus:'venus_atmosphere',earth:'earth_daymap',mars:'mars',jupiter:'jupiter',saturn:'saturn',uranus:'uranus',neptune:'neptune'};
await mkdir('public/textures',{recursive:true});
for(const [id,map] of Object.entries(maps)){
 const path=`public/textures/${id}.jpg`;
 try{await access(path);continue;}catch{}
 const response=await fetch(`https://www.solarsystemscope.com/textures/download/2k_${map}.jpg`,{signal:AbortSignal.timeout(30000)});
 if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error(`${id}: ${response.status}`);
 await writeFile(path,Buffer.from(await response.arrayBuffer()));console.log(`Downloaded ${id}`);
}
