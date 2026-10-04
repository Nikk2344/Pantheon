// Dimensionless Lennard-Jones pair model. A teaching curve, not a material calculation.
export function pairPotential(r:number){if(r<=0)throw new RangeError('Separation must be positive');return 4*(r**-12-r**-6);}
export function pairForce(r:number){if(r<=0)throw new RangeError('Separation must be positive');return 24*(2*r**-13-r**-7);}
export function harmonicWeights(richness:number){const h=Math.max(0,Math.min(1,richness));return [1,.5*h,.25*h,.125*h];}
export function waveValue(phase:number,richness:number){const w=harmonicWeights(richness);return w.reduce((sum,a,i)=>sum+a*Math.sin((i+1)*phase),0)/w.reduce((a,b)=>a+b,0);}
export function wavelength(frequency:number){return 343/frequency;}
