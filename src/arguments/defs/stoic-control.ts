import type { ArgumentDef } from '../kernel/types';
export default {
 id:'stoic-control',title:'What should your peace depend on?',thesis:'Do not make an undisturbed life depend on commanding what is not yours to command.',
 claims:[
 {id:'scope',kind:'premise',text:'Our judgments and choices differ from external outcomes that we cannot command.',cite:'Epictetus, Encheiridion 1; teaching paraphrase.'},
 {id:'dependence',kind:'premise',text:'Demanding guaranteed control of those external outcomes exposes us to frustration when they resist us.',cite:'Encheiridion 1; reconstruction of the practical warning.'},
 {id:'aim',kind:'premise',text:'An undisturbed and responsible life is an aim worth pursuing.',note:'This evaluative premise is part of the Stoic position, not a neutral logical fact.'},
 {id:'focus',kind:'conclusion',text:'Train judgment and choice rather than making peace depend on guaranteed external success.',from:['scope','dependence','aim'],move:'Practical recommendation given the stated aim and limits.',note:'This does not imply that helping others or changing institutions is pointless.'}
 ],notice:'A teaching reconstruction of Encheiridion 1, not a verbatim proof. Reject the control distinction or the stated aim to locate the disagreement.'
} satisfies ArgumentDef;
