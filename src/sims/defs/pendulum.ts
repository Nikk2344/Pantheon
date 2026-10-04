import type { SimDef } from '../kernel/types';
const params = { length:{label:'Length',min:.3,max:3,step:.1,value:1.5,unit:'m',reinit:true}, gravity:{label:'Gravity',min:1.6,max:20,step:.1,value:9.8,unit:'m/s²',reinit:true}, angle:{label:'Release angle',min:5,max:60,step:1,value:20,unit:'°',reinit:true} };
type State = {theta:number;omega:number;t:number};
export default {
 id:'pendulum',title:'The pendulum: length changes the rhythm',mode:'sandbox',params,
 init:p=>({theta:p.angle*Math.PI/180,omega:0,t:0}),
 step(s,dt,p){ const a=-p.gravity/p.length*Math.sin(s.theta); s.theta+=s.omega*dt+.5*a*dt*dt; const next=-p.gravity/p.length*Math.sin(s.theta);s.omega+=(a+next)*dt/2;s.t+=dt; },
 draw({ctx:c,width:w,height:h,palette:p},s,v){c.fillStyle=p.bg;c.fillRect(0,0,w,h);const k=Math.min(w/640,h/360);const x=w*.5,y=h*.15,l=h*.62; c.strokeStyle=p.grid;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x,h*.86);c.stroke();c.beginPath();c.arc(x,y,l,Math.PI/2-Math.PI/3,Math.PI/2+Math.PI/3);c.stroke();const bx=x+l*Math.sin(s.theta),by=y+l*Math.cos(s.theta);c.strokeStyle=p.ink;c.lineWidth=2*k;c.beginPath();c.moveTo(x,y);c.lineTo(bx,by);c.stroke();c.fillStyle=p.warm;c.beginPath();c.arc(bx,by,15*k,0,Math.PI*2);c.fill();c.fillStyle=p.muted;c.font=`${12*k}px monospace`;c.fillText(`L = ${v.length.toFixed(1)} m`,20*k,25*k);c.fillText('No friction · numerical nonlinear model',20*k,h-18*k);},
 readouts:(s,p)=>[{label:'Small-angle period',value:`${(2*Math.PI*Math.sqrt(p.length/p.gravity)).toFixed(2)} s`,tone:'warm'},{label:'Angle',value:`${(s.theta*180/Math.PI).toFixed(1)}°`},{label:'Time',value:`${s.t.toFixed(1)} s`}],
 equation:'T \\approx 2\\pi\\sqrt{L/g}',notice:'Double the length: the period grows by √2, not two. Motion uses the nonlinear pendulum equation; the displayed period is the small-angle approximation. Drawing length is scaled to fit the canvas.'
} satisfies SimDef<State,typeof params>;
