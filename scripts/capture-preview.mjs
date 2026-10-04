import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
mkdirSync('.shots/v2',{recursive:true});
async function capture(path,name,width,height){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4322'+path,{waitUntil:'networkidle'});
 await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(async img=>{img.loading='eager';try{await img.decode();}catch{}}));});
 if(path.startsWith('/lab/')){await page.waitForSelector('canvas');await page.waitForFunction(()=>{const c=document.querySelector('canvas');if(!c?.width)return false;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const colors=new Set();for(let i=0;i<d.length;i+=212)colors.add(`${d[i]},${d[i+1]},${d[i+2]}`);return colors.size>10;});}
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`.shots/v2/${name}.png`,fullPage:true});
}
try{await capture('/','home-desktop',1440,1000);await capture('/','home-mobile',390,844);await capture('/lab/photoelectric','lab-photoelectric-desktop',1440,1000);await capture('/lab/induction','lab-induction-desktop',1440,1000);await capture('/explore','archive-desktop',1440,1000);await capture('/paths','paths-desktop',1440,1000);}finally{await browser.close();}
