import type { ArgumentDef } from '../kernel/types';
export default {
 id:'syllogism', title:'When does a conclusion follow?', thesis:'If every human is mortal and Socrates is human, Socrates is mortal.',
 claims:[
 {id:'all',kind:'premise',text:'Every human is mortal.',cite:'Teaching example of categorical inference; compare Prior Analytics I.1–4.'},
 {id:'member',kind:'premise',text:'Socrates is human.',note:'This familiar example is a modern teaching reconstruction, not a quotation from Aristotle.'},
 {id:'result',kind:'conclusion',text:'Socrates is mortal.',from:['all','member'],move:'Whatever belongs to every member of a class belongs to this member.'}
 ], notice:'Rejecting a premise removes this argument’s support for the conclusion. It does not prove that the conclusion is false. Validity and truth are different questions.'
} satisfies ArgumentDef;
