import test from 'node:test';
import assert from 'node:assert/strict';
import {DAY,MIN_DATE,MAX_DATE,PLANETS,solveKepler,planetPosition,projectPosition} from '../src/lib/solar-system.ts';
test('Kepler solver satisfies the equation, including high eccentricity',()=>{
 for(const e of [0,.0167,.206,.95])for(const M of [-3,-1,0,1,3,17]){const E=solveKepler(M,e),m=Math.atan2(Math.sin(M),Math.cos(M));assert.ok(Math.abs(E-e*Math.sin(E)-m)<1e-10);}
});
test('J2000 Earth is in the expected heliocentric quadrant and near perihelion',()=>{
 const p=planetPosition(PLANETS[2],Date.UTC(2000,0,1,12));
 assert.ok(Math.abs(p.x-(-.17717))<.0001);assert.ok(Math.abs(p.y-.96721)<.0001);assert.ok(p.distance>.983&&p.distance<.984);
});
test('all eight orbits close, follow elliptic radial bounds, and reject unsupported dates',()=>{
 assert.equal(PLANETS.length,8);
 for(const p of PLANETS){for(const t of [MIN_DATE,Date.UTC(2026,8,26),MAX_DATE]){
  const v=planetPosition(p,t);assert.ok(Number.isFinite(v.distance));assert.ok(v.distance>v.a*.7&&v.distance<v.a*1.3);
  const first=planetPosition(p,t,0),last=planetPosition(p,t,2*Math.PI);assert.ok(Math.hypot(first.x-last.x,first.y-last.y)<1e-12);
 }assert.throws(()=>planetPosition(p,MIN_DATE-1),RangeError);assert.throws(()=>planetPosition(p,MAX_DATE+1),RangeError);}
});
test('positions advance with time and display scaling preserves heliocentric direction',()=>{
 const t=Date.UTC(2026,8,26);for(const [i,p] of PLANETS.entries()){const a=planetPosition(p,t),b=planetPosition(p,t+DAY);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>0);for(const scale of [true,false]){const v=projectPosition(a,i,scale);assert.ok(Math.abs(Math.atan2(280-v.y,v.x-300)-Math.atan2(a.y,a.x))<1e-12);}}
});
