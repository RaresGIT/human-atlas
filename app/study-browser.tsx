import {formatAnatomyName} from './format-anatomy-name';
import {memo,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {Atlas,Concept} from './anatomy';
import {atlasIndex,type Side,sidePieces} from './workspace-model';
interface Props {atlas:Atlas;concepts:Concept[];side:Side;selected:Concept|null;hidden:string[];onSelect:(c:Concept)=>void;onFocus:(c:Concept)=>void}
const Row=memo(function Row({atlas,concept,side,selected,hidden,onSelect,onFocus}:Omit<Props,'concepts'>&{concept:Concept}){
 const [expanded,setExpanded]=useState(false),[limit,setLimit]=useState(30);const index=atlasIndex(atlas);
 const elements=useMemo(()=>sidePieces(atlas,concept.elements,side),[atlas,concept,side]);
 const chosen={...concept,elements};
 return <div className="structure-row"><div className="structure-row-main"><Button variant="ghost" aria-pressed={selected?.id===concept.id&&selected.elements.length===elements.length} onClick={()=>onSelect(chosen)} onDoubleClick={()=>onFocus(chosen)}>{formatAnatomyName(concept.name)}<span>{elements.every(id=>hidden.includes(id))?'Hidden':`${elements.length} pieces`}</span></Button>{elements.length>1&&<Button variant="ghost" aria-label={`${expanded?'Collapse':'Expand'} ${formatAnatomyName(concept.name)}`} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'−':'+'}</Button>}</div>
 {expanded&&<div className="structure-members">{elements.slice(0,limit).map(id=>{const p=index.parts.get(id);if(!p)return null;const c={id:p.conceptId,name:p.name,elements:[id]};return <Button key={id} variant="ghost" aria-pressed={selected?.elements.length===1&&selected.elements[0]===id} onClick={()=>onSelect(c)} onDoubleClick={()=>onFocus(c)}>{formatAnatomyName(p.name)}{hidden.includes(id)&&<span>Hidden</span>}</Button>;})}{limit<elements.length&&<Button variant="outline" onClick={()=>setLimit(n=>n+30)}>Show next 30 pieces</Button>}</div>}
 </div>;
});
export default function StudyBrowser(props:Props){
 const [limit,setLimit]=useState(60);const key=props.concepts.map(c=>c.id).join(',');
 // Bound initial DOM even for all-atlas search; expand on demand.
 return <div className="study-structures" aria-label="Region structures" key={key}>{props.concepts.slice(0,limit).map(concept=><Row key={concept.id} {...props} concept={concept}/>)}{props.concepts.length===0&&<p className="study-note">No structures match these filters.</p>}{props.concepts.length>limit&&<Button variant="outline" onClick={()=>setLimit(n=>n+60)}>Show more ({props.concepts.length-limit} remaining)</Button>}</div>;
}
