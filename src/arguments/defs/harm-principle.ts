import type { ArgumentDef } from '../kernel/types';
export default {
 id:'harm-principle',title:'When may we interfere?',thesis:'In this restricted case, disapproval alone does not justify coercing a competent adult.',
 claims:[
 {id:'adult',kind:'premise',text:'The person is an adult with the capacity to make this choice.',cite:'On Liberty, chapter I; this teaching case omits Mill’s contested historical exclusions.'},
 {id:'self',kind:'premise',text:'The conduct in this case harms no other person.',note:'This is an assumption for the case, not a claim that every real action is purely self-regarding.'},
 {id:'principle',kind:'premise',text:'Preventing harm to others, rather than enforcing a person’s own good, is the relevant justification for coercion.',cite:'On Liberty, chapter I; paraphrase of Mill’s proposed principle.'},
 {id:'boundary',kind:'step',text:'The stated harm-based justification is absent in this case.',from:['self','principle'],move:'The conduct does not meet the principle’s limiting condition.'},
 {id:'result',kind:'conclusion',text:'Mere dislike of this competent adult’s choice does not justify coercion.',from:['adult','boundary'],move:'Apply the principle within the specified scope.'}
 ],notice:'This is an application of Mill’s principle, not a proof of the principle itself. Reject “harms no other person” to reveal how much turns on that judgment.'
} satisfies ArgumentDef;
