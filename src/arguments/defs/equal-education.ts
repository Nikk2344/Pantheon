import type { ArgumentDef } from '../kernel/types';
export default {
 id:'equal-education',title:'Can unequal training establish unequal capacity?',thesis:'Observed differences under unequal education do not by themselves establish natural inferiority.',
 claims:[
 {id:'training',kind:'premise',text:'Education and social expectations substantially shape the exercise of judgment.',cite:'Wollstonecraft, A Vindication of the Rights of Woman, chapters 2–3; paraphrase.'},
 {id:'unequal',kind:'premise',text:'The women under discussion have been trained for dependence and denied comparable intellectual education.',cite:'Vindication, chapters 2–3; historical diagnosis.'},
 {id:'alternative',kind:'step',text:'Unequal training provides an alternative explanation for differences in observed achievement.',from:['training','unequal'],move:'Identify a competing causal explanation.'},
 {id:'inference',kind:'premise',text:'An observation does not establish an innate cause when a relevant alternative explanation remains unexcluded.',note:'Methodological premise made explicit for this reconstruction.'},
 {id:'result',kind:'conclusion',text:'Those observations alone do not prove women naturally less capable of rational judgment.',from:['alternative','inference'],move:'Reject an underdetermined inference, without claiming to settle every empirical question.'}
 ],notice:'A limited reconstruction of one line of Wollstonecraft’s critique. It tests an inference about education, rather than reproducing her entire argument for rights.'
} satisfies ArgumentDef;
