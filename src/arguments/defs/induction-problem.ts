import type { ArgumentDef } from '../kernel/types';
export default {
 id:'induction-problem',title:'Can the past guarantee the future?',thesis:'Experience alone cannot provide a non-circular proof that the future will resemble the past.',
 claims:[
 {id:'observed',kind:'premise',text:'Experience directly supplies observations of what has happened.',cite:'Enquiry concerning Human Understanding, section IV.'},
 {id:'conceivable',kind:'premise',text:'A future different from the past is conceivable without contradiction.',cite:'Enquiry, section IV, part II.'},
 {id:'deduction',kind:'step',text:'Past regularity does not deductively entail future regularity.',from:['observed','conceivable'],move:'A deduction cannot allow true premises and a false conclusion.'},
 {id:'circular',kind:'premise',text:'Citing the past success of induction already assumes that past patterns support future expectations.',cite:'Enquiry, section IV, part II.'},
 {id:'result',kind:'conclusion',text:'Neither deduction from observations nor induction’s past success supplies the required non-circular guarantee.',from:['deduction','circular'],move:'The proposed routes either lack entailment or assume what is being defended.'}
 ],notice:'A simplified reconstruction of Hume’s challenge. Removing support does not refute Hume; it shows where this reconstruction depends on a disputed step. Practical prediction can continue without a deductive guarantee.'
} satisfies ArgumentDef;
