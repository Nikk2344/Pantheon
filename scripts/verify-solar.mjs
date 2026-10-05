import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const BASE=process.env.BASE_URL||'http://127.0.0.1:4322';
mkdirSync('.shots/solar',{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto(BASE,{waitUntil:'networkidle'});await page.waitForSelector('.solar-system[data-ready=true]');
 assert.equal(await page.getByRole('group',{name:'Choose a planet'}).getByRole('button').count(),8);
 const displayed=()=>page.locator('.solar-time time').getAttribute('datetime');
 assert.ok(Math.abs(Date.parse(await displayed())-Date.now())<5000);
 for(const planet of ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune']){
  await page.getByRole('button',{name:planet,exact:true}).click();assert.equal(await page.locator('.planet-detail-copy h3').innerText(),planet);
  await page.waitForFunction(()=>{const c=document.querySelector('.planet-portrait canvas');return c.getContext('2d').getImageData(128,128,1,1).data[3]>0;});
 }
 await page.getByRole('button',{name:'Earth',exact:true}).click();
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();const frozen=await displayed();
 await page.waitForTimeout(1100);assert.equal(await displayed(),frozen);
 await page.getByLabel('Speed',{exact:true}).selectOption('864000');
 await page.waitForFunction(previous=>Date.parse(document.querySelector('.solar-time time').dateTime)>Date.parse(previous)+86400000,frozen);
 assert.match(await page.locator('.solar-status').innerText(),/Time-lapse/);
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await page.getByText('Choose a date · how accurate is this?',{exact:true}).click();await page.getByLabel('Date (1800–2049)').fill('2000-01-01');await page.getByRole('button',{name:'Show date',exact:true}).click();assert.equal(await displayed(),'2000-01-01T12:00:00.000Z');
 await page.getByLabel('Date (1800–2049)').fill('2055-01-01');await page.getByRole('button',{name:'Show date',exact:true}).click();assert.match(await page.getByRole('alert').innerText(),/1800 through 2049/);
 await page.getByRole('button',{name:'↺ Now',exact:true}).click();assert.ok(Math.abs(Date.parse(await displayed())-Date.now())<5000);
 await page.getByRole('button',{name:'True distance scale',exact:true}).click();assert.match(await page.locator('.solar-map-note').innerText(),/AU distance scale/);await page.getByRole('button',{name:'Spaced orbits',exact:true}).click();
 await page.getByText('Choose a date · how accurate is this?',{exact:true}).click();
 await page.getByRole('button',{name:'Hinglish',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#solar-title')?.textContent==='Hamara Solar System');assert.match(await page.locator('#solar-title').innerText(),/Hamara/);assert.match(await page.locator('.planet-detail-copy').innerText(),/hamara ghar/);
 await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#solar-title')?.textContent==='Hamara Solar System');assert.equal(await page.getByRole('button',{name:'Hinglish',exact:true}).getAttribute('aria-pressed'),'true');
 await page.goto(BASE+'/p/j-robert-oppenheimer',{waitUntil:'networkidle'});assert.match(await page.locator('h1').innerText(),/Oppenheimer/);assert.equal(await page.getByRole('button',{name:'Hinglish',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByText('More languages',{exact:true}).click();assert.match(await page.locator('#translation-note').innerText(),/local preview/);
 await page.getByRole('button',{name:'English',exact:true}).click();
 await page.goto(BASE,{waitUntil:'networkidle'});await page.waitForSelector('.solar-system[data-ready=true]');
 for(const width of [390,768,1024,1440]){await page.setViewportSize({width,height:1100});await page.locator('.solar-system').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}`);await page.locator('.solar-system').screenshot({path:`.shots/solar/solar-${width}.png`});}
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'.shots/solar/home.png',fullPage:false});
 await page.getByRole('button',{name:'Toggle dark mode'}).click();await page.screenshot({path:'.shots/solar/home-light.png',fullPage:false});
 const reduced=await browser.newContext({reducedMotion:'reduce'}),rp=await reduced.newPage();await rp.goto(BASE,{waitUntil:'networkidle'});await rp.waitForSelector('.solar-system[data-ready=true]');assert.equal(await rp.getByRole('button',{name:'Play motion',exact:true}).getAttribute('aria-pressed'),'true');await reduced.close();
 assert.deepEqual(errors,[]);console.log('PASS solar clock, eight textured planets, dates, time-lapse, scale, language persistence, Oppenheimer, responsive layouts and reduced motion.');
}catch(error){await page.screenshot({path:".shots/solar/failure.png",fullPage:true});throw error;}finally{await browser.close();}
