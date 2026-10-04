import type { ArgumentDef } from '../kernel/types';
export default {
 id:'epicurean-death',title:'Can death harm the person who dies?',thesis:'On an experience-based account of harm, being dead is not a suffering one undergoes.',
 claims:[
 {id:'experience',kind:'premise',text:'Something is bad for us only insofar as it involves experience or sensation.',cite:'Epicurus, Letter to Menoeceus 124; an explicit reading of the evaluative premise.'},
 {id:'absence',kind:'premise',text:'Being dead is the absence of sensation.',cite:'Letter to Menoeceus 124.'},
 {id:'result',kind:'conclusion',text:'Being dead is not bad for us as an experienced suffering.',from:['experience','absence'],move:'Apply the experience-based condition to the absence of sensation.'}
 ],notice:'This concerns being dead, not the pain of dying or grief. A deprivation account can reject the first premise: losing a valuable possible future might harm someone without being experienced.'
} satisfies ArgumentDef;
