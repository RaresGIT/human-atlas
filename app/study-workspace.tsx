import {useMemo,useState} from 'react';
import {ArrowLeft,BookOpen,RotateCcw} from 'lucide-react';
import AnatomyScene from './scene';
import {Button} from '@/components/ui/button';
import {SYSTEMS,explanation,type Atlas,type Concept,type SceneState,type View} from './anatomy';
import {REGIONS,conceptPieces,isPartVisible,regionConcepts,type RegionId} from './study-model';
import './study.css';

function regionState(atlas:Atlas,id:RegionId):SceneState{
  return {study:true,scope:conceptPieces(regionConcepts(atlas,id)),explode:0,visible:SYSTEMS.map(s=>s.id),selected:[],isolate:false,view:'front',rotate:false,reset:0};
}

export default function StudyWorkspace({atlas,onExit}:{atlas:Atlas;onExit:()=>void}){
  const [region,setRegion]=useState<RegionId>('upper-limb');
  const [state,setState]=useState(()=>regionState(atlas,'upper-limb'));
  const [selected,setSelected]=useState<Concept|null>(null);
  const [progress,setProgress]=useState(0),[error,setError]=useState('');
  const concepts=useMemo(()=>regionConcepts(atlas,region),[atlas,region]);
  const regionParts=useMemo(()=>atlas.parts.filter(p=>state.scope?.includes(p.id)),[atlas,state.scope]);
  const systems=SYSTEMS.filter(s=>regionParts.some(p=>p.system===s.id));
  const select=(concept:Concept)=>{setSelected(concept);setState(s=>({...s,selected:concept.elements,isolate:false}));};
  const pick=(id:string)=>{
    const concept=concepts.find(c=>c.elements.includes(id));
    if(concept)select(concept);
  };
  const changeRegion=(id:RegionId)=>{setRegion(id);setSelected(null);setState(s=>({...regionState(atlas,id),reset:s.reset+1}));};
  const selectedPart=atlas.parts.find(p=>selected?.elements.includes(p.id));

  return <main className="study-workspace">
    <AnatomyScene atlas={atlas} state={state} onSelect={pick} onProgress={setProgress} onError={setError}/>
    <header className="study-header glass">
      <Button variant="ghost" onClick={onExit}><ArrowLeft size={16}/>Explorer</Button>
      <div><BookOpen size={17}/><strong>Regional study</strong></div>
      <label>Region<select value={region} onChange={e=>changeRegion(e.target.value as RegionId)}>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    </header>
    <aside className="study-panel glass" aria-label="Study controls">
      <h2>{REGIONS.find(r=>r.id===region)?.name}</h2>
      <p className="study-note">Starter collection · {concepts.length} named structures across {systems.length} systems. Includes modeled components; regional coverage is not exhaustive.</p>
      <fieldset className="study-systems"><legend>Visible systems</legend>{systems.map(sys=><label key={sys.id}><input type="checkbox" checked={state.visible.includes(sys.id)} onChange={()=>{setSelected(null);setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(sys.id)?s.visible.filter(id=>id!==sys.id):[...s.visible,sys.id]}));}}/><span style={{color:sys.color}}>●</span>{sys.name}</label>)}</fieldset>
      <div className="study-structures" aria-label="Region structures">{concepts.map(c=><Button variant="ghost" key={c.id} aria-pressed={selected?.id===c.id} onClick={()=>select(c)}>{c.name}<span>{c.elements.length} {c.elements.length===1?'piece':'pieces'}</span></Button>)}</div>
      {selected&&selectedPart&&<section className="study-selection" aria-label="Selected structure"><h3>{selected.name}</h3><p>{explanation(selected.name,selectedPart.system)}</p><p className="study-note">{selected.id} · Descriptions may be general system context.</p><div className="study-actions"><Button onClick={()=>setState(s=>({...s,isolate:!s.isolate,focus:s.isolate?undefined:selected.elements,reset:s.reset+1}))}>{state.isolate?'Show region':'Isolate'}</Button><Button variant="outline" onClick={()=>{setSelected(null);setState(s=>({...s,selected:[],isolate:false,focus:undefined,reset:s.reset+1}));}}>Clear</Button></div></section>}
    </aside>
    <nav className="study-camera glass" aria-label="Study camera">{(['front','three-quarter','side','back'] as View[]).map(v=><Button variant="ghost" key={v} aria-pressed={state.view===v} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1}))}>{v==='three-quarter'?'¾':v[0].toUpperCase()+v.slice(1)}</Button>)}<Button variant="ghost" aria-label="Reset region view" onClick={()=>setState(s=>({...s,view:'front',focus:undefined,isolate:false,reset:s.reset+1}))}><RotateCcw size={16}/></Button></nav>
    <div className="study-status">{regionParts.filter(p=>isPartVisible(p,state)).length} pieces visible · Drag to orbit · Scroll or pinch to zoom</div>
    {progress<100&&!error&&<div className="loading glass" role="status">Preparing anatomy · {progress}%</div>}
    {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button onClick={onExit}>Return to explorer</Button></div>}
  </main>;
}
