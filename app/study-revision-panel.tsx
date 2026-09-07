import {useEffect,useMemo,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Concept} from './anatomy';
import {dueRevision,type RevisionItem} from './study-revision';
import type {QuizMode} from './study-quiz';

interface Props {
  items:RevisionItem[];concepts:Concept[];notice:string;ready:boolean;
  onInspect:(c:Concept)=>void;onRemove:(id:string)=>void;onPractice:(mode:QuizMode,dueOnly?:boolean)=>void;
  onImport?:(text:string)=>void;onExport?:()=>void;
}
export default function StudyRevisionPanel({items,concepts,notice,ready,onInspect,onRemove,onPractice,onImport,onExport}:Props){
  const [dueOnly,setDueOnly]=useState(true),[fileError,setFileError]=useState(''),[limit,setLimit]=useState(40),[now,setNow]=useState(Date.now);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),60_000);return ()=>window.clearInterval(timer);},[]);
  useEffect(()=>setLimit(40),[dueOnly]);
  const input=useRef<HTMLInputElement>(null),due=useMemo(()=>dueRevision(items,now),[items,now]),shown=dueOnly?due:items;
  const byId=useMemo(()=>new Map(concepts.map(c=>[c.id,c])),[concepts]);
  return <section aria-label="Revision collection"><h2>Revision</h2><p className="study-note">Every scored answer is saved in this browser. Correct answers return after 1, 3, 7, 14, then 30 days; missed answers return after 10 minutes. Imported older misses are due immediately.</p>{notice&&<p className="study-storage-notice" role="status">{notice}</p>}
    <div className="study-actions">{onExport&&<Button variant="outline" disabled={!items.length} onClick={onExport}>Export revision</Button>}{onImport&&<><Button variant="outline" onClick={()=>input.current?.click()}>Import revision</Button><input ref={input} type="file" accept="application/json,.json" hidden onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>2_000_000){setFileError('Choose a revision file smaller than 2 MB.');return;}try{setFileError('');onImport(await file.text());}catch{setFileError('This file could not be read.');}}}/></>}</div>{fileError&&<p role="alert">{fileError}</p>}
    {!items.length?<p className="study-empty">Your revision set is empty. Complete a practice question to schedule a review.</p>:<><p>{due.length} due now · {items.length} tracked</p><label><input type="checkbox" checked={dueOnly} onChange={e=>setDueOnly(e.target.checked)}/> Show only due reviews</label><div className="study-actions"><Button disabled={!ready||!shown.length} onClick={()=>onPractice('name',dueOnly)}>Review naming</Button><Button variant="outline" disabled={!ready||!shown.length} onClick={()=>onPractice('find',dueOnly)}>Review finding</Button></div>{!shown.length&&<p>No reviews are due yet. Uncheck the filter to practice early.</p>}<ul className="study-revision-list">{shown.slice(0,limit).map(item=>{const concept=byId.get(item.id);if(!concept)return null;return <li key={item.id}><h3>{concept.name}</h3><p className="study-note">{item.correct??0} correct · {item.mistakes} missed · {item.dueAt&&item.dueAt>now?`Due ${new Date(item.dueAt).toLocaleString()}`:'Due now'}</p><div className="study-actions"><Button variant="outline" onClick={()=>onInspect(concept)}>Inspect</Button><Button variant="ghost" aria-label={`Remove ${concept.name} from revision`} onClick={()=>onRemove(item.id)}>Remove</Button></div></li>;})}</ul>{shown.length>limit&&<Button variant="outline" onClick={()=>setLimit(n=>n+40)}>Show more reviews ({shown.length-limit} remaining)</Button>}</>}
  </section>;
}
