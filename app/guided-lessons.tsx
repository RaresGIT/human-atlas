import {useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Atlas} from './anatomy';
import {LESSONS,lessonScene,type LessonScene} from './anatomy-content';

export default function GuidedLessons({atlas,onScene,onPractice}:{atlas:Atlas;onScene:(config:LessonScene)=>void;onPractice:(conceptIds:string[])=>void}){
 const [active,setActive]=useState<string|null>(null),[index,setIndex]=useState(0);
 const title=useRef<HTMLHeadingElement>(null);
 const lesson=LESSONS.find(l=>l.id===active),step=lesson?.steps[index];
 const navigate=(id:string,next:number)=>{const nextLesson=LESSONS.find(l=>l.id===id);if(!nextLesson)return;setActive(id);setIndex(next);onScene(lessonScene(atlas,nextLesson,nextLesson.steps[next]));requestAnimationFrame(()=>title.current?.focus({preventScroll:true}));};
 return <section className="study-activity study-lessons" aria-label="Guided lessons">
  <header className="study-activity-header"><h2>Guided lessons</h2></header>
  {lesson&&step?<>
   <Button variant="ghost" onClick={()=>setActive(null)}>All lessons</Button>
   <div className="study-lesson-step"><p className="study-note">{lesson.title}</p><p className="study-question-progress">Step {index+1} of {lesson.steps.length}</p>
   <h3 className="study-lesson-step-title" ref={title} tabIndex={-1}>{step.title}</h3><p className="study-lesson-explanation">{step.text}</p></div>
   <div className="study-actions study-lesson-navigation">{index<lesson.steps.length-1?<Button onClick={()=>navigate(lesson.id,index+1)}>Next step</Button>:<Button onClick={()=>onPractice(lesson.practice.filter(id=>atlas.concepts.some(c=>c.id===id)))}>Practice these structures</Button>}<Button variant="outline" disabled={index===0} onClick={()=>navigate(lesson.id,index-1)}>Back</Button><Button variant="ghost" onClick={()=>navigate(lesson.id,index)}>Reset step</Button></div>
   <details className="study-disclosure"><summary>About the step view</summary><p className="study-note">Each step restores its own visibility and a fixed regional frame. Orbit to inspect; hidden structures remain available in Explore.</p></details>
   <details className="study-disclosure"><summary>Step sources</summary><ul>{step.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>
  </>:<><p className="study-note">Short virtual dissections with sourced explanations and a final identification practice. Scene changes hide modeled structures; they do not simulate a clinical procedure.</p><ul className="study-lesson-list">{LESSONS.map(l=><li key={l.id}><h3>{l.title}</h3><p className="study-note">{l.steps.length} steps · {l.practice.length} practice structures</p><Button variant="outline" onClick={()=>navigate(l.id,0)}>Start {l.title}</Button></li>)}</ul></>}
 </section>;
}
