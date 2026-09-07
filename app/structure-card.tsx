import {explanation,type Atlas,type Concept} from './anatomy';
import {contentForConcept} from './anatomy-content';

export default function StructureCard({concept,atlas}:{concept:Concept;atlas:Atlas}){
 const content=contentForConcept(concept,atlas);
 const system=atlas.parts.find(p=>concept.elements.includes(p.id))?.system;
 return <section className="structure-card" aria-label="Anatomy facts">
  {content?<>
   <p className="study-note">{content.broader?`Broader structure context: ${content.entry.name}. These facts describe the parent structure, not this individual piece.`:'Sourced structure card'}</p>
   <dl>{content.entry.facts.map(f=><div key={f.label}><dt><strong>{f.label}</strong></dt><dd style={{margin:'0 0 10px'}}>{f.text}</dd></div>)}</dl>
   <details><summary>Sources and coverage</summary><ul>{content.entry.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul><p className="study-note">Selected foundational facts; not an exhaustive description. Text describes standard anatomy; this model may omit small structures and anatomical variants.</p></details>
  </>:<><p className="study-note">A detailed sourced card is not yet available for this structure.</p>{system&&<p>{explanation(concept.name,system)}</p>}<p className="study-note">General system context only. Attachments, branches and relationships have not been curated for this selection.</p></>}
 </section>;
}
