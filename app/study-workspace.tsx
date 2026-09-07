import {useMemo,useState,useEffect,useRef} from 'react';
import {ArrowLeft,BookOpen,RotateCcw} from 'lucide-react';
import AnatomyScene from './scene';
import {Button} from '@/components/ui/button';
import {SYSTEMS,explanation,type Atlas,type Concept,type SceneState,type View} from './anatomy';
import {REGION_GROUPS,REGIONS,regionForConcept,conceptPieces,isPartVisible,regionConcepts,hidePieces,hiddenPieces,undoHide,leaveIsolation,revealPieces,type RegionId} from './study-model';
import './study.css';
import StudyPractice from './study-practice';
import StudyRevisionPanel from './study-revision-panel';
import {readRevision,saveRevision,recordMistake} from './study-revision';
import {createQuiz,answerQuiz,nextQuestion,quizScene,matchesPiece,type QuizSession,type QuizMode} from './study-quiz';

function regionState(atlas:Atlas,id:RegionId):SceneState{
  return {study:true,scope:conceptPieces(regionConcepts(atlas,id)),explode:0,visible:SYSTEMS.map(s=>s.id),selected:[],isolate:false,view:REGIONS.find(r=>r.id===id)!.view,rotate:false,reset:0};
}

export default function StudyWorkspace({atlas,onExit}:{atlas:Atlas;onExit:()=>void}){
  const [region,setRegion]=useState<RegionId>('upper-limb');
  const [state,setState]=useState(()=>regionState(atlas,'upper-limb'));
  const selectionHeader=useRef<HTMLHeadingElement>(null);
  const [selected,setSelected]=useState<Concept|null>(null);
  const [tab,setTab]=useState<'explore'|'practice'|'revision'>('explore');
  const [saved,setSaved]=useState(()=>{try{return readRevision(window.localStorage,new Set(atlas.concepts.map(c=>c.id)));}catch{return {items:[],warning:'Browser storage is unavailable. Revision is kept for this session only.'};}});
  const [storageNotice,setStorageNotice]=useState(saved.warning);
  const [practiceSource,setPracticeSource]=useState<'region'|'revision'>('region');
  useEffect(()=>{try{const notice=saveRevision(window.localStorage,saved.items);setStorageNotice(notice||saved.warning);}catch{setStorageNotice('Browser storage is unavailable. Revision is kept for this session only.');}},[saved]);
  const [quiz,setQuiz]=useState<QuizSession|null>(null);
  const [hideHistory,setHideHistory]=useState<string[][]>([]);
  useEffect(()=>{if(selected){selectionHeader.current?.focus({preventScroll:true});selectionHeader.current?.scrollIntoView({block:'nearest'});}},[selected]);
  const [progress,setProgress]=useState(0),[error,setError]=useState('');
  const concepts=useMemo(()=>regionConcepts(atlas,region),[atlas,region]);
  const regionParts=useMemo(()=>atlas.parts.filter(p=>state.scope?.includes(p.id)),[atlas,state.scope]);
  const systems=SYSTEMS.filter(s=>regionParts.some(p=>p.system===s.id));
  const select=(concept:Concept)=>{const next=revealPieces(hideHistory,concept.elements);setHideHistory(next);setSelected(concept);setState(s=>({...s,...(s.isolate?leaveIsolation(s):{}),hidden:hiddenPieces(next),selected:concept.elements}));};
  const pick=(id:string)=>{
    if(quiz){if(quiz.mode==='find'&&!quiz.feedback&&quiz.index<quiz.questions.length)submitAnswer(matchesPiece(quiz.questions[quiz.index].target,id));return;}
    const part=atlas.parts.find(p=>p.id===id);
    if(part)select({id:part.conceptId,name:part.name,elements:[id]});
  };
  const focusConcept=(concept:Concept)=>{select(concept);setState(s=>({...s,focus:concept.elements,isolate:false,reset:s.reset+1}));};
  const focusPiece=(id:string)=>{if(quiz)return;const part=atlas.parts.find(p=>p.id===id);if(part)focusConcept({id:part.conceptId,name:part.name,elements:[id]});};
  const changeRegion=(id:RegionId)=>{setRegion(id);setSelected(null);setHideHistory([]);setQuiz(null);setTab('explore');setState(s=>({...regionState(atlas,id),reset:s.reset+1}));};
  const hideSelected=()=>{if(!selected)return;const next=hidePieces(hideHistory,selected.elements);setHideHistory(next);setSelected(null);setState(s=>({...s,hidden:hiddenPieces(next),selected:[],isolate:false,focus:undefined,reset:s.reset+1}));};
  const undo=()=>{const next=undoHide(hideHistory);setHideHistory(next);setState(s=>({...s,hidden:hiddenPieces(next)}));};
  const restore=()=>{setHideHistory([]);setState(s=>({...s,hidden:[]}));};
  const pin=()=>{if(!selected)return;setState(s=>({...s,labels:s.labels?.some(c=>c.id===selected.id)?s.labels.filter(c=>c.id!==selected.id):[...(s.labels??[]),selected],labelsVisible:true}));};
  const revisionConcepts=atlas.concepts.filter(c=>saved.items.some(item=>item.id===c.id));
  const startQuiz=(mode:QuizMode,source=practiceSource)=>{const pool=source==='revision'?revisionConcepts:concepts;if(!pool.length)return;setPracticeSource(source);setQuiz(createQuiz(pool,mode));setTab('practice');};
  const submitAnswer=(correct:boolean,revealed=false)=>{
    if(!quiz||quiz.feedback||quiz.index>=quiz.questions.length)return;
    if(!correct||revealed)setSaved(s=>({...s,items:recordMistake(s.items,quiz.questions[quiz.index].target.id)}));
    setQuiz(answerQuiz(quiz,correct,revealed));
  };
  const inspectRevision=(c:Concept)=>{const r=regionForConcept(atlas,c);if(r){changeRegion(r.id);setSelected(c);setState(s=>({...s,selected:c.elements,focus:c.elements}));}else{setQuiz(null);setTab('explore');setSelected(c);setHideHistory([]);setState(s=>({...s,scope:conceptPieces([...concepts,c]),selected:c.elements,hidden:[],focus:c.elements,isolate:true,reset:s.reset+1}));}};
  const endQuiz=()=>{setQuiz(null);setTab('explore');setState(s=>({...s,reset:s.reset+1}));};
  const sceneState=useMemo(()=>quiz?quizScene(state,quiz,atlas):state,[state,quiz,atlas]);
  const selectedPart=atlas.parts.find(p=>selected?.elements.includes(p.id));

  return <main className="study-workspace">
    <AnatomyScene atlas={atlas} state={sceneState} onSelect={pick} onFocus={focusPiece} onProgress={setProgress} onError={setError}/>
    <header className="study-header glass">
      <Button variant="ghost" onClick={onExit}><ArrowLeft size={16}/>Explorer</Button>
      <div><BookOpen size={17}/><strong>Regional study</strong></div>
      <label>Region<select disabled={!!quiz} value={region} onChange={e=>changeRegion(e.target.value as RegionId)}>{REGION_GROUPS.map(group=><optgroup key={group.id} label={group.name}>{REGIONS.filter(r=>r.group===group.id).map(r=><option key={r.id} value={r.id}>{r.overview?`${r.name} — overview`:r.name}</option>)}</optgroup>)}</select></label>
    </header>
    <aside className="study-panel glass" aria-label="Study controls">
      <nav className="study-tabs" aria-label="Study activities"><Button variant="ghost" aria-pressed={tab==='explore'} onClick={endQuiz}>Explore</Button><Button variant="ghost" aria-pressed={tab==='practice'} onClick={()=>{if(!quiz)setPracticeSource('region');setTab('practice');}}>Practice</Button><Button variant="ghost" aria-pressed={tab==='revision'} onClick={()=>{setQuiz(null);setTab('revision');setState(s=>({...s,reset:s.reset+1}));}}>Revision ({saved.items.length})</Button></nav>
      {tab==='revision'?<StudyRevisionPanel items={saved.items} concepts={revisionConcepts} notice={storageNotice} ready={progress===100&&!error} onInspect={inspectRevision} onRemove={id=>setSaved(s=>({...s,items:s.items.filter(item=>item.id!==id)}))} onPractice={mode=>startQuiz(mode,'revision')}/>:tab==='practice'?<StudyPractice quiz={quiz} count={practiceSource==='revision'?revisionConcepts.length:concepts.length} sourceName={practiceSource==='revision'?'Revision set':REGIONS.find(r=>r.id===region)!.name} ready={progress===100&&!error} onStart={mode=>startQuiz(mode)} onAnswer={submitAnswer} onNext={()=>setQuiz(q=>q?nextQuestion(q):null)} onEnd={endQuiz}/>:<>
      <h2>{REGIONS.find(r=>r.id===region)?.name}</h2>
      <p className="study-note">{concepts.length} named structures across {systems.length} systems. Includes available modeled components; some structures extend beyond regional boundaries.</p>
      <section className="study-explore-tools" aria-label="Explore relationships"><div className="study-actions"><Button variant="outline" disabled={!hideHistory.length} onClick={undo}>Undo hide</Button><Button variant="outline" disabled={!hideHistory.length} onClick={restore}>Restore all</Button></div><p className="study-note">{hiddenPieces(hideHistory).length} pieces hidden · {state.labels?.length??0}/6 labels pinned</p><label className="study-label-toggle"><input type="checkbox" checked={!!state.labelsVisible} onChange={e=>setState(s=>({...s,labelsVisible:e.target.checked}))}/>Show pinned labels</label>{!!state.labels?.length&&<div className="study-pinned-list">{state.labels.map(c=><Button variant="ghost" key={c.id} aria-label={`Unpin ${c.name}`} onClick={()=>setState(s=>({...s,labels:s.labels?.filter(p=>p.id!==c.id)}))}>{c.name} ×</Button>)}</div>}</section>
      {REGIONS.find(r=>r.id===region)?.coverageNote&&<p className="study-note">{REGIONS.find(r=>r.id===region)?.coverageNote}</p>}
      <fieldset className="study-systems"><legend>Visible systems</legend>{systems.map(sys=><label key={sys.id}><input type="checkbox" checked={state.visible.includes(sys.id)} onChange={()=>{setSelected(null);setState(s=>({...leaveIsolation(s),selected:[],visible:s.visible.includes(sys.id)?s.visible.filter(id=>id!==sys.id):[...s.visible,sys.id]}));}}/><span style={{color:sys.color}}>●</span>{sys.name}</label>)}</fieldset>
      <div className="study-structures" aria-label="Region structures">{concepts.map(c=><Button variant="ghost" key={c.id} aria-pressed={selected?.id===c.id} onClick={()=>select(c)} onDoubleClick={()=>focusConcept(c)}>{c.name}<span>{c.elements.every(id=>state.hidden?.includes(id))?'Hidden':`${c.elements.length} ${c.elements.length===1?'piece':'pieces'}`}</span></Button>)}</div>
      {selected&&selectedPart&&<section className="study-selection" aria-label="Selected structure"><h3 ref={selectionHeader} tabIndex={-1}>{selected.name}</h3><p>{explanation(selected.name,selectedPart.system)}</p><p className="study-note">{selected.id} · Descriptions may be general system context.</p><p className="study-note">Selection is outlined and visible through surrounding anatomy.</p><div className="study-actions"><Button variant="outline" onClick={()=>setState(s=>({...s,focus:selected.elements,isolate:false,reset:s.reset+1}))}>Focus selection</Button><Button variant="outline" disabled={(state.labels?.length??0)>=6&&!state.labels?.some(c=>c.id===selected.id)} onClick={pin}>{state.labels?.some(c=>c.id===selected.id)?'Unpin label':'Pin label'}</Button><Button variant="outline" disabled={selected.elements.every(id=>state.hidden?.includes(id))} onClick={hideSelected}>Hide selected</Button><Button onClick={()=>setState(s=>({...s,isolate:!s.isolate,focus:s.isolate?undefined:selected.elements,reset:s.reset+1}))}>{state.isolate?'Show region':'Isolate'}</Button><Button variant="outline" onClick={()=>{setSelected(null);setState(s=>({...s,selected:[],isolate:false,focus:undefined,reset:s.reset+1}));}}>Clear</Button></div></section>}
      </>}
    </aside>
    <nav className="study-camera glass" aria-label="Study camera">{(['front','three-quarter','side','back'] as View[]).map(v=><Button variant="ghost" key={v} disabled={!!quiz&&quiz.mode==='find'&&v!=='front'} aria-pressed={sceneState.view===v} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1}))}>{v==='three-quarter'?'¾':v[0].toUpperCase()+v.slice(1)}</Button>)}<Button variant="ghost" aria-label="Reset region view" onClick={()=>setState(s=>({...s,view:'front',focus:undefined,isolate:false,reset:s.reset+1}))}><RotateCcw size={16}/></Button></nav>
    <div className="study-status">{atlas.parts.filter(p=>isPartVisible(p,sceneState)).length} pieces visible · {quiz?.mode==='find'?'Drag to pan':'Drag to orbit'} · Double-tap to focus · Scroll or pinch to zoom</div>
    {progress<100&&!error&&<div className="loading glass" role="status">Preparing anatomy · {progress}%</div>}
    {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button onClick={onExit}>Return to explorer</Button></div>}
  </main>;
}
