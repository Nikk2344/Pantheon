import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {SCHOOLS} from '../src/data/schools.ts';
import {TRADITIONS,HINDU_TEXTS} from '../src/data/traditions.ts';
import {SCIENTIST_VIEWS} from '../src/data/scientist-views.ts';
import {pairPotential,pairForce,waveValue,wavelength,harmonicWeights} from '../src/lib/matter-sound.ts';
test('pair model has stable equilibrium and force is minus the potential gradient',()=>{
 const r=2**(1/6);assert.ok(Math.abs(pairPotential(r)+1)<1e-10);assert.ok(Math.abs(pairForce(r))<1e-10);
 for(const r of [1,1.1,1.5,2]){const h=1e-6;assert.ok(Math.abs(pairForce(r)+(pairPotential(r+h)-pairPotential(r-h))/(2*h))<1e-5);}
 assert.ok(pairForce(1)>0);assert.ok(pairForce(1.5)<0);assert.throws(()=>pairPotential(0),RangeError);
});
test('wave is periodic, bounded, silent at origin, and reduces to a sine',()=>{
 for(const richness of [0,.5,1])for(let p=0;p<20;p+=.1){assert.ok(Math.abs(waveValue(p,richness))<=1);assert.ok(Math.abs(waveValue(p,richness)-waveValue(p+2*Math.PI,richness))<1e-12);}
 assert.equal(waveValue(0,1),0);assert.equal(waveValue(Math.PI/2,0),1);assert.equal(wavelength(440),wavelength(220)/2);assert.deepEqual(harmonicWeights(-1),[1,0,0,0]);
});
test('atlas links point to real schools and people; all scientist profiles have evidence-aware entries',()=>{
 const ids=new Set(readdirSync('src/content/people').map(f=>f.replace('.mdx',''))),schools=new Set(SCHOOLS.map(s=>s.id));
 assert.equal(schools.size,SCHOOLS.length);assert.equal(new Set(TRADITIONS.map(t=>t.id)).size,TRADITIONS.length);assert.equal(new Set(HINDU_TEXTS.map(t=>t.id)).size,HINDU_TEXTS.length);
 for(const s of SCHOOLS){for(const p of s.people)assert.ok(ids.has(p),p);assert.ok(s.essence&&s.tension&&s.question);assert.equal(new URL(s.source).protocol,'https:');}
 for(const t of TRADITIONS)for(const id of t.schools)assert.ok(schools.has(id),id);
 for(const [id,v] of Object.entries(SCIENTIST_VIEWS)){assert.ok(ids.has(id),id);for(const s of v.schools)assert.ok(schools.has(s),s);assert.ok(v.caution&&v.sourceTitle);}
 const scientistIds=[...ids].filter(id=>/["']?category["']?:\s*["']?scientist/.test(readFileSync(`src/content/people/${id}.mdx`,'utf8')));
 assert.ok(scientistIds.length>=44);assert.deepEqual(Object.keys(SCIENTIST_VIEWS).sort(),scientistIds.sort());
});
