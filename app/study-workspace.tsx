import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,BookOpen,RotateCcw} from 'lucide-react';
import AnatomyScene from './scene';
import {Button} from '@/components/ui/button';
import {SYSTEMS,type Atlas,type Concept,type SceneState,type View} from './anatomy';
import {REGIONS,REGION_GROUPS,conceptPieces,isPartVisible} from './study-model';
import {atlasIndex,createWorkspace,sidePieces,searchConcepts,regionFor,downloadText,type Side} from './workspace-model';
import {useWorkspace} from './use-workspace';
import {ViewTools} from './view-tools';
import StudyBrowser from './study-browser';
import StudyLibrary from './study-library';
import StructureCard from './structure-card';
import GuidedLessons from './guided-lessons';
import StudyPractice from './study-practice';
import StudyRevisionPanel from './study-revision-panel';
import {readRevision,saveRevision,recordReview,dueRevision,mergeRevision,exportRevision} from './study-revision';
import {createQuiz,answerQuiz,nextQuestion,quizScene,matchesPiece,type QuizSession,type QuizMode} from './study-quiz';
import './study.css';
type Tab='explore'|'practice'|'revision'|'library'|'lessons';
export default function StudyWorkspace({atlas,onExit}:{atlas:Atlas;onExit:()=>void}){
 const {workspace,commit,scene:setScene,restore,back,forward,canBack,canForward,notice,setNotice}=useWorkspace(atlas);
 const {region,side,scene:state,selection:selected}=workspace,index=atlasIndex(atlas);
 const [tab,setTab]=useState<Tab>('explore'),[query,setQuery]=useState(''),[globalSearch,setGlobalSearch]=useState(false),[filter,setFilter]=useState('all');
 const deferredQuery=useDeferredValue(query),searchRef=useRef<HTMLInputElement>(null),selectionRef=useRef<HTMLHeadingElement>(null);
 const [saved,setSaved]=useState(()=>{try{return readRevision(localStorage,new Set(index.concepts.keys()));}catch{return {items:[],warning:'Storage unavailable. Export revision to keep your progress.'};}});
 const initialRevision=useRef(saved);
 const [storageNotice,setStorageNotice]=useState(saved.warning);
 const [quiz,setQuiz]=useState<QuizSession|null>(null),[practiceIds,setPracticeIds]=useState<string[]|null>(null),[practiceName,setPracticeName]=useState(''),[hintHidden,setHintHidden]=useState<string[]>([]);
 const [candidates,setCandidates]=useState<string[]|null>(null),[progress,setProgress]=useState(0),[error,setError]=useState('');
 const concepts=index.regions.get(region)??[],definition=REGIONS.find(r=>r.id===region)!;
 const regionParts=useMemo(()=>state.scope?.map(id=>index.parts.get(id)).filter(p=>!!p)??[],[state.scope,index]);
 const systems=useMemo(()=>SYSTEMS.filter(s=>regionParts.some(p=>p.system===s.id)),[regionParts]);
 const results=useMemo(()=>searchConcepts(atlas,globalSearch?atlas.concepts:concepts,deferredQuery,filter,side),[atlas,globalSearch,concepts,deferredQuery,filter,side]);
 const pool=useMemo(()=>searchConcepts(atlas,practiceIds?practiceIds.flatMap(id=>{const c=index.concepts.get(id);return c?[c]:[];}):concepts,'',filter,side).map(c=>({...c,elements:sidePieces(atlas,c.elements,side)})),[atlas,practiceIds,concepts,filter,side,index]);
 const sceneState=useMemo(()=>quiz?{...quizScene(state,quiz,atlas),hidden:hintHidden,chooseAtPoint:false,cutaway:undefined,contextOpacity:1,selectionStyle:'xray' as const}:state,[state,quiz,atlas,hintHidden]);
 const visibleCount=useMemo(()=>atlas.parts.filter(p=>isPartVisible(p,sceneState)).length,[atlas,sceneState]);
 useEffect(()=>{if(saved===initialRevision.current)return;try{setStorageNotice(saveRevision(localStorage,saved.items));}catch{setStorageNotice('Storage unavailable. Export revision to keep your progress.');}},[saved]);
 const select=useCallback((concept:Concept,overrideSide?:Side)=>{
  setCandidates(null);
  commit(w=>{
   const targetSide=overrideSide??w.side;let next={...w,side:targetSide};const requested=sidePieces(atlas,concept.elements,targetSide);if(!requested.length)return w;const scoped=new Set(w.scene.scope),outside=requested.some(id=>!scoped.has(id));
   if(outside){const found=regionFor(atlas,concept);next=createWorkspace(atlas,found??w.region);if(!found)next.scene.scope=conceptPieces([...(index.regions.get(w.region)??[]),concept]);next.side=targetSide;next.scene.scope=sidePieces(atlas,next.scene.scope!,targetSide);}
   const elements=sidePieces(atlas,concept.elements,next.side);if(!elements.length)return w;
   return {...next,selection:{...concept,elements},scene:{...next.scene,selected:elements,hidden:next.scene.hidden?.filter(id=>!elements.includes(id)),isolate:false,focus:outside||w.scene.isolate?undefined:w.scene.focus,reset:outside?w.scene.reset+1:w.scene.reset,rotate:false}};
  });
 },[atlas,index,commit]);
 const focus=useCallback((concept:Concept,overrideSide?:Side)=>{select(concept,overrideSide);setScene(s=>({...s,focus:s.selected,isolate:false,reset:s.reset+1}),false);},[select,setScene]);
 const pieceConcept=(id:string)=>{const p=index.parts.get(id);return p?{id:p.conceptId,name:p.name,elements:[id]}:null;};
 const clear=()=>commit(w=>({...w,selection:null,scene:{...w.scene,selected:[],isolate:false,focus:undefined,reset:w.scene.reset+1}}));
 const hide=()=>{if(selected)commit(w=>({...w,selection:null,scene:{...w.scene,hidden:[...new Set([...(w.scene.hidden??[]),...w.scene.selected])],selected:[],isolate:false,focus:undefined}}));};
 const changeRegion=(id:string)=>{commit(w=>({...createWorkspace(atlas,id),scene:{...createWorkspace(atlas,id).scene,reset:w.scene.reset+1}}));setQuery('');setFilter('all');setGlobalSearch(false);setQuiz(null);setPracticeIds(null);setCandidates(null);setTab('explore');};
 const changeSide=(next:Side)=>commit(w=>{const scope=sidePieces(atlas,[...index.pieces.get(w.region)!],next);return {...w,side:next,selection:null,scene:{...w.scene,scope,selected:[],hidden:[],focus:undefined,isolate:false,reset:w.scene.reset+1}};});
 const startQuiz=(mode:QuizMode,limit?:number)=>{if(!pool.length)return;setQuiz(createQuiz(pool,mode,Math.random,{limit,context:[...concepts,...pool].map(c=>({...c,elements:sidePieces(atlas,c.elements,side)}))}));setHintHidden([]);setCandidates(null);setTab('practice');};
 const submitAnswer=(correct:boolean,revealed=false)=>{if(!quiz||quiz.feedback||quiz.index>=quiz.questions.length)return;setSaved(s=>({...s,items:recordReview(s.items,quiz.questions[quiz.index].target.id,correct&&!revealed)}));setQuiz(answerQuiz(quiz,correct,revealed));};
 const pick=(id:string)=>{if(quiz){if(quiz.mode!=='name'&&!quiz.feedback&&quiz.index<quiz.questions.length)submitAnswer(matchesPiece(quiz.questions[quiz.index].target,id));return;}const c=pieceConcept(id);if(c)select(c);};
 const endQuiz=()=>{setQuiz(null);setHintHidden([]);setTab('explore');setScene(s=>({...s,reset:s.reset+1,cameraRevision:(s.cameraRevision??0)+1}),false);};
 const practiceCollection=(ids:string[],name:string)=>{setPracticeIds(ids);setPracticeName(name);setFilter('all');setQuiz(null);setTab('practice');};
 const inspect=(c:Concept)=>{setQuiz(null);setTab('explore');setFilter('all');setQuery('');focus(c,sidePieces(atlas,c.elements,side).length?side:'both');};
 const hideHint=()=>{if(!quiz)return;const target=new Set(quiz.questions[quiz.index].target.elements),hidden=new Set(hintHidden);const remaining=(sceneState.scope??[]).flatMap(id=>{const p=index.parts.get(id);return p&&!target.has(id)&&!hidden.has(id)?[p]:[];});remaining.sort((a,b)=>{const volume=(p:typeof a)=>p.bounds[0].reduce((v,n,i)=>v*(p.bounds[1][i]-n),1);return volume(b)-volume(a);});if(remaining[0])setHintHidden(ids=>[...ids,remaining[0].id]);else setNotice('All surrounding pieces are already hidden.');};
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')||quiz)return;
   if(e.key==='/'){e.preventDefault();setTab('explore');searchRef.current?.focus();}
   else if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();back();}else if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();forward();}
   else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)forward();else back();}
   else if(!e.ctrlKey&&!e.metaKey&&!e.altKey){if(e.key.toLowerCase()==='f'&&selected){e.preventDefault();focus(selected);}else if(e.key.toLowerCase()==='h'&&selected){e.preventDefault();hide();}else if(e.key==='Escape'){setCandidates(null);clear();}}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 });
 useEffect(()=>{if(selected&&tab==='explore')selectionRef.current?.scrollIntoView({block:'nearest'});},[selected,tab]);
 const filters=<div className="browser-filters"><label>System<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All systems</option>{(globalSearch||practiceIds?SYSTEMS:systems).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Side<select value={side} onChange={e=>changeSide(e.target.value as Side)}><option value="both">Both sides</option><option value="left">Patient left</option><option value="right">Patient right</option></select></label></div>;
 return <main className="study-workspace">
 <AnatomyScene atlas={atlas} state={sceneState} onSelect={pick} onFocus={id=>{if(!quiz){const c=pieceConcept(id);if(c)focus(c);}}} onCandidates={ids=>{if(!quiz){setCandidates(ids);setScene(s=>({...s,chooseAtPoint:false}),false);}}} onCameraChange={camera=>{if(!quiz)setScene(s=>({...s,camera}),false);}} onCapture={url=>{const a=document.createElement('a');a.download='annatlas-view.png';a.href=url;a.click();}} onProgress={setProgress} onError={setError}/>
 <header className="study-header glass"><Button variant="ghost" onClick={onExit}><ArrowLeft size={16}/>Explorer</Button><div><BookOpen size={17}/><strong>Regional study</strong></div><label>Region<select disabled={!!quiz} value={region} onChange={e=>changeRegion(e.target.value)}>{REGION_GROUPS.map(g=><optgroup key={g.id} label={g.name}>{REGIONS.filter(r=>r.group===g.id).map(r=><option key={r.id} value={r.id}>{r.overview?`${r.name} — overview`:r.name}</option>)}</optgroup>)}</select></label></header>
 <aside className="study-panel glass" aria-label="Study controls">
 <nav className="study-tabs" aria-label="Study activities">{(['explore','practice','revision','library','lessons'] as Tab[]).map(t=><Button key={t} variant="ghost" aria-pressed={tab===t} onClick={()=>{if(quiz){setQuiz(null);setHintHidden([]);setScene(s=>({...s,reset:s.reset+1,cameraRevision:(s.cameraRevision??0)+1}),false);}if(t==='practice'){setPracticeIds(null);setPracticeName(definition.name);}setTab(t);}}>{t==='library'?'Library':t==='revision'?`Review (${dueRevision(saved.items).length})`:t[0].toUpperCase()+t.slice(1)}</Button>)}</nav>
 {(notice||storageNotice)&&<p className="study-storage-notice" role="status">{notice||storageNotice}</p>}
 {tab==='explore'&&<>
 <div className="study-history"><Button variant="outline" disabled={!canBack} onClick={back} title="Alt+Left or Ctrl/Cmd+Z">← Back / Undo</Button><Button variant="outline" disabled={!canForward} onClick={forward} title="Alt+Right or Ctrl/Cmd+Shift+Z">Forward / Redo →</Button></div>
 <h2>{definition.name}</h2><p className="study-note">{concepts.length} named structures · {systems.length} systems. {definition.coverageNote??'Includes available modeled components; some structures cross regional boundaries.'}</p>
 {selected&&<section className="study-selection" aria-label="Selected structure"><h3 ref={selectionRef}>{selected.name}</h3><div className="study-actions"><Button variant="outline" onClick={()=>focus(selected)}>Focus [F]</Button><Button variant="outline" onClick={hide}>Hide [H]</Button><Button variant="outline" disabled={(state.labels?.length??0)>=6&&!state.labels?.some(c=>c.id===selected.id)} onClick={()=>setScene(s=>({...s,labels:s.labels?.some(c=>c.id===selected.id)?s.labels.filter(c=>c.id!==selected.id):[...(s.labels??[]),selected],labelsVisible:true}))}>{state.labels?.some(c=>c.id===selected.id)?'Unpin':'Pin label'}</Button><Button variant="outline" onClick={()=>setScene(s=>({...s,isolate:!s.isolate,focus:s.isolate?undefined:s.selected,reset:s.reset+1}))}>{state.isolate?'Show region':'Isolate'}</Button><Button variant="outline" onClick={()=>setTab('library')}>Add to study set</Button><Button variant="ghost" onClick={clear}>Clear</Button></div><details><summary>Structure information</summary><StructureCard concept={selected} atlas={atlas}/></details></section>}
 <label className="study-search">Search {globalSearch?'whole atlas':'region'}<input ref={searchRef} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name or atlas identifier…"/></label><label className="inline-check"><input type="checkbox" checked={globalSearch} onChange={e=>setGlobalSearch(e.target.checked)}/>Search whole atlas and jump to region</label>
 {filters}<StudyBrowser atlas={atlas} concepts={results} side={side} selected={selected} hidden={state.hidden??[]} onSelect={select} onFocus={focus}/>
 <details><summary>Visible systems and labels</summary><fieldset className="study-systems"><legend>Visible systems</legend>{systems.map(sys=><label key={sys.id}><input type="checkbox" checked={state.visible.includes(sys.id)} onChange={()=>commit(w=>({...w,selection:null,scene:{...w.scene,selected:[],isolate:false,focus:undefined,visible:w.scene.visible.includes(sys.id)?w.scene.visible.filter(id=>id!==sys.id):[...w.scene.visible,sys.id]}}))}/>{sys.name}</label>)}</fieldset><div className="study-actions"><Button variant="outline" disabled={!state.hidden?.length} onClick={()=>setScene(s=>({...s,hidden:[]}))}>Restore hidden ({state.hidden?.length??0})</Button><Button variant="outline" disabled={!state.labels?.length} onClick={()=>setScene(s=>({...s,labelsVisible:!s.labelsVisible}))}>{state.labelsVisible?'Hide':'Show'} labels ({state.labels?.length??0}/6)</Button></div>{state.labels?.map(c=><Button key={c.id} variant="ghost" onClick={()=>setScene(s=>({...s,labels:s.labels?.filter(x=>x.id!==c.id)}))}>Unpin {c.name}</Button>)}</details>
 <ViewTools state={state} onChange={fn=>setScene(fn)} onCapture={()=>setScene(s=>({...s,capture:(s.capture??0)+1}),false)}/><details><summary>Keyboard shortcuts</summary><p className="study-note">/ Search · F Focus · H Hide · Escape Clear · Alt+←/→ history · Ctrl/Cmd+Z undo · Ctrl/Cmd+Shift+Z redo. Right-click the model to choose among overlapping structures.</p></details>
 </>}
 {tab==='practice'&&<>{!quiz&&filters}<StudyPractice quiz={quiz} count={pool.length} sourceName={practiceIds?practiceName:definition.name} ready={progress===100&&!error} onStart={startQuiz} onAnswer={submitAnswer} onNext={()=>{setQuiz(q=>q?nextQuestion(q):null);setHintHidden([]);}} onEnd={endQuiz} onHideHint={hideHint}/></>}
 {tab==='revision'&&<StudyRevisionPanel items={saved.items} concepts={atlas.concepts} notice="" ready={progress===100&&!error} onInspect={inspect} onRemove={id=>setSaved(s=>({...s,items:s.items.filter(i=>i.id!==id)}))} onPractice={(mode,dueOnly)=>{const items=dueOnly?dueRevision(saved.items):saved.items,ids=items.map(i=>i.id),cs=ids.flatMap(id=>{const c=index.concepts.get(id);if(!c)return [];const elements=sidePieces(atlas,c.elements,side);return elements.length?[{...c,elements}]:[];});if(!cs.length){setNotice('No revision structures match the selected side. Choose Both sides in Explore.');return;}setPracticeIds(ids);setPracticeName(dueOnly?'Due revision':'All revision');setFilter('all');setQuiz(createQuiz(cs,mode,Math.random,{context:cs}));setHintHidden([]);setTab('practice');}} onExport={()=>downloadText('annatlas-revision.json',exportRevision(saved.items))} onImport={raw=>{const result=mergeRevision(saved.items,raw,new Set(index.concepts.keys()));if(result.warning)setNotice(result.warning);else{setSaved({items:result.items,warning:''});setNotice('Revision imported.');}}}/>}
 <div hidden={tab!=='library'}><StudyLibrary atlas={atlas} workspace={workspace} onRestore={w=>{restore(w);setTab('explore');}} onPractice={ids=>practiceCollection(ids,'Custom study set')} selection={selected} onInspect={inspect}/></div>
 <div hidden={tab!=='lessons'}><GuidedLessons atlas={atlas} onScene={config=>{const next=createWorkspace(atlas,config.region);const p=config.selected.length===1?pieceConcept(config.selected[0]):null;commit(w=>({...next,selection:p,scene:{...next.scene,selected:config.selected,hidden:config.hidden,focus:config.focus,view:config.view??next.scene.view,reset:w.scene.reset+1}}));}} onPractice={ids=>practiceCollection(ids,'Guided lesson')}/></div>
 </aside>
 {candidates&&<section className="overlap-picker glass" aria-label="Choose overlapping structure"><h3>Structures at this point</h3><Button variant="ghost" onClick={()=>setCandidates(null)}>Close</Button>{candidates.length===0?<p>No visible structures at this point.</p>:candidates.slice(0,60).map(id=>{const p=index.parts.get(id);return p&&<Button variant="ghost" key={id} onClick={()=>{const c=pieceConcept(id);if(c)select(c);}}>{p.name}</Button>;})}</section>}
 <nav className="study-camera glass" aria-label="Study camera">{(['front','three-quarter','side','back'] as View[]).map(v=><Button variant="ghost" key={v} disabled={!!quiz&&quiz.mode==='find'&&v!=='front'} aria-pressed={sceneState.view===v} onClick={()=>setScene(s=>({...s,view:v,reset:s.reset+1}))}>{v==='three-quarter'?'¾':v[0].toUpperCase()+v.slice(1)}</Button>)}<Button variant="ghost" aria-label="Reset region view" onClick={()=>setScene(s=>({...s,view:definition.view,focus:undefined,isolate:false,camera:undefined,reset:s.reset+1}))}><RotateCcw size={16}/></Button></nav>
 <div className="study-status">{visibleCount} pieces visible · {quiz?.mode==='find'?'Drag to pan':'Drag to orbit'} · {quiz?'Scroll or pinch to zoom':'Double-tap to focus · Scroll or pinch to zoom'}</div>
 {progress<100&&!error&&<div className="loading glass" role="status">Preparing anatomy · {progress}%</div>}{error&&<div className="loading glass error" role="alert"><p>{error}</p><Button onClick={onExit}>Return to explorer</Button></div>}
 </main>;
}
