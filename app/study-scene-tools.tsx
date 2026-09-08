import {formatAnatomyName} from './format-anatomy-name';
import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {SYSTEMS,type SceneState} from './anatomy';
import {ViewTools} from './view-tools';
import {encodeScene,type Workspace} from './workspace-model';
export type StudyTool='layers'|'appearance'|'save'|'help';
export const toolTitles:Record<StudyTool,string>={layers:'Layers',appearance:'Appearance',save:'Save & export',help:'Help'};
interface Props {tool:StudyTool;workspace:Workspace;systems:typeof SYSTEMS;onChange:(fn:(s:SceneState)=>SceneState)=>void;onVisibility:(id:typeof SYSTEMS[number]['id'])=>void;onClose:()=>void;onLibrary:()=>void;onCapture:()=>void;coverage:string;conceptCount:number}
export default function StudySceneTools({tool,workspace,systems,onChange,onVisibility,onClose,onLibrary,onCapture,coverage,conceptCount}:Props){
 const state=workspace.scene;
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[tool]);
 const [share,setShare]=useState(''),[notice,setNotice]=useState('');
 return <aside className="study-tool-panel study-surface" aria-label={`${toolTitles[tool]} tools`}>
  <div className="study-panel-heading"><h2 ref={heading} tabIndex={-1}>{toolTitles[tool]}</h2><Button variant="ghost" aria-label="Close tools" onClick={onClose}><X size={18}/></Button></div>
  {tool==='layers'&&<>
   <fieldset className="study-systems"><legend>Visible systems</legend>{systems.map(sys=><label key={sys.id}><input type="checkbox" checked={state.visible.includes(sys.id)} onChange={()=>onVisibility(sys.id)}/><span className="layer-color" style={{background:sys.color}}/>{sys.name}</label>)}</fieldset>
   <section className="study-tool-section"><h3>Hidden structures</h3><p className="study-note">{state.hidden?.length??0} pieces hidden</p><Button variant="outline" disabled={!state.hidden?.length} onClick={()=>onChange(s=>({...s,hidden:[]}))}>Restore hidden structures</Button></section>
   <section className="study-tool-section"><h3>Pinned labels <span className="study-count">{state.labels?.length??0}/6</span></h3><Button variant="outline" disabled={!state.labels?.length} onClick={()=>onChange(s=>({...s,labelsVisible:!s.labelsVisible}))}>{state.labelsVisible?'Hide':'Show'} labels</Button><div className="study-action-list">{state.labels?.map(c=><Button key={c.id} variant="ghost" onClick={()=>onChange(s=>({...s,labels:s.labels?.filter(x=>x.id!==c.id)}))}>Unpin {formatAnatomyName(c.name)}<X size={14}/></Button>)}</div><p className="study-note">Select a structure to pin its label on the anatomy.</p></section>
  </>}
  {tool==='appearance'&&<ViewTools state={state} onChange={onChange} embedded/>}
  {tool==='save'&&<>
   <p className="study-note">Keep this view or share it with someone else.</p><div className="study-action-list"><Button onClick={onLibrary}>Save a scene or study set</Button><Button variant="outline" onClick={async()=>{const url=location.origin+location.pathname+encodeScene(workspace);setShare(url);try{await navigator.clipboard.writeText(url);setNotice('Scene link copied.');}catch{setNotice('Copy the scene link below.');}}}>Copy scene link</Button><Button variant="outline" onClick={onCapture}>Export annotated PNG</Button></div>
   {share&&<label>Scene link<textarea readOnly value={share} onFocus={e=>e.target.select()} rows={3}/></label>}{notice&&<p role="status" className="study-note">{notice}</p>}
   <details><summary>What is saved and shared?</summary><p className="study-note">Scenes include camera, selection, layers, pins and cutaway settings. Scene links contain the view, not revision history. Your library and review progress stay in this browser. Open Library or Review to import or export that data.</p></details>
  </>}
  {tool==='help'&&<>
   <h3>Explore the anatomy</h3><p className="study-note">Drag to orbit. Scroll or pinch to zoom. Select a structure to inspect it; double-click or double-tap to focus. Right-click the model to choose among overlapping structures, or use Appearance → Choose overlapping structure.</p>
   <h3>Keyboard shortcuts</h3><dl className="study-shortcuts">{[['/','Search'],['F','Focus selection'],['H','Hide selection'],['Escape','Close tools or clear selection'],['Alt + ← / →','Back / Forward'],['Ctrl / ⌘ + Z','Undo'],['Ctrl / ⌘ + Shift + Z','Redo']].map(([key,label])=><div key={key}><dt><kbd>{key}</kbd></dt><dd>{label}</dd></div>)}</dl>
   <details><summary>About this region</summary><p className="study-note">{conceptCount} named structures · {systems.length} systems. {coverage}</p></details>
  </>}
 </aside>;
}
