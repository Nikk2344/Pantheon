import {useEffect,useMemo,useRef,useState} from 'react';
import {DAY,MAX_DATE,MIN_DATE,PLANETS,planetPosition,projectPosition} from '../lib/solar-system';
import '../styles/solar.css';

function PlanetPortrait({id}:{id:string}) {
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let cancelled=false;const img=new Image();
  img.onload=()=>{if(cancelled||!ref.current)return;const size=256,source=document.createElement('canvas');source.width=img.width;source.height=img.height;
   const ctx=source.getContext('2d'),out=ref.current.getContext('2d');if(!ctx||!out)return;ctx.drawImage(img,0,0);const texture=ctx.getImageData(0,0,img.width,img.height).data,frame=out.createImageData(size,size);
   // Inverse orthographic projection wraps the equirectangular map onto a sphere.
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=(x-size/2)/(size/2-2),ny=(y-size/2)/(size/2-2),r=nx*nx+ny*ny;if(r>1)continue;const nz=Math.sqrt(1-r),u=(.5+Math.atan2(nx,nz)/(2*Math.PI)+.13)%1,v=.5+Math.asin(ny)/Math.PI;
    const offset=(Math.min(img.height-1,Math.floor(v*img.height))*img.width+Math.min(img.width-1,Math.floor(u*img.width)))*4,k=(y*size+x)*4,light=.14+.86*Math.max(0,-.45*nx-.3*ny+.84*nz);
    for(let c=0;c<3;c++)frame.data[k+c]=texture[offset+c]*light;frame.data[k+3]=Math.min(255,(1-r)*size*128);
   }out.putImageData(frame,0,0);
  };img.src=`/textures/${id}.jpg`;return()=>{cancelled=true;};
 },[id]);
 return <div className={`planet-portrait ${id==='saturn'?'with-rings':''}`}><canvas ref={ref} width="256" height="256" role="img" aria-label={`${id} mapped globe illustration`}/></div>;
}
export default function SolarSystem(){
 const [time,setTime]=useState<number|null>(null),[selected,setSelected]=useState(2),[speed,setSpeed]=useState(1),[paused,setPaused]=useState(false),[scale,setScale]=useState(false),[hi,setHi]=useState(false),[error,setError]=useState('');
 const [dateInput,setDateInput]=useState('');const root=useRef<HTMLElement>(null);
 const clock=useRef({time:0,last:0,visible:true});
 useEffect(()=>{const now=Date.now();clock.current.time=Math.max(MIN_DATE,Math.min(MAX_DATE,now));setTime(clock.current.time);setDateInput(new Date(clock.current.time).toISOString().slice(0,10));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');setPaused(reduced.matches);const reduce=()=>{if(reduced.matches)setPaused(true);};reduced.addEventListener('change',reduce);
  const observer=new IntersectionObserver(entries=>{clock.current.visible=entries[0].isIntersecting;clock.current.last=performance.now();});if(root.current)observer.observe(root.current);
  return()=>{observer.disconnect();reduced.removeEventListener('change',reduce);};
 },[]);
 useEffect(()=>{const sync=()=>setHi(document.documentElement.dataset.language==='hinglish');sync();document.addEventListener('pantheon-language',sync);return()=>document.removeEventListener('pantheon-language',sync);},[]);
 useEffect(()=>{clock.current.last=performance.now();const tick=setInterval(()=>{const now=performance.now(),dt=now-clock.current.last;clock.current.last=now;if(paused||document.hidden||!clock.current.visible)return;
   const next=speed===1?Date.now():clock.current.time+Math.min(dt,250)*speed;
   clock.current.time=Math.max(MIN_DATE,Math.min(MAX_DATE,next));setTime(clock.current.time);
   if(next>MAX_DATE||next<MIN_DATE){setPaused(true);setError('End of the supported date range. Choose another date or return to Now.');}
  },speed===1?1000:50);return()=>clearInterval(tick);},[speed,paused]);
 const planet=PLANETS[selected];
 const positions=useMemo(()=>time===null?[]:PLANETS.map(p=>planetPosition(p,time)),[time]);
 const paths=useMemo(()=>time===null?[]:PLANETS.map((p,i)=>Array.from({length:121},(_,j)=>{const v=projectPosition(planetPosition(p,time,j/120*2*Math.PI),i,scale);return `${j?'L':'M'}${v.x.toFixed(2)},${v.y.toFixed(2)}`;}).join(' ')+'Z'),[time===null?null:Math.floor(time/DAY),scale]);
 const now=()=>{const n=Math.max(MIN_DATE,Math.min(MAX_DATE,Date.now()));clock.current.time=n;setTime(n);setDateInput(new Date(n).toISOString().slice(0,10));setSpeed(1);setPaused(false);setError('');};
 const chooseDate=()=>{const value=Date.parse(dateInput+'T12:00:00Z');if(!Number.isFinite(value)||value<MIN_DATE||value>MAX_DATE){setError('Choose a date from 1800 through 2049.');return;}clock.current.time=value;setTime(value);setSpeed(864000);setPaused(true);setError('');};
 return <section className="solar-system" ref={root} aria-labelledby="solar-title" data-ready={time!==null}>
  <header className="solar-header"><div><p className="eyebrow">YOUR COSMIC NEIGHBOURHOOD</p><h2 id="solar-title">{hi?'Hamara Solar System':'The solar system, right now.'}</h2></div><span className={`solar-status ${paused?'is-paused':''}`}>{time===null?'Setting the clock…':paused?'Paused':speed===1?'Current calculated positions':'Time-lapse · simulated time'}</span></header>
  <div className="solar-layout"><div className="solar-stage">
   <svg viewBox="0 0 600 560" aria-label="Solar system viewed from north of the ecliptic; planet sizes enlarged" role="img">
    <defs><radialGradient id="sun-glow"><stop stopColor="#fff4b3"/><stop offset=".45" stopColor="#ffc969"/><stop offset="1" stopColor="#ef792e"/></radialGradient>
     {PLANETS.map(p=><pattern key={p.id} id={`map-${p.id}`} width="1" height="1" patternContentUnits="objectBoundingBox"><image href={`/textures/${p.id}.jpg`} width="2" height="1" x="-.5" preserveAspectRatio="none"/></pattern>)}
     <radialGradient id="planet-shade" cx="30%" cy="25%" r="80%"><stop stopColor="#fff" stopOpacity=".12"/><stop offset=".5" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".9"/></radialGradient>
    </defs>
    {Array.from({length:60},(_,i)=><circle key={i} cx={(i*173+13)%598} cy={(i*97+31)%558} r={i%4===0?1:.55} fill="#afbdd6" opacity=".3"/>)}
    {paths.map((d,i)=><path key={i} d={d} fill="none" stroke={selected===i?PLANETS[i].color:'#91a1bc'} strokeOpacity={selected===i?.45:.15} strokeWidth={selected===i?1.4:.8}/>)}
    <circle cx="300" cy="280" r="26" fill="#ffb75e" opacity=".06"/><circle cx="300" cy="280" r="16" fill="url(#sun-glow)"/><text x="300" y="314" textAnchor="middle" className="sun-label">SUN</text>
    {positions.map((p,i)=>{const v=projectPosition(p,i,scale),planet=PLANETS[i];return <g key={planet.id} transform={`translate(${v.x},${v.y})`} className="solar-marker" onClick={()=>setSelected(i)}>
     <circle r={Math.max(17,planet.size+5)} fill="transparent"/>{selected===i&&<circle r={planet.size+5} fill="none" stroke={planet.color} strokeDasharray="2 3"/>}
     {planet.id==='saturn'&&<ellipse rx="30" ry="10" transform="rotate(-25)" fill="none" stroke="#d6bf8e" strokeWidth="5" opacity=".65"/>}
     <circle r={planet.size} fill={`url(#map-${planet.id})`}/><circle r={planet.size} fill="url(#planet-shade)"/>
     {(!scale||selected===i)&&<text y={planet.size+19} textAnchor="middle" fill={planet.color}>{planet.name}</text>}
    </g>;})}
   </svg>
   {time===null&&<p className="solar-loading">Enable JavaScript to calculate positions for the current time.</p>}
   <div className="solar-map-note">North ecliptic view · {scale?'AU distance scale':'Orbits spaced for clarity'} · sizes enlarged</div>
  </div><aside className="solar-detail" aria-label="Selected planet details">
   <div className="planet-selector" role="group" aria-label="Choose a planet">{PLANETS.map((p,i)=><button key={p.id} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}><span style={{background:p.color}}/>{p.name}</button>)}</div>
   <div className="planet-detail-copy" aria-live="polite" aria-atomic="true"><PlanetPortrait id={planet.id}/><p className="eyebrow">0{selected+1} / 08 · {selected<4?'TERRESTRIAL PLANET':selected<6?'GAS GIANT':'ICE GIANT'}</p><h3>{planet.name}</h3><p lang={hi?'hi-Latn':'en'}>{hi?planet.hinglish:planet.description}</p><dl><div><dt>{hi?'Ek saal':'One orbit'}</dt><dd>{planet.year}</dd></div></dl></div>
   <dl className="solar-distance"><div><dt>{hi?'Sun se abhi doori':'Distance from the Sun'}</dt><dd>{positions[selected]?.distance.toFixed(3)??'—'} <abbr title="Astronomical units: one AU is about 149.6 million kilometres">AU</abbr></dd></div></dl>
   <a className="solar-source-link" href={`https://science.nasa.gov/${planet.id}/facts/`} target="_blank" rel="noreferrer">Explore {planet.name} at NASA ↗</a>
  </aside></div>
  <div className="solar-console"><div className="solar-time"><span className="eyebrow">{speed===1&&!paused?'CURRENT UTC':'DISPLAYED UTC'}</span><time dateTime={time===null?undefined:new Date(time).toISOString()}>{time===null?'Calculating…':new Date(time).toISOString().replace('T',' · ').slice(0,21)}</time></div>
   <div className="solar-controls"><button type="button" disabled={time===null} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'Play motion':'Pause motion'}</button><label>Speed<select aria-label="Speed" value={speed} onChange={e=>{setSpeed(Number(e.target.value));setPaused(false);setError('');}}><option value="1">Real time</option><option value="86400">1 day / second</option><option value="864000">10 days / second</option><option value="2592000">30 days / second</option></select></label><button type="button" onClick={now}>↺ Now</button><button type="button" aria-pressed={scale} onClick={()=>setScale(v=>!v)}>{scale?'Spaced orbits':'True distance scale'}</button></div>
  </div>
  <p className="solar-hint">{hi?'Real time mein movement bahut slow hoti hai. Speed badhao aur dekho: inner planets apna orbit jaldi complete karte hain.':'Real orbital motion is almost imperceptible here. Try 10 days / second and watch the inner planets race ahead.'}</p>
  <details className="solar-method"><summary>Choose a date · how accurate is this?</summary><div className="solar-method-body"><div className="solar-date"><label htmlFor="solar-date">Date (1800–2049)</label><input id="solar-date" type="date" min="1800-01-01" max="2049-12-31" value={dateInput} onChange={e=>setDateInput(e.target.value)}/><button type="button" onClick={chooseDate}>Show date</button></div>{error&&<p role="alert">{error}</p>}<p>Positions are calculated on your device from <a href="https://ssd.jpl.nasa.gov/planets/approx_pos.html">JPL’s published orbital elements</a>, using your device clock. This is an approximate ephemeris, not a live camera or telemetry feed. Earth represents the Earth–Moon barycenter. UTC is used as an approximation to dynamical time.</p><p>Spaced mode enlarges each orbit independently while retaining its shape and orientation. True-distance mode uses one AU scale; planets are still enlarged. Surface maps, lighting, rings and background stars are illustrative: they do not show current weather, rotation, phase or the sky from Earth. Moons and dwarf planets are omitted.</p><p>Maps: <a href="https://www.solarsystemscope.com/textures/">Solar System Scope / INOVE</a>, based on NASA imagery, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; wrapped and shaded here. Colors are enhanced and some map gaps are reconstructed. Facts: <a href="https://science.nasa.gov/solar-system/planets/">NASA’s planet guides</a>.</p><a href="/lab/orbit">Try changing gravity in the orbital mechanics lab ↗</a></div></details>
 </section>;
}
