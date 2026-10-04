import assert from 'node:assert/strict';
import {chronologicalYear} from '../src/data/learning.ts';
import { chromium } from 'playwright';
import { mkdirSync, readdirSync } from 'node:fs';
const BASE=process.env.BASE_URL||'http://127.0.0.1:4322';
const OUT='.shots/v2';mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const go=async path=>{const response=await page.goto(BASE+path,{waitUntil:'networkidle'});assert.ok(response.status()<400,`${path}: ${response.status()}`);};
const shot=async name=>page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
const visible=()=>page.locator('[data-person]:visible');
const waitText=async (selector,text)=>{await page.waitForFunction(({selector,text})=>document.querySelector(selector)?.textContent.includes(text),{selector,text});};
try {
 const catalogue=await (await context.request.get(BASE+'/catalogue.json')).json();
 const archive=catalogue.people;assert.ok(archive.length>=100);
 const checkedLinks=new Set();
 await go('/');assert.equal(await page.locator('h1').count(),1);await shot('home-desktop');
 await page.getByRole('button',{name:'Pause motion'}).click();assert.equal(await page.getByRole('button',{name:'Play motion'}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Toggle dark mode'}).click();assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),false);await shot('home-light');await page.reload();assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),false);await page.getByRole('button',{name:'Toggle dark mode'}).click();
 console.log('PASS home, motion controls, and persistent theme');
 await go('/explore');assert.equal(await visible().count(),archive.length);
 await page.getByRole('searchbox').fill('nagarjuna');assert.equal(await visible().count(),1);assert.match(await visible().innerText(),/Nāgārjuna/);
 await page.reload();assert.equal(await page.getByRole('searchbox').inputValue(),'nagarjuna');assert.equal(await visible().count(),1);
 await page.getByRole('button',{name:'Reset filters'}).click();
 await page.getByLabel('Birth region').selectOption('Asia');assert.equal(await visible().count(),archive.filter(p=>p.region==='Asia').length);
 await page.getByLabel('Discipline').selectOption('philosopher');assert.equal(await visible().count(),archive.filter(p=>p.region==='Asia'&&p.category==='philosopher').length);
 await page.getByRole('button',{name:'Reset filters'}).click();await page.getByLabel('Order').selectOption('oldest');assert.equal(await visible().first().getAttribute('data-id'),[...archive].sort((a,b)=>chronologicalYear(a.born)-chronologicalYear(b.born))[0].id);
 await page.getByRole('searchbox').fill('no-such-person-xyz');assert.equal(await visible().count(),0);assert.equal(await page.locator('[data-empty]').isVisible(),true);assert.equal(await page.getByRole('button',{name:'Surprise me'}).isDisabled(),true);
 await page.getByRole('button',{name:'Reset filters'}).click();await shot('archive-desktop');
 await page.getByRole('checkbox',{name:'With interactive experiences'}).check();assert.equal(await visible().count(),archive.filter(p=>p.discoveries.some(d=>d.argument||d.interactiveDemo)).length);
 console.log('PASS search, accent normalization, URL restoration, combined filters, chronology, and empty state');
 await go('/p/albert-einstein');await page.getByRole('button',{name:'Save for later'}).click();await page.getByRole('button',{name:'Mark as read'}).click();await page.getByText('Your notebook',{exact:false}).click();await page.getByRole('textbox').fill('Frequency changes photon energy; brightness changes photon count.');await page.reload();assert.equal(await page.getByRole('button',{name:'Saved to your collection'}).getAttribute('aria-pressed'),'true');await page.getByText('Your notebook',{exact:false}).click();assert.match(await page.getByRole('textbox').inputValue(),/Frequency changes/);
 await go('/collection');assert.equal(await visible().count(),1);assert.equal(await visible().getAttribute('data-id'),'albert-einstein');await shot('collection');
 await go('/paths');assert.match(await page.locator('#motion [data-progress-label]').innerText(),/1 of 3/);await shot('paths');
 await go('/p/albert-einstein');await page.getByRole('button',{name:'Saved to your collection'}).click();await go('/collection');assert.equal(await visible().count(),0);assert.equal(await page.locator('[data-empty]').isVisible(),true);
 console.log('PASS saved collection, removal, read progress, and notebook persistence');
 await go('/timeline');await page.getByLabel('Period').selectOption('ancient');assert.ok(await page.locator('[data-timeline-event]:visible').count()>0);await page.getByLabel('Discipline').selectOption('scientist');assert.equal(await page.locator('[data-timeline-event]:visible').count(),archive.filter(p=>p.category==='scientist').flatMap(p=>p.discoveries).filter(d=>chronologicalYear(d.year)<500).length);assert.equal(await page.locator('#timeline-empty').isVisible(),false);await page.getByLabel('Period').selectOption('all');await page.getByLabel('Discipline').selectOption('all');await shot('timeline');
 console.log('PASS timeline filters and expanded ancient science coverage');
 for(const id of ['orbit','radioactive-decay','gold-foil','pendulum','photoelectric','induction','waves']){
  await go(`/lab/${id}`);await page.waitForSelector('canvas');
  await page.waitForFunction(()=>{const c=document.querySelector('canvas');if(!c||!c.width)return false;const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const colors=new Set();for(let i=0;i<pixels.length;i+=212)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);return colors.size>10;});
  if(id==='photoelectric'){const frequency=page.getByRole('slider',{name:'Light frequency'});await frequency.fill('300');await frequency.dispatchEvent('input');await waitText('figure','No emission');await frequency.fill('1000');await frequency.dispatchEvent('input');await waitText('figure','1.84 eV');}
  if(id==='induction'){const speed=page.getByRole('slider',{name:'Rotation frequency'});await speed.fill('0');await speed.dispatchEvent('input');await waitText('figure','0.00 V');}
  if(id==='waves'){const phase=page.getByRole('slider',{name:'Phase of second wave'});await phase.fill('180');await phase.dispatchEvent('input');await waitText('figure','0.00');}
  await page.locator('.knowledge-check').scrollIntoViewIfNeeded();await page.locator('.quiz-options button').first().click();assert.equal(await page.locator('.quiz-feedback').isVisible(),true);await page.getByRole('button',{name:'Try again'}).click();assert.equal(await page.locator('.quiz-feedback').count(),0);
  await shot(`lab-${id}`);
 }
 console.log('PASS seven rendered simulations, live threshold/voltage/phase controls, and knowledge checks');
 for(const id of ['aristotle','david-hume','john-stuart-mill','nagarjuna']){
  await go(`/p/${id}`);await page.locator('#discovery-1').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Reject',exact:true}).first().waitFor();await page.getByRole('button',{name:'Reject',exact:true}).first().click();assert.ok(await page.getByRole('button',{name:'Restore',exact:true}).count()>0);await page.getByRole('button',{name:'Grant it all again'}).click();assert.equal(await page.getByRole('button',{name:'Restore',exact:true}).count(),0);
 }
 console.log('PASS four new interactive arguments');
 const profiles=readdirSync('src/content/people').filter(f=>f.endsWith('.mdx')).map(f=>'/p/'+f.replace('.mdx',''));
 for(const path of ['/','/explore','/scientists','/philosophers','/laboratory','/timeline','/paths','/collection','/about','/discoveries','/topics',...catalogue.topics.map(t=>'/topics/'+t.id),...profiles]){
  await go(path);assert.equal(await page.locator('h1').count(),1,path);const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));assert.deepEqual(broken,[],path);
  const hrefs=await page.locator('a[href^="/"]').evaluateAll(a=>a.map(x=>x.getAttribute('href').split('#')[0].split('?')[0]));
  for(const href of new Set(hrefs)){if(checkedLinks.has(href))continue;checkedLinks.add(href);const response=await context.request.get(BASE+href);assert.ok(response.status()<400,`${path} -> ${href}`);}
 }
 console.log('PASS all profile pages, images, and internal navigation links');
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/','/explore','/paths','/timeline','/laboratory','/lab/pendulum','/lab/photoelectric','/p/nagarjuna','/discoveries','/topics','/topics/quantum-computing']){await go(path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mobile overflow: ${path}`);await shot(`mobile-${path.replaceAll('/','-')||'home'}`);}
 await go('/');await page.getByRole('button',{name:'Open navigation'}).click();assert.equal(await page.locator('#mobile-nav').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-nav').isVisible(),false);
 console.log('PASS mobile layouts and keyboard menu dismissal');
 const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(BASE+'/lab/pendulum');await rp.getByRole('button',{name:'Play',exact:true}).waitFor();await reduced.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});const bp=await blocked.newPage();await bp.goto(BASE+'/p/albert-einstein');await bp.getByRole('button',{name:'Save for later'}).click();assert.match(await bp.getByRole('status').innerText(),/Storage unavailable/);await blocked.close();
 console.log('PASS reduced-motion and unavailable-storage behavior');
 assert.deepEqual(errors,[],'Browser console/page errors');console.log('PASS zero browser errors');
} finally { await browser.close(); }





