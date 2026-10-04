// JPL Table 1: heliocentric J2000 ecliptic elements, valid 1800–2050.
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
export const DAY = 86400000;
export const MIN_DATE = Date.UTC(1800, 0, 1);
export const MAX_DATE = Date.UTC(2050, 0, 1) - 1;
type Elements = [number, number, number, number, number, number];
export interface Planet {
  id: string; name: string; color: string; size: number; year: string;
  description: string; hinglish: string; elements: Elements; rates: Elements;
}
export const PLANETS: Planet[] = [
  {id:'mercury',name:'Mercury',color:'#c8b7a3',size:7,year:'88 Earth days',description:'A small, cratered rocky world. With almost no atmosphere, its surface experiences extreme temperature changes.',hinglish:'Yeh chhota, rocky planet craters se bhara hai. Atmosphere bahut kam hai, isliye din aur raat ke temperature mein bahut bada farq hota hai.',elements:[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],rates:[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]},
  {id:'venus',name:'Venus',color:'#eacb90',size:10,year:'225 Earth days',description:'Thick clouds hide a rocky surface. Its dense carbon-dioxide atmosphere traps heat, making it the hottest planet.',hinglish:'Ghane clouds iski rocky surface ko chhupate hain. Carbon dioxide wala dense atmosphere heat ko rokta hai; Venus sabse garam planet hai.',elements:[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],rates:[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]},
  {id:'earth',name:'Earth',color:'#79b8e8',size:11,year:'365.26 Earth days',description:'Our ocean-covered home is the only world currently known to support life. Its atmosphere and liquid water shape a changing surface.',hinglish:'Yeh hamara ghar hai: oceans, atmosphere aur liquid water wala planet. Abhi tak life ka confirmed evidence sirf Earth par mila hai.',elements:[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],rates:[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]},
  {id:'mars',name:'Mars',color:'#e19472',size:8,year:'687 Earth days',description:'Iron minerals give Mars its rusty color. Dry channels and other geological evidence tell a story of ancient water.',hinglish:'Iron minerals ki wajah se Mars laal dikhta hai. Purane channels aur rocks se pata chalta hai ki kabhi yahan paani behta tha.',elements:[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],rates:[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]},
  {id:'jupiter',name:'Jupiter',color:'#dab696',size:21,year:'11.86 Earth years',description:'The largest planet is a gas giant. Cloud bands and immense storms move through its hydrogen-rich atmosphere.',hinglish:'Sabse bada planet ek gas giant hai. Iske hydrogen-rich atmosphere mein cloud bands aur bade storms dikhte hain.',elements:[5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],rates:[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]},
  {id:'saturn',name:'Saturn',color:'#e8d29e',size:18,year:'29.45 Earth years',description:'A gas giant surrounded by spectacular rings, made mostly of countless pieces of ice with some rock and dust.',hinglish:'Is gas giant ke rings ek solid disc nahi hain. Yeh zyadaatar barf ke bahut saare tukdon, aur kuch rock aur dust se bane hain.',elements:[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],rates:[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]},
  {id:'uranus',name:'Uranus',color:'#a0d7df',size:14,year:'84.02 Earth years',description:'This pale blue-green ice giant rotates almost on its side. Methane in its atmosphere absorbs red light.',hinglish:'Yeh pale blue-green ice giant lagbhag apni side par ghoomta hai. Atmosphere ka methane red light ko absorb karta hai.',elements:[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],rates:[-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589]},
  {id:'neptune',name:'Neptune',color:'#779edc',size:14,year:'164.8 Earth years',description:'The most distant of the eight planets is an ice giant with powerful winds. It takes nearly 165 years to circle the Sun.',hinglish:'Aath planets mein Sun se sabse door Neptune hai. Is ice giant par tez hawaayein chalti hain; ek orbit mein lagbhag 165 saal lagte hain.',elements:[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],rates:[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]},
];
const rad = Math.PI / 180;
export function solveKepler(mean: number, eccentricity: number) {
  if (!Number.isFinite(mean) || eccentricity < 0 || eccentricity >= 1) throw new RangeError('Invalid elliptic orbit');
  const m = Math.atan2(Math.sin(mean), Math.cos(mean));
  let e = m;
  for(let i=0;i<20;i++){const d=(e-eccentricity*Math.sin(e)-m)/(1-eccentricity*Math.cos(e));e-=d;if(Math.abs(d)<1e-12)break;}
  return e;
}
export function planetPosition(planet: Planet, milliseconds: number, eccentricAnomaly?: number) {
  if (!Number.isFinite(milliseconds) || milliseconds < MIN_DATE || milliseconds > MAX_DATE) throw new RangeError('Choose a date from 1800 through 2049');
  // UTC substitutes for TDB here; the minute-scale difference is negligible for this educational overview.
  const t=(milliseconds / DAY + 2440587.5 - 2451545)/36525;
  const [a,e,inc,l,peri,node]=planet.elements.map((v,i)=>v+planet.rates[i]*t);
  const E=eccentricAnomaly ?? solveKepler((l-peri)*rad,e);
  const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const w=(peri-node)*rad,n=node*rad,I=inc*rad;
  const x=(Math.cos(w)*Math.cos(n)-Math.sin(w)*Math.sin(n)*Math.cos(I))*xp+(-Math.sin(w)*Math.cos(n)-Math.cos(w)*Math.sin(n)*Math.cos(I))*yp;
  const y=(Math.cos(w)*Math.sin(n)+Math.sin(w)*Math.cos(n)*Math.cos(I))*xp+(-Math.sin(w)*Math.sin(n)+Math.cos(w)*Math.cos(n)*Math.cos(I))*yp;
  const z=Math.sin(w)*Math.sin(I)*xp+Math.cos(w)*Math.sin(I)*yp;
  return {x,y,z,a,distance:Math.hypot(x,y,z)};
}
export function projectPosition(p: ReturnType<typeof planetPosition>, index: number, trueScale: boolean) {
  const scale=trueScale?248/31:(48+index*28)/p.a;
  return {x:300+p.x*scale,y:280-p.y*scale};
}
