import { allPeople } from '../lib/people';
import { TOPICS } from '../data/topics';
import { PATHS } from '../data/learning';
import portraits from '../data/portraits.json';
import {SCHOOLS} from '../data/schools';
import {TRADITIONS,HINDU_TEXTS} from '../data/traditions';
import {SCIENTIST_VIEWS} from '../data/scientist-views';
export const prerender = true;
export async function GET(){
 const people=await allPeople();
 return new Response(JSON.stringify({schemaVersion:2,counts:{people:people.length,scientists:people.filter(p=>p.data.category==='scientist').length,philosophers:people.filter(p=>p.data.category==='philosopher').length,contributions:people.reduce((n,p)=>n+p.data.discoveries.length,0),schools:SCHOOLS.length,traditions:TRADITIONS.length,textGuides:HINDU_TEXTS.length,scientistViews:Object.keys(SCIENTIST_VIEWS).length},people:people.map(p=>({id:p.id,...p.data,body:p.body??''})),topics:TOPICS,paths:PATHS,portraits,schools:SCHOOLS,traditions:TRADITIONS,textGuides:HINDU_TEXTS,scientistViews:SCIENTIST_VIEWS},null,2),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
