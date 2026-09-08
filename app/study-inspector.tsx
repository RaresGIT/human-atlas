import {formatAnatomyName} from './format-anatomy-name';
import {useEffect,useRef} from 'react';
import {ArrowLeft,Focus,Pin,Scan,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Atlas,Concept,SceneState} from './anatomy';
import StructureCard from './structure-card';
interface Props {
 atlas:Atlas; selected:Concept; state:SceneState; onFocus:()=>void; onHide:()=>void;
 onChange:(fn:(s:SceneState)=>SceneState)=>void; onLibrary:()=>void; onClear:()=>void; onClose:()=>void;
}
export default function StudyInspector({atlas,selected,state,onFocus,onHide,onChange,onLibrary,onClear,onClose}:Props){
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[selected]);
 const pinned=state.labels?.some(c=>c.id===selected.id);
 return <aside className="study-inspector study-surface" aria-label="Selected structure">
  <div className="inspector-navigation"><Button variant="ghost" onClick={onClose}><ArrowLeft size={16}/>Back to structures</Button><Button variant="ghost" aria-label="Clear selection" onClick={onClear}><X size={16}/></Button></div>
  <div className="inspector-heading"><span className="study-kicker">Selected structure</span><h2 ref={heading} tabIndex={-1}>{formatAnatomyName(selected.name)}</h2><p className="study-note">{selected.elements.length} modeled {selected.elements.length===1?'piece':'pieces'}</p></div>
  <div className="inspector-primary-actions">
   <Button onClick={onFocus}><Focus size={16}/>Focus</Button>
   <Button variant="outline" aria-pressed={state.isolate} onClick={()=>onChange(s=>({...s,isolate:!s.isolate,focus:s.isolate?undefined:s.selected,reset:s.reset+1}))}><Scan size={16}/>{state.isolate?'Show region':'Isolate'}</Button>
   <Button variant="outline" aria-pressed={!!pinned} disabled={(state.labels?.length??0)>=6&&!pinned} onClick={()=>onChange(s=>({...s,labels:pinned?s.labels?.filter(c=>c.id!==selected.id):[...(s.labels??[]),selected],labelsVisible:true}))}><Pin size={16}/>{pinned?'Unpin label':'Pin label'}</Button>
  </div>
  {!pinned&&(state.labels?.length??0)>=6&&<p className="study-note">Six labels are pinned. Unpin one in Layers to add another.</p>}
  <details className="inspector-more"><summary>More actions</summary><div className="study-action-list"><Button variant="ghost" onClick={onHide}>Hide structure <kbd>H</kbd></Button><Button variant="ghost" onClick={onLibrary}>Add to study set</Button><Button variant="ghost" onClick={onClear}>Clear selection <kbd>Esc</kbd></Button></div></details>
  <details className="inspector-information" open><summary>Structure information</summary><StructureCard concept={selected} atlas={atlas}/></details>
 </aside>;
}
