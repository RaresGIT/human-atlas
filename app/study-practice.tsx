import {formatAnatomyName} from './format-anatomy-name';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {classifyName,type QuizMode,type QuizSession} from './study-quiz';

interface Props {
  quiz:QuizSession|null;count:number;ready:boolean;sourceName:string;
  onStart:(mode:QuizMode,limit?:number)=>void;onHideHint?:()=>void;onAnswer:(correct:boolean,revealed?:boolean)=>void;onNext:()=>void;onEnd:()=>void;
}
const PRACTICE_MODES:{mode:QuizMode;title:string;description:string;instructions:string}[]=[
  {mode:'name',title:'Name a structure',description:'Type the name of a highlighted structure.',instructions:'Type the atlas name of the highlighted structure. Case, spacing, and punctuation are ignored. Common curated synonyms are accepted; include left or right when shown.'},
  {mode:'find',title:'Find a structure',description:'Pick a structure from separated anatomy.',instructions:'Click or tap any piece belonging to the requested structure in a separated set. Pan and zoom to inspect small pieces.'},
  {mode:'context',title:'Find in regional anatomy',description:'Locate a structure in assembled anatomy.',instructions:'Find a structure in assembled anatomy. Use the hide hint if surrounding anatomy blocks your view.'},
];
export default function StudyPractice({quiz,count,ready,sourceName,onStart,onAnswer,onNext,onEnd,onHideHint}:Props){
  const [answer,setAnswer]=useState(''),[limit,setLimit]=useState(10),[hint,setHint]=useState(false),[spelling,setSpelling]=useState(false);
  const [mode,setMode]=useState<QuizMode>('name');
  const input=useRef<HTMLInputElement>(null),feedback=useRef<HTMLDivElement>(null),prompt=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{setAnswer('');setHint(false);setSpelling(false);if(quiz&&!quiz.feedback){if(quiz.mode==='name')input.current?.focus();else prompt.current?.focus();}},[quiz?.index,quiz?.mode]);
  useEffect(()=>{if(quiz?.feedback)feedback.current?.focus();},[quiz?.feedback]);
  if(!quiz)return <section className="study-activity study-practice-setup" aria-label="Practice setup">
    <header className="study-activity-header"><h2>Identification practice</h2><p className="study-note">{sourceName} · Practice {count} named structures. Each concept can contain several modeled pieces.</p></header>
    <fieldset className="study-practice-modes"><legend>Practice mode</legend>{PRACTICE_MODES.map(option=><label key={option.mode} className={`study-practice-mode${mode===option.mode?' is-selected':''}`}><input type="radio" name="practice-mode" value={option.mode} aria-label={option.title} checked={mode===option.mode} onChange={()=>setMode(option.mode)} aria-describedby={`practice-mode-${option.mode}-description`}/><span><strong>{option.title}</strong><span className="study-note" id={`practice-mode-${option.mode}-description`}>{option.description}</span></span></label>)}</fieldset>
    <div className="study-practice-length"><label htmlFor="practice-length">Session length</label><select id="practice-length" value={limit} onChange={e=>setLimit(Number(e.target.value))}><option value={5}>5 questions</option><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={0}>All eligible structures</option></select></div>
    <Button className="study-start-practice" disabled={!count||!ready} onClick={()=>onStart(mode,limit||undefined)}>Start practice</Button>
    {!ready&&<p role="status">Wait for the anatomy to finish loading.</p>}
    <details className="study-disclosure"><summary>How practice works</summary>{PRACTICE_MODES.map(option=><div key={option.mode}><h3>{option.title}</h3><p>{option.instructions}</p></div>)}</details>
  </section>;
  if(quiz.index>=quiz.questions.length)return <section className="study-activity" aria-label="Practice results"><h2>Session complete</h2><p className="study-score">{quiz.correct} / {quiz.questions.length}</p><p>Correct on the first attempt</p><p className="study-note">Revealed answers count as missed. All scored structures are scheduled in Review.</p><div className="study-actions"><Button onClick={()=>onStart(quiz.mode,limit||undefined)}>Practice again</Button><Button variant="outline" onClick={onEnd}>Back to explore</Button></div></section>;
  const target=quiz.questions[quiz.index].target;
  return <section className="study-activity study-practice-question" aria-label="Identification question">
    <header className="study-activity-header"><p className="study-question-progress">Question {quiz.index+1} of {quiz.questions.length} <span className="study-note">· {quiz.correct} correct</span></p><progress className="study-practice-progress" value={quiz.index} max={quiz.questions.length} aria-label="Questions completed"/><p className="study-note">{sourceName} · {quiz.mode==='name'?'Name':quiz.mode==='context'?'Find in regional anatomy':'Find'}</p>
    <h2 className="study-question-prompt" ref={prompt} tabIndex={-1}>{quiz.mode==='name'?'Name the highlighted structure':`Find: ${formatAnatomyName(target.name)}`}</h2></header>
    <p className="study-note">{quiz.mode==='name'?'The whole named concept is highlighted. Use its atlas name.':'Tap any modeled piece of the requested concept. Labels and inspection are hidden during practice.'}</p>
    {!quiz.feedback&&quiz.mode==='name'&&<form className="study-answer" onSubmit={e=>{e.preventDefault();if(answer.trim()&&ready){const result=classifyName(target,answer);setSpelling(result==='spelling');if(result!=='spelling')onAnswer(result==='correct');}}}><label htmlFor="study-answer">Structure name</label><input ref={input} id="study-answer" type="text" autoComplete="off" spellCheck={false} value={answer} onChange={e=>{setAnswer(e.target.value);setSpelling(false);}} disabled={!ready}/><Button type="submit" disabled={!answer.trim()||!ready}>Check answer</Button></form>}
    {!quiz.feedback&&spelling&&<p role="status">Your spelling is close. Check it and try again; this attempt has not been scored.</p>}{!quiz.feedback&&hint&&<p role="status">The atlas name begins with “{target.name.charAt(0).toUpperCase()}” and contains {target.name.split(/\s+/).length} words.</p>}{!quiz.feedback&&<div className="study-actions">{quiz.mode==='name'&&<Button variant="outline" onClick={()=>setHint(true)}>Name hint</Button>}{quiz.mode==='context'&&onHideHint&&<Button variant="outline" disabled={!ready} onClick={onHideHint}>Hide surrounding anatomy hint</Button>}<Button variant="outline" disabled={!ready} onClick={()=>onAnswer(false,true)}>Reveal answer</Button><Button variant="ghost" onClick={onEnd}>End practice</Button></div>}
    {quiz.feedback&&<div className={`study-feedback ${quiz.feedback.correct?'correct':'missed'}`} ref={feedback} tabIndex={-1} role="status"><strong>{quiz.feedback.correct?'Correct':quiz.feedback.revealed?'Answer revealed':'Not quite'}</strong><p className="study-answer-name">{formatAnatomyName(target.name)}</p><p className="study-note">{quiz.feedback.correct?'Continue when you are ready.':'Scheduled in Review for another attempt.'}</p><div className="study-actions"><Button onClick={onNext}>{quiz.index+1===quiz.questions.length?'Finish session':'Next question'}</Button><Button variant="ghost" onClick={onEnd}>End practice</Button></div></div>}
  </section>;
}
