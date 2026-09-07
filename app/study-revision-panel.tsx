import {Button} from '@/components/ui/button';
import type {Concept} from './anatomy';
import type {RevisionItem} from './study-revision';
import type {QuizMode} from './study-quiz';

interface Props {
  items:RevisionItem[];concepts:Concept[];notice:string;ready:boolean;
  onInspect:(c:Concept)=>void;onRemove:(id:string)=>void;onPractice:(mode:QuizMode)=>void;
}
export default function StudyRevisionPanel({items,concepts,notice,ready,onInspect,onRemove,onPractice}:Props){
  return <section aria-label="Revision collection"><h2>Revision</h2><p className="study-note">Missed and revealed structures from all regions. Stored in this browser; removing an item marks it reviewed.</p>{notice&&<p className="study-storage-notice" role="status">{notice}</p>}
    {!items.length?<p className="study-empty">Your revision set is empty. Start a practice session; missed structures will appear here.</p>:<><p>{items.length} {items.length===1?'structure':'structures'} to revisit</p><div className="study-actions"><Button disabled={!ready} onClick={()=>onPractice('name')}>Retry naming</Button><Button variant="outline" disabled={!ready} onClick={()=>onPractice('find')}>Retry finding</Button></div><ul className="study-revision-list">{items.map(item=>{const concept=concepts.find(c=>c.id===item.id);if(!concept)return null;return <li key={item.id}><h3>{concept.name}</h3><p className="study-note">{item.mistakes} {item.mistakes===1?'miss':'misses'}</p><div className="study-actions"><Button variant="outline" onClick={()=>onInspect(concept)}>Inspect</Button><Button variant="ghost" aria-label={`Remove ${concept.name} from revision`} onClick={()=>onRemove(item.id)}>Mark reviewed</Button></div></li>;})}</ul></>}
  </section>;
}
