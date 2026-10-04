import type { ArgumentDef } from '../kernel/types';
export default {
 id:'dependent-arising',title:'Can a dependent thing be independent?',thesis:'What depends on conditions lacks an independent intrinsic nature.',
 claims:[
 {id:'definition',kind:'premise',text:'An independent intrinsic nature would not depend on other conditions.',cite:'Mūlamadhyamakakārikā, chapter XV; simplified interpretive reconstruction.'},
 {id:'dependent',kind:'premise',text:'The thing under examination depends on conditions.',note:'Consider a cart’s dependence on parts and their arrangement.'},
 {id:'incompatible',kind:'step',text:'Dependence is incompatible with independence in the specified sense.',from:['definition','dependent'],move:'Apply the definition to the proposed case.'},
 {id:'empty',kind:'conclusion',text:'This thing is empty of independent intrinsic nature.',from:['incompatible'],move:'Emptiness here means absence of that nature, not absence of conventional functioning.'}
 ],notice:'An introductory reconstruction, not a complete proof of Madhyamaka. It leaves open which dependencies can be established and how different traditions interpret them.'
} satisfies ArgumentDef;
