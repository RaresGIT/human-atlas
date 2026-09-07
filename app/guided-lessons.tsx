import {useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Atlas} from './anatomy';
import {LESSONS,lessonScene,type LessonScene} from './anatomy-content';

export default function GuidedLessons({atlas,onScene,onPractice}:{atlas:Atlas;onScene:(config:LessonScene)=>void;onPractice:(conceptIds:string[])=>void}){
 const [active,setActive]=useState<string|null>(null),[index,setIndex]=useState(0);
 const title=useRef<HTMLHeadingElement>(null);
 const lesson=LESSONS.find(l=>l.id===active),step=lesson?.steps[index];
 const navigate=(id:string,next:number)=>{const nextLesson=LESSONS.find(l=>l.id===id);if(!nextLesson)return;setActive(id);setIndex(next);onScene(lessonScene(atlas,nextLesson,nextLesson.steps[next]));requestAnimationFrame(()=>title.current?.focus({preventScroll:true}));};
 return <section aria-label="Guided lessons">
  <h2>Guided lessons</h2>
  {lesson&&step?<>
   <Button variant="ghost" onClick={()=>setActive(null)}>All lessons</Button>
   <p className="study-note">{lesson.title} · Step {index+1} of {lesson.steps.length}</p>
   <h3 ref={title} tabIndex={-1}>{step.title}</h3><p>{step.text}</p>
   <p className="study-note">Each step restores its own visibility and a fixed regional frame. Orbit to inspect; hidden structures remain available in Explore.</p>
   <details><summary>Step sources</summary><ul>{step.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>
   <div className="study-actions"><Button variant="outline" disabled={index===0} onClick={()=>navigate(lesson.id,index-1)}>Back</Button><Button variant="outline" onClick={()=>navigate(lesson.id,index)}>Reset step</Button>{index<lesson.steps.length-1?<Button onClick={()=>navigate(lesson.id,index+1)}>Next step</Button>:<Button onClick={()=>onPractice(lesson.practice.filter(id=>atlas.concepts.some(c=>c.id===id)))}>Practice these structures</Button>}</div>
  </>:<><p className="study-note">Short virtual dissections with sourced explanations and a final identification practice. Scene changes hide modeled structures; they do not simulate a clinical procedure.</p>{LESSONS.map(l=><div key={l.id} style={{marginBottom:12}}><h3>{l.title}</h3><p className="study-note">{l.steps.length} steps · {l.practice.length} practice structures</p><Button variant="outline" onClick={()=>navigate(l.id,0)}>Start {l.title}</Button></div>)}</>}
 </section>;
}
