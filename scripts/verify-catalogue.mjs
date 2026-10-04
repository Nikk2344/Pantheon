import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const BASE=process.env.BASE_URL||'http://127.0.0.1:4322';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const go=async path=>{const r=await page.goto(BASE+path,{waitUntil:'networkidle'});if(r)assert.equal(r.status(),200,path);else assert.equal(page.url(),new URL(path,BASE).href);};
mkdirSync('.shots/catalogue',{recursive:true});
try{
 await go('/discoveries');assert.equal(await page.locator('[data-idea]:visible').count(),24);await page.getByRole('button',{name:'Show more ideas'}).click();assert.equal(await page.locator('[data-idea]:visible').count(),48);
 await page.getByRole('searchbox').fill('Noether');assert.equal(await page.locator('[data-idea]:visible').count(),2);await page.reload();assert.equal(await page.getByRole('searchbox').inputValue(),'Noether');assert.equal(await page.locator('[data-idea]:visible').count(),2);
 await page.getByLabel('Discipline').selectOption('philosopher');assert.equal(await page.locator('#idea-empty').isVisible(),true);await page.getByRole('button',{name:'Reset filters'}).click();await page.getByLabel('With an interactive experiment or argument').check();assert.ok(await page.locator('[data-idea]:visible').count()>10);
 console.log('PASS idea search, pagination, URL restoration, combined filters, and empty state');
 for(const [id,index] of [['epictetus',1],['mary-wollstonecraft',1],['epicurus',2]]){await go(`/p/${id}#discovery-${index}`);await page.locator(`#discovery-${index}`).scrollIntoViewIfNeeded();const reject=page.getByRole('button',{name:'Reject',exact:true});await reject.first().click();assert.ok(await page.getByRole('button',{name:'Restore',exact:true}).count()>0);await page.getByRole('button',{name:'Grant it all again'}).click();assert.equal(await page.getByRole('button',{name:'Restore',exact:true}).count(),0);}
 console.log('PASS three additional philosophical argument maps');
 await go('/topics/quantum-computing#playground');await page.locator('.quantum-lab').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Bell pair',exact:true}).click();assert.match(await page.locator('.entanglement-readout').innerText(),/1.00/);
 const probability=async bits=>page.locator(`[data-outcome="${bits}"] strong`).innerText();
 assert.equal(await probability('00'),'50.0%');assert.equal(await probability('11'),'50.0%');await page.getByRole('button',{name:'Run 1,000 shots'}).click();assert.equal(await page.locator('.shot-results').isVisible(),true);
 await page.getByRole('button',{name:'Measure once'}).click();const measured=await page.locator('.probability-chart').innerText();await page.getByRole('button',{name:'Measure once'}).click();assert.equal(await page.locator('.probability-chart').innerText(),measured);assert.equal(await page.getByRole('button',{name:'Run 1,000 shots'}).isDisabled(),true);await page.getByRole('button',{name:'Re-prepare circuit'}).click();assert.equal(await probability('00'),'50.0%');
 await page.getByRole('button',{name:'Interference',exact:true}).click();assert.equal(await probability('10'),'100.0%');await page.getByLabel('Inspect circuit step').fill('2');await page.getByLabel('Inspect circuit step').dispatchEvent('input');assert.equal(await probability('00'),'50.0%');assert.match(await page.locator('.state-readout').innerText(),/-0.707/);
 await page.getByRole('button',{name:'Clear circuit'}).click();await page.getByLabel('Target qubit').selectOption('1');await page.getByRole('button',{name:'Add X',exact:true}).click();assert.equal(await probability('01'),'100.0%');await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await probability('00'),'100.0%');
 for(let i=0;i<12;i++)await page.getByRole('button',{name:'Add H',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Add H',exact:true}).isDisabled(),true);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'12-gate circuit must scroll within its panel');
 await page.getByRole('button',{name:'Bell pair',exact:true}).click();await page.locator('.quantum-lab').screenshot({path:'.shots/catalogue/quantum-mobile.png'});
 console.log('PASS quantum probabilities, interference, measurement collapse, gate editing, and mobile overflow');
 for(const width of [390,768,1024,1440]){await page.setViewportSize({width,height:1000});for(const path of ['/topics','/discoveries','/philosophers','/p/mahavira','/p/hypatia','/topics/quantum-computing']){await go(path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} overflows at ${width}`);}}
 await page.setViewportSize({width:1440,height:1000});await go('/topics/quantum-computing#playground');await page.locator('.quantum-lab').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Bell pair',exact:true}).click();await page.locator('.quantum-lab').screenshot({path:'.shots/catalogue/quantum-desktop.png'});
 for(const [path,name] of [['/topics','topics'],['/discoveries','ideas'],['/philosophers','philosophers']]){await go(path);await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.slice(0,8).map(async i=>{i.loading='eager';await i.decode().catch(()=>{});}));});await page.screenshot({path:`.shots/catalogue/${name}.png`});}
 await page.getByRole('button',{name:'Toggle dark mode'}).click();await go('/topics');await page.screenshot({path:'.shots/catalogue/topics-light.png'});
 assert.deepEqual(errors,[]);console.log('PASS responsive layouts, light theme, and zero browser errors');
}finally{await browser.close();}
