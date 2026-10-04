import { useState } from 'react';
export default function KnowledgeCheck({question,answers,correct,explanation}:{question:string;answers:string[];correct:number;explanation:string}) {
 const [choice,setChoice]=useState<number|null>(null);
 return <section className="knowledge-check"><p className="eyebrow">CHECK YOUR INTUITION</p><h2>{question}</h2><div className="quiz-options">{answers.map((answer,i)=><button key={answer} className="button secondary" aria-pressed={choice===i} onClick={()=>setChoice(i)}>{answer}</button>)}</div>{choice!==null && <div role="status" className="quiz-feedback"><strong>{choice===correct?'That’s right.':'Try another prediction.'}</strong><p>{explanation}</p><button className="inline-link" onClick={()=>setChoice(null)}>Try again ↺</button></div>}</section>;
}
