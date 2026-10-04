import {useEffect,useState} from 'react';
import {SCHOOLS} from '../data/schools';
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function SchoolAtlas(){
 const [query,setQuery]=useState(''),[area,setArea]=useState('All areas'),[ready,setReady]=useState(false);
 const [left,setLeft]=useState('stoicism'),[right,setRight]=useState('existentialism');
 useEffect(()=>{const p=new URLSearchParams(location.search);setQuery(p.get('q')??'');const a=p.get('area');if(a&&SCHOOLS.some(s=>s.area===a))setArea(a);setReady(true);},[]);
 useEffect(()=>{if(!ready)return;const u=new URL(location.href);query?u.searchParams.set('q',query):u.searchParams.delete('q');area==='All areas'?u.searchParams.delete('area'):u.searchParams.set('area',area);history.replaceState(null,'',u);},[query,area,ready]);
 const matches=SCHOOLS.filter(s=>(area==='All areas'||s.area===area)&&normalize([s.name,s.essence,s.area,s.reading,s.question,s.tension].join(' ')).includes(normalize(query)));
 return <>
 <div className="atlas-controls"><label>Search schools<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Stoicism, nihilism, Vedānta…"/></label><label>Area of inquiry<select value={area} onChange={e=>setArea(e.target.value)}>{['All areas',...new Set(SCHOOLS.map(s=>s.area))].map(a=><option key={a}>{a}</option>)}</select></label><button className="button" onClick={()=>{setQuery('');setArea('All areas');}}>Reset filters</button></div>
 <p className="atlas-count" role="status">{matches.length} of {SCHOOLS.length} schools and positions</p>
 <div className="atlas-grid">{matches.map(s=><a className="atlas-card" href={`/philosophy/schools/${s.id}`} key={s.id}><span className="eyebrow">{s.area}</span><h3>{s.name} <span aria-hidden="true">↗</span></h3><p>{s.essence}</p><span className="atlas-question">{s.question}</span></a>)}</div>
 {matches.length===0&&<p className="atlas-empty">No schools match. Try a broader term or reset the filters.</p>}
 <section className="section-space" id="compare"><p className="eyebrow">TWO IDEAS, SIDE BY SIDE</p><h2 className="atlas-heading">Compare without flattening the differences.</h2><p className="atlas-note">These are starting questions and editorial summaries, not scores or a test of which philosophy is right.</p><div className="compare-grid">{[[left,setLeft,'First school'],[right,setRight,'Second school']].map(([id,set,label])=>{const s=SCHOOLS.find(s=>s.id===id)!;return <article className="atlas-card" key={String(label)}><label>{String(label)}<select aria-label={String(label)} value={String(id)} onChange={e=>(set as (s:string)=>void)(e.target.value)}>{SCHOOLS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><h3>{s.name}</h3><dl><dt>Starting question</dt><dd>{s.question}</dd><dt>Central commitment</dt><dd>{s.essence}</dd><dt>A difficulty to examine</dt><dd>{s.tension}</dd></dl><a className="inline-link" href={`/philosophy/schools/${s.id}`}>Read the entry ↗</a></article>;})}</div></section>
 </>;
}
