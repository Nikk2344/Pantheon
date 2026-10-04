/** Ideal two-qubit pure states, in |q0 q1> order: 00, 01, 10, 11. */
export type Complex = { re: number; im: number };
export type State = [Complex, Complex, Complex, Complex];
export type Gate = { kind: 'H' | 'X' | 'Z' | 'S' | 'CNOT'; target: 0 | 1 };
const c = (re = 0, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex) => c(a.re+b.re,a.im+b.im);
const mul = (a: Complex, b: Complex) => c(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const scale = (a: Complex, n: number) => c(a.re*n,a.im*n);
export const initialState = (): State => [c(1),c(),c(),c()];
export function applyGate(state: State, gate: Gate): State {
 const result = state.map(a=>({...a})) as State;
 // For CNOT, target is the target wire; the other wire is the control.
 const mask = gate.target === 0 ? 2 : 1;
 for(let i=0;i<4;i++) {
  if(i & mask) continue;
  const j=i|mask, a=state[i], b=state[j];
  if(gate.kind==='H'){result[i]=scale(add(a,b),Math.SQRT1_2);result[j]=scale(add(a,scale(b,-1)),Math.SQRT1_2);}
  if(gate.kind==='X' || (gate.kind==='CNOT' && (i & (mask===2?1:2)))){result[i]={...b};result[j]={...a};}
  if(gate.kind==='Z')result[j]=scale(b,-1);
  if(gate.kind==='S')result[j]=c(-b.im,b.re);
 }
 return result;
}
export function runCircuit(gates: Gate[], steps = gates.length): State {return gates.slice(0,steps).reduce(applyGate,initialState());}
export function probabilities(state: State): number[] {return state.map(a=>a.re*a.re+a.im*a.im);}
export function concurrence(state: State): number {
 const ad=mul(state[0],state[3]),bc=mul(state[1],state[2]);
 return Math.min(1,2*Math.hypot(ad.re-bc.re,ad.im-bc.im));
}
export function measure(state: State, random: () => number = Math.random): { outcome: number; state: State } {
 const probs=probabilities(state);const total=probs.reduce((a,b)=>a+b,0);
 if(!Number.isFinite(total)||Math.abs(total-1)>1e-8)throw new Error('Measurement requires a normalized state.');
 const r=random();if(r<0||r>=1||!Number.isFinite(r))throw new Error('Random sample must be in [0,1).');
 let cumulative=0, outcome=probs.findLastIndex(p=>p>0);
 for(let i=0;i<4;i++){cumulative+=probs[i];if(r<cumulative){outcome=i;break;}}
 const collapsed=[c(),c(),c(),c()] as State;collapsed[outcome]=c(1);
 return {outcome,state:collapsed};
}
export function sampleShots(state: State, shots=1000, random: () => number = Math.random): number[] {
 const counts=[0,0,0,0];for(let i=0;i<shots;i++)counts[measure(state,random).outcome]++;return counts;
}
