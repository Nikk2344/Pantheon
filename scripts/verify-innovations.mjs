import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE=process.env.BASE_URL || 'http://127.0.0.1:4322';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const go=async path=>assert.equal((await page.goto(BASE+path,{waitUntil:'networkidle'})).status(),200,path);
mkdirSync('.shots/innovations',{recursive:true});
try {
 const data=await (await page.request.get(BASE+'/catalogue.json')).json();
 assert.ok(data.innovations.length>=12);
 assert.equal(data.counts.innovations,data.innovations.length);
 assert.equal(data.counts.profileContributions,data.people.reduce((n,p)=>n+p.discoveries.length,0));
 assert.equal(data.counts.contributions,data.counts.profileContributions+data.innovations.length);
 const ids=new Set(data.innovations.map(i=>i.id));
 const checked=new Set();
 for(const item of data.innovations){
  assert.ok(item.sources.length>=2 && item.sources.every(s=>s.note),item.id);
  assert.ok(item.body.includes('## '),item.id);
  for(const id of item.related)assert.ok(ids.has(id)&&id!==item.id,`${item.id} -> ${id}`);
  await go('/innovations/'+item.id);
  assert.equal(await page.locator('h1').innerText(),item.title);
  assert.equal(await page.locator('.innovation-process li').count(),3);
  assert.equal(await page.locator('.innovation-sources li').count(),item.sources.length);
  await page.getByText('Reveal the explanation',{exact:true}).click();
  assert.equal(await page.locator('.innovation-check details p').isVisible(),true);
  for(const href of await page.locator('a[href^="/"]').evaluateAll(links=>links.map(a=>a.getAttribute('href').split('#')[0]))){
   if(checked.has(href))continue;checked.add(href);assert.equal((await page.request.get(BASE+href)).status(),200,href);
  }
 }
 console.log('PASS article content, team credits, sources, related links, answer reveals, and export totals');
 await go('/discoveries');
 assert.equal(await page.locator('[data-idea]').count(),data.counts.contributions);
 await page.getByLabel('Field').selectOption('Artificial intelligence');
 const aiCount=data.innovations.filter(i=>i.fields.includes('Artificial intelligence')).length;
 assert.equal(await page.locator('[data-idea]:visible').count(),aiCount);
 await page.getByRole('searchbox').fill('Vaswani');assert.equal(await page.locator('[data-idea]:visible').count(),1);
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-idea]:visible').count(),1);
 await page.getByRole('button',{name:'Reset filters'}).click();
 await page.getByRole('searchbox').fill('AlphaFold');assert.equal(await page.locator('[data-idea]:visible').count(),2);
 await page.getByLabel('Order').selectOption('newest');
 assert.match(await page.locator('[data-idea]:visible').first().innerText(),/AlphaFold 3/);
 await go('/timeline');assert.equal(await page.locator('[data-timeline-event]').count(),data.counts.contributions);
 await page.getByLabel('Period').selectOption('ancient');
 assert.equal(await page.locator('a[href="/innovations/alphafold-3"]').isVisible(),false);
 await page.getByLabel('Period').selectOption('modern');
 assert.equal(await page.locator('a[href="/innovations/alphafold-3"]').isVisible(),true);
 console.log('PASS AI field and author search, URL persistence, chronological ordering, and timeline filtering');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/innovations','/innovations/transformer','/innovations/alphafold-3','/innovations/crispr-cas9']){
   await go(path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} overflow at ${width}`);
  }
 }
 await go('/innovations');await page.screenshot({path:'.shots/innovations/index-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await go('/innovations/transformer');
 await page.screenshot({path:'.shots/innovations/article-phone.png',fullPage:true});
 await page.getByRole('button',{name:'Toggle dark mode'}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'.shots/innovations/article-light.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS phone/tablet/desktop layouts, light theme, and zero browser errors');
}finally{await browser.close();}
