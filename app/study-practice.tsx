import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {matchesName,type QuizMode,type QuizSession} from './study-quiz';

interface Props {
  quiz:QuizSession|null;count:number;ready:boolean;
  onStart:(mode:QuizMode)=>void;onAnswer:(correct:boolean,revealed?:boolean)=>void;onNext:()=>void;onEnd:()=>void;
}
export default function StudyPractice({quiz,count,ready,onStart,onAnswer,onNext,onEnd}:Props){
  const [answer,setAnswer]=useState('');
  const input=useRef<HTMLInputElement>(null),feedback=useRef<HTMLDivElement>(null);
  useEffect(()=>{setAnswer('');if(quiz?.mode==='name'&&!quiz.feedback)input.current?.focus();},[quiz?.index,quiz?.mode]);
  useEffect(()=>{if(quiz?.feedback)feedback.current?.focus();},[quiz?.feedback]);
  if(!quiz)return <section aria-label="Practice setup"><h2>Identification practice</h2><p className="study-note">Practice {count} named structures. Each concept can contain several modeled pieces.</p><div className="study-practice-modes"><Button disabled={!count||!ready} onClick={()=>onStart('name')}>Name a structure</Button><p>Type the atlas name of the highlighted structure. Case, spacing, and punctuation are ignored.</p><Button disabled={!count||!ready} onClick={()=>onStart('find')}>Find a structure</Button><p>Click or tap any piece belonging to the requested structure in a separated set. Pan and zoom to inspect small pieces.</p></div>{!ready&&<p role="status">Wait for the anatomy to finish loading.</p>}</section>;
  if(quiz.index>=quiz.questions.length)return <section aria-label="Practice results"><h2>Session complete</h2><p className="study-score">{quiz.correct} / {quiz.questions.length}</p><p>Correct on the first attempt</p><p className="study-note">Revealed answers count as missed. Missed structures are available in Revision.</p><div className="study-actions"><Button onClick={()=>onStart(quiz.mode)}>Practice again</Button><Button variant="outline" onClick={onEnd}>Back to explore</Button></div></section>;
  const target=quiz.questions[quiz.index].target;
  return <section aria-label="Identification question">
    <p className="study-note">{quiz.mode==='name'?'Name':'Find'} · Question {quiz.index+1} of {quiz.questions.length} · {quiz.correct} correct</p>
    <h2>{quiz.mode==='name'?'Name the highlighted structure':`Find: ${target.name}`}</h2>
    <p className="study-note">{quiz.mode==='name'?'The whole named concept is highlighted. Use its atlas name.':'Tap any modeled piece of the requested concept. Labels and inspection are hidden during practice.'}</p>
    {!quiz.feedback&&quiz.mode==='name'&&<form className="study-answer" onSubmit={e=>{e.preventDefault();if(answer.trim()&&ready)onAnswer(matchesName(target,answer));}}><label htmlFor="study-answer">Structure name</label><input ref={input} id="study-answer" type="text" autoComplete="off" spellCheck={false} value={answer} onChange={e=>setAnswer(e.target.value)} disabled={!ready}/><Button type="submit" disabled={!answer.trim()||!ready}>Check answer</Button></form>}
    {!quiz.feedback&&<div className="study-actions"><Button variant="outline" disabled={!ready} onClick={()=>onAnswer(false,true)}>Reveal answer</Button><Button variant="ghost" onClick={onEnd}>End practice</Button></div>}
    {quiz.feedback&&<div className={`study-feedback ${quiz.feedback.correct?'correct':'missed'}`} ref={feedback} tabIndex={-1} role="status"><strong>{quiz.feedback.correct?'Correct':quiz.feedback.revealed?'Answer revealed':'Not quite'}</strong><p className="study-answer-name">{target.name}</p><p className="study-note">{quiz.feedback.correct?'Continue when you are ready.':'Added to Revision for another attempt.'}</p><div className="study-actions"><Button onClick={onNext}>{quiz.index+1===quiz.questions.length?'Finish session':'Next question'}</Button><Button variant="ghost" onClick={onEnd}>End practice</Button></div></div>}
  </section>;
}
