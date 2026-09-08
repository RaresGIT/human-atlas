import {formatAnatomyName} from './format-anatomy-name';
import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,RotateCcw,SlidersHorizontal,Layers3,Save,HelpCircle,Search,X,ChevronDown,ChevronUp,Camera,Undo2,Redo2} from 'lucide-react';
import AnatomyScene from './scene';
import {Button} from '@/components/ui/button';
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle} from '@/components/ui/popover';
import {SYSTEMS,type Atlas,type Concept,type SceneState,type View} from './anatomy';
import {REGIONS,REGION_GROUPS,conceptPieces,isPartVisible} from './study-model';
import {atlasIndex,createWorkspace,sidePieces,searchConcepts,regionFor,downloadText,type Side} from './workspace-model';
import {useWorkspace} from './use-workspace';
import StudyInspector from './study-inspector';
import StudySceneTools,{toolTitles,type StudyTool} from './study-scene-tools';
import StudyBrowser from './study-browser';
import StudyLibrary from './study-library';
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
 const deferredQuery=useDeferredValue(query),searchRef=useRef<HTMLInputElement>(null);
 const [tool,setTool]=useState<StudyTool|null>(null),[inspector,setInspector]=useState(!!workspace.selection),[filtersOpen,setFiltersOpen]=useState(false),[sheet,setSheet]=useState<'collapsed'|'half'|'expanded'>('half');
 const dragStart=useRef(0);
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
 const studyLayout=useMemo(()=>({panel:tab==='library'||tab==='revision'?'wide' as const:'browse' as const,inspector:!!tool||(tab==='explore'&&inspector&&!!selected),sheet}),[tab,tool,inspector,selected,sheet]);
 const sceneState=useMemo(()=>({...((quiz?{...quizScene(state,quiz,atlas),hidden:hintHidden,chooseAtPoint:false,cutaway:undefined,contextOpacity:1,selectionStyle:'xray' as const}:state)),studyLayout}),[state,quiz,atlas,hintHidden,studyLayout]);
 const visibleCount=useMemo(()=>atlas.parts.filter(p=>isPartVisible(p,sceneState)).length,[atlas,sceneState]);
 useEffect(()=>{if(saved===initialRevision.current)return;try{setStorageNotice(saveRevision(localStorage,saved.items));}catch{setStorageNotice('Storage unavailable. Export revision to keep your progress.');}},[saved]);
 const select=useCallback((concept:Concept,overrideSide?:Side)=>{
  setCandidates(null);setInspector(true);setTool(null);setSheet(v=>v==='collapsed'?'half':v);
  commit(w=>{
   const targetSide=overrideSide??w.side;let next={...w,side:targetSide};const requested=sidePieces(atlas,concept.elements,targetSide);if(!requested.length)return w;const scoped=new Set(w.scene.scope),outside=requested.some(id=>!scoped.has(id));
   if(outside){const found=regionFor(atlas,concept);next=createWorkspace(atlas,found??w.region);if(!found)next.scene.scope=conceptPieces([...(index.regions.get(w.region)??[]),concept]);next.side=targetSide;next.scene.scope=sidePieces(atlas,next.scene.scope!,targetSide);}
   const elements=sidePieces(atlas,concept.elements,next.side);if(!elements.length)return w;
   return {...next,selection:{...concept,elements},scene:{...next.scene,selected:elements,hidden:next.scene.hidden?.filter(id=>!elements.includes(id)),isolate:false,focus:outside||w.scene.isolate?undefined:w.scene.focus,reset:outside?w.scene.reset+1:w.scene.reset,rotate:false}};
  });
 },[atlas,index,commit]);
 const focus=useCallback((concept:Concept,overrideSide?:Side)=>{select(concept,overrideSide);setScene(s=>({...s,focus:s.selected,isolate:false,reset:s.reset+1}),false);},[select,setScene]);
 const pieceConcept=(id:string)=>{const p=index.parts.get(id);return p?{id:p.conceptId,name:p.name,elements:[id]}:null;};
 const clear=()=>{setInspector(false);commit(w=>({...w,selection:null,scene:{...w.scene,selected:[],isolate:false,focus:undefined,reset:w.scene.reset+1}}));};
 const hide=()=>{if(selected)commit(w=>({...w,selection:null,scene:{...w.scene,hidden:[...new Set([...(w.scene.hidden??[]),...w.scene.selected])],selected:[],isolate:false,focus:undefined}}));};
 const changeRegion=(id:string)=>{commit(w=>({...createWorkspace(atlas,id),scene:{...createWorkspace(atlas,id).scene,reset:w.scene.reset+1}}));setQuery('');setFilter('all');setGlobalSearch(false);setQuiz(null);setPracticeIds(null);setCandidates(null);setTab('explore');setTool(null);setInspector(false);setSheet('half');};
 const changeSide=(next:Side)=>commit(w=>{const scope=sidePieces(atlas,[...index.pieces.get(w.region)!],next);return {...w,side:next,selection:null,scene:{...w.scene,scope,selected:[],hidden:[],focus:undefined,isolate:false,reset:w.scene.reset+1}};});
 const startQuiz=(mode:QuizMode,limit?:number)=>{if(!pool.length)return;setQuiz(createQuiz(pool,mode,Math.random,{limit,context:[...concepts,...pool].map(c=>({...c,elements:sidePieces(atlas,c.elements,side)}))}));setHintHidden([]);setCandidates(null);setTab('practice');};
 const submitAnswer=(correct:boolean,revealed=false)=>{if(!quiz||quiz.feedback||quiz.index>=quiz.questions.length)return;setSaved(s=>({...s,items:recordReview(s.items,quiz.questions[quiz.index].target.id,correct&&!revealed)}));setQuiz(answerQuiz(quiz,correct,revealed));};
 const pick=(id:string)=>{if(quiz){if(quiz.mode!=='name'&&!quiz.feedback&&quiz.index<quiz.questions.length)submitAnswer(matchesPiece(quiz.questions[quiz.index].target,id));return;}const c=pieceConcept(id);if(c)select(c);};
 const endQuiz=()=>{setQuiz(null);setHintHidden([]);setTab('explore');setScene(s=>({...s,reset:s.reset+1,cameraRevision:(s.cameraRevision??0)+1}),false);};
 const practiceCollection=(ids:string[],name:string)=>{setPracticeIds(ids);setPracticeName(name);setFilter('all');setQuiz(null);setTab('practice');};
 const inspect=(c:Concept)=>{setQuiz(null);setTab('explore');setFilter('all');setQuery('');focus(c,sidePieces(atlas,c.elements,side).length?side:'both');};
 const hideHint=()=>{if(!quiz)return;const target=new Set(quiz.questions[quiz.index].target.elements),hidden=new Set(hintHidden);const remaining=(sceneState.scope??[]).flatMap(id=>{const p=index.parts.get(id);return p&&!target.has(id)&&!hidden.has(id)?[p]:[];});remaining.sort((a,b)=>{const volume=(p:typeof a)=>p.bounds[0].reduce((v,n,i)=>v*(p.bounds[1][i]-n),1);return volume(b)-volume(a);});if(remaining[0])setHintHidden(ids=>[...ids,remaining[0].id]);else setNotice('All surrounding pieces are already hidden.');};
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!quiz&&(selected||tool||candidates)){e.preventDefault();setCandidates(null);if(selected){clear();setTool(null);}else if(tool){closeTool();}return;}if((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')||quiz)return;
   if(e.key==='/'){e.preventDefault();setTab('explore');setTool(null);setInspector(false);setSheet(v=>v==='collapsed'?'half':v);requestAnimationFrame(()=>searchRef.current?.focus());}
   else if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();back();}else if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();forward();}
   else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)forward();else back();}
   else if(!e.ctrlKey&&!e.metaKey&&!e.altKey){if(e.key.toLowerCase()==='f'&&selected){e.preventDefault();focus(selected);}else if(e.key.toLowerCase()==='h'&&selected){e.preventDefault();hide();}else if(e.key==='Escape'){if(tool){setTool(null);}else if(candidates){setCandidates(null);}else{clear();}}}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 });
 const closeTool=()=>{const title=tool&&toolTitles[tool];setTool(null);setSheet(v=>v==='expanded'?'half':v);requestAnimationFrame(()=>{if(title)document.querySelector<HTMLButtonElement>(`.study-tool-buttons button[aria-label="${title}"]`)?.focus();});};
 const closeInspector=()=>{setInspector(false);requestAnimationFrame(()=>searchRef.current?.focus({preventScroll:true}));};
 const openTool=(next:StudyTool)=>{setTool(t=>t===next?null:next);setSheet(v=>v==='collapsed'?'half':v);};
 const openLibrary=()=>{setTool(null);setInspector(false);setTab('library');setSheet('half');};
 const switchTab=(next:Tab)=>{if(quiz){setQuiz(null);setHintHidden([]);setScene(s=>({...s,reset:s.reset+1,cameraRevision:(s.cameraRevision??0)+1}),false);}if(next==='practice'){setPracticeIds(null);setPracticeName(definition.name);}setTab(next);setTool(null);setInspector(false);setSheet('half');};
 const resizeSheet=(direction:number)=>setSheet(current=>{const positions=['collapsed','half','expanded'] as const;return positions[Math.max(0,Math.min(2,positions.indexOf(current)+direction))];});
 const coverage=definition.coverageNote??'Includes available modeled components; some structures cross regional boundaries.';
 const filters=<div className="browser-filters"><label>System<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All systems</option>{(globalSearch||practiceIds?SYSTEMS:systems).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Side<select value={side} onChange={e=>changeSide(e.target.value as Side)}><option value="both">Both sides</option><option value="left">Patient left</option><option value="right">Patient right</option></select></label></div>;
 return <main className="study-workspace" data-activity={tab} data-inspector={tab==='explore'&&inspector&&!!selected} data-tool={!!tool} data-sheet={sheet} data-quiz={!!quiz}>
 <AnatomyScene atlas={atlas} state={sceneState} onSelect={pick} onFocus={id=>{if(!quiz){const c=pieceConcept(id);if(c)focus(c);}}} onCandidates={ids=>{if(!quiz){setCandidates(ids);setScene(s=>({...s,chooseAtPoint:false}),false);}}} onCameraChange={camera=>{if(!quiz)setScene(s=>({...s,camera}),false);}} onCapture={url=>{const a=document.createElement('a');a.download='annatlas-view.png';a.href=url;a.click();}} onProgress={setProgress} onError={setError}/>
 <header className="study-header study-surface">
  <div className="study-brand"><Button variant="ghost" onClick={onExit} aria-label="Return to Explorer" title="Return to Explorer"><ArrowLeft size={18}/></Button><BookOpen size={18}/><strong>Study</strong></div>
  <nav className="study-tabs" aria-label="Study activities">{(['explore','practice','revision','library','lessons'] as Tab[]).map(t=><Button key={t} variant="ghost" aria-pressed={tab===t} onClick={()=>switchTab(t)}>{t==='revision'?<>Review <span className="study-count">{dueRevision(saved.items).length}</span></>:t[0].toUpperCase()+t.slice(1)}</Button>)}</nav>
  <label className="study-region"><span>Region</span><select disabled={!!quiz} value={region} onChange={e=>changeRegion(e.target.value)}>{REGION_GROUPS.map(g=><optgroup key={g.id} label={g.name}>{REGIONS.filter(r=>r.group===g.id).map(r=><option key={r.id} value={r.id}>{r.overview?`${r.name} — overview`:r.name}</option>)}</optgroup>)}</select></label>
 </header>
 <div className="study-sheet">
  <div className="study-sheet-bar">
   <Button variant="ghost" className="sheet-drag-handle" aria-label="Resize study panel" onPointerDown={e=>{dragStart.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={e=>{const distance=dragStart.current-e.clientY;if(Math.abs(distance)>35)resizeSheet(distance>0?1:-1);}} onClick={e=>{if(e.detail===0)resizeSheet(sheet==='expanded'?-1:1);}} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();resizeSheet(e.key==='ArrowUp'?1:-1);}}}><span/></Button>
   <strong>{tool?toolTitles[tool]:inspector&&selected&&tab==='explore'?formatAnatomyName(selected.name):tab==='explore'?'Structures':tab==='revision'?'Review':tab[0].toUpperCase()+tab.slice(1)}</strong>
   <Button variant="ghost" aria-label="Collapse study panel" disabled={sheet==='collapsed'} onClick={()=>resizeSheet(-1)}><ChevronDown size={18}/></Button><Button variant="ghost" aria-label="Expand study panel" disabled={sheet==='expanded'} onClick={()=>resizeSheet(1)}><ChevronUp size={18}/></Button>
  </div>
  <aside className="study-panel study-surface" aria-label="Study controls">
   {(notice||storageNotice)&&<div className="study-storage-notice" role="status"><p>{notice||storageNotice}</p>{notice&&<Button variant="ghost" aria-label="Dismiss notice" onClick={()=>setNotice('')}><X size={16}/></Button>}</div>}
   <div className="study-browser-pane" hidden={tab!=='explore'}>
    <div className="study-panel-heading"><h2>Structures</h2></div>
    <label className="study-search"><Search size={17}/><input ref={searchRef} aria-label="Search structures" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search structures…"/></label>
    <div className="study-filter-heading"><label className="study-scope-select"><span>In</span><select aria-label="Search scope" value={globalSearch?'atlas':'region'} onChange={e=>setGlobalSearch(e.target.value==='atlas')}><option value="region">This region</option><option value="atlas">Whole atlas</option></select></label><Button variant="ghost" aria-expanded={filtersOpen} aria-controls="study-browser-filters" onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={15}/>Filters</Button></div>
    {globalSearch&&<p className="study-note search-scope-note">Selecting a result opens its region.</p>}
    <div id="study-browser-filters" hidden={!filtersOpen}>{filters}</div>
    {(filter!=='all'||side!=='both')&&<div className="study-filter-chips">{filter!=='all'&&<Button variant="ghost" aria-label="Remove system filter" onClick={()=>setFilter('all')}>{SYSTEMS.find(s=>s.id===filter)?.name}<X size={13}/></Button>}{side!=='both'&&<Button variant="ghost" aria-label="Remove side filter" onClick={()=>changeSide('both')}>Patient {side}<X size={13}/></Button>}</div>}
    {selected&&!inspector&&<Button className="study-current-selection" variant="outline" onClick={()=>{setInspector(true);setSheet(v=>v==='collapsed'?'half':v);}}>Inspect {formatAnatomyName(selected.name)}</Button>}
    <p className="study-note study-result-count">{results.length} structures</p>
    <StudyBrowser atlas={atlas} concepts={results} side={side} selected={selected} hidden={state.hidden??[]} onSelect={select} onFocus={focus}/>
    <details className="study-region-about"><summary>About this region</summary><p className="study-note">{concepts.length} named structures · {systems.length} systems. {coverage}</p></details>
   </div>
 {tab==='practice'&&<>{!quiz&&<details className="practice-filters"><summary>Practice filters{filter!=='all'||side!=='both'?' · active':''}</summary>{filters}</details>}<StudyPractice quiz={quiz} count={pool.length} sourceName={practiceIds?practiceName:definition.name} ready={progress===100&&!error} onStart={startQuiz} onAnswer={submitAnswer} onNext={()=>{setQuiz(q=>q?nextQuestion(q):null);setHintHidden([]);}} onEnd={endQuiz} onHideHint={hideHint}/></>}
 {tab==='revision'&&<StudyRevisionPanel items={saved.items} concepts={atlas.concepts} notice="" ready={progress===100&&!error} onInspect={inspect} onRemove={id=>setSaved(s=>({...s,items:s.items.filter(i=>i.id!==id)}))} onPractice={(mode,dueOnly)=>{const items=dueOnly?dueRevision(saved.items):saved.items,ids=items.map(i=>i.id),cs=ids.flatMap(id=>{const c=index.concepts.get(id);if(!c)return [];const elements=sidePieces(atlas,c.elements,side);return elements.length?[{...c,elements}]:[];});if(!cs.length){setNotice('No revision structures match the selected side. Choose Both sides in Explore.');return;}setPracticeIds(ids);setPracticeName(dueOnly?'Due revision':'All revision');setFilter('all');setQuiz(createQuiz(cs,mode,Math.random,{context:cs}));setHintHidden([]);setTab('practice');}} onExport={()=>downloadText('annatlas-revision.json',exportRevision(saved.items))} onImport={raw=>{const result=mergeRevision(saved.items,raw,new Set(index.concepts.keys()));if(result.warning)setNotice(result.warning);else{setSaved({items:result.items,warning:''});setNotice('Revision imported.');}}}/>}
 <div hidden={tab!=='library'}><StudyLibrary atlas={atlas} workspace={workspace} onRestore={w=>{restore(w);setTab('explore');setInspector(!!w.selection);setTool(null);}} onPractice={ids=>practiceCollection(ids,'Custom study set')} selection={selected} onInspect={inspect}/></div>
 <div hidden={tab!=='lessons'}><GuidedLessons atlas={atlas} onScene={config=>{const next=createWorkspace(atlas,config.region);const p=config.selected.length===1?pieceConcept(config.selected[0]):null;commit(w=>({...next,selection:p,scene:{...next.scene,selected:config.selected,hidden:config.hidden,focus:config.focus,view:config.view??next.scene.view,reset:w.scene.reset+1}}));}} onPractice={ids=>practiceCollection(ids,'Guided lesson')}/></div>

  </aside>
  {tab==='explore'&&inspector&&selected&&!tool&&<StudyInspector atlas={atlas} selected={selected} state={state} onFocus={()=>focus(selected)} onHide={hide} onChange={fn=>setScene(fn)} onLibrary={openLibrary} onClear={clear} onClose={closeInspector}/>}
  {tool&&<StudySceneTools tool={tool} workspace={workspace} systems={systems} onChange={fn=>setScene(fn)} onVisibility={id=>commit(w=>({...w,selection:null,scene:{...w.scene,selected:[],isolate:false,focus:undefined,visible:w.scene.visible.includes(id)?w.scene.visible.filter(x=>x!==id):[...w.scene.visible,id]}}))} onClose={closeTool} onLibrary={openLibrary} onCapture={()=>setScene(s=>({...s,capture:(s.capture??0)+1}),false)} coverage={coverage} conceptCount={concepts.length}/>}
 </div>
 {candidates&&<section className="overlap-picker glass" aria-label="Choose overlapping structure"><h3>Structures at this point</h3><Button variant="ghost" onClick={()=>setCandidates(null)}>Close</Button>{candidates.length===0?<p>No visible structures at this point.</p>:candidates.slice(0,60).map(id=>{const p=index.parts.get(id);return p&&<Button variant="ghost" key={id} onClick={()=>{const c=pieceConcept(id);if(c)select(c);}}>{formatAnatomyName(p.name)}</Button>;})}</section>}

 <div className="study-canvas-dock">
  {!quiz&&<div className="study-active-settings" aria-label="Active scene settings">
   {state.selectionStyle&&state.selectionStyle!=='solid'&&<Button variant="ghost" aria-label="Reset selection style" onClick={()=>setScene(s=>({...s,selectionStyle:'solid'}))}>{state.selectionStyle==='outline'?'Outline':'X-ray'} highlight <X size={13}/></Button>}
   {state.cutaway&&<Button variant="ghost" aria-label="Turn off cutaway" onClick={()=>setScene(s=>({...s,cutaway:undefined}))}>Cutaway on <X size={13}/></Button>}
   {(state.contextOpacity??1)<1&&<Button variant="ghost" aria-label="Reset surrounding opacity" onClick={()=>setScene(s=>({...s,contextOpacity:1}))}>Opacity {Math.round((state.contextOpacity??1)*100)}% <X size={13}/></Button>}
   {!!state.hidden?.length&&<Button variant="ghost" aria-label="Restore hidden pieces" onClick={()=>setScene(s=>({...s,hidden:[]}))}>{state.hidden.length} hidden <X size={13}/></Button>}
   {state.isolate&&<Button variant="ghost" onClick={()=>setScene(s=>({...s,isolate:false,focus:undefined,reset:s.reset+1}))}>Show region <X size={13}/></Button>}
   {!!state.labels?.length&&<Button variant="ghost" onClick={()=>openTool('layers')}>{state.labels.length} labels{state.labelsVisible?'':' hidden'}</Button>}
   {systems.some(sys=>!state.visible.includes(sys.id))&&<Button variant="ghost" onClick={()=>openTool('layers')}>Layers filtered</Button>}
   {state.chooseAtPoint&&<Button variant="ghost" onClick={()=>setScene(s=>({...s,chooseAtPoint:false}))}>Picking structure <X size={13}/></Button>}
  </div>}
  <nav className="study-canvas-toolbar study-surface" aria-label="Study global tools">
   {!quiz&&<Button variant="ghost" aria-label="Search structures" title="Search structures · /" onClick={()=>{setTab('explore');setTool(null);setInspector(false);setSheet(v=>v==='collapsed'?'half':v);requestAnimationFrame(()=>searchRef.current?.focus());}}><Search size={18}/></Button>}
   {!quiz&&<div className="study-tool-buttons">{(['layers','appearance'] as StudyTool[]).map(t=>{const Icon=t==='layers'?Layers3:SlidersHorizontal;return <Button key={t} variant="ghost" aria-label={toolTitles[t]} title={toolTitles[t]} aria-expanded={tool===t} onClick={()=>openTool(t)}><Icon size={18}/></Button>;})}</div>}
   <div className="study-rail-separator"/>
   <Popover><PopoverTrigger render={<Button variant="ghost" aria-label="Camera views" title="Camera views"/>}><Camera size={18}/></PopoverTrigger><PopoverContent side="left" align="center" className="study-camera-popover"><PopoverTitle>Camera view</PopoverTitle><div className="study-camera-options">{(['front','three-quarter','side','back'] as View[]).map(v=><Button key={v} variant="ghost" aria-pressed={sceneState.view===v} disabled={!!quiz&&quiz.mode==='find'&&v!=='front'} onClick={()=>setScene(s=>({...s,view:v,reset:s.reset+1}))}>{v==='three-quarter'?'Three-quarter':v[0].toUpperCase()+v.slice(1)}</Button>)}</div></PopoverContent></Popover>
   <Button variant="ghost" aria-label="Reset region view" title="Reset region view" onClick={()=>setScene(s=>({...s,view:definition.view,focus:undefined,isolate:false,camera:undefined,reset:s.reset+1}))}><RotateCcw size={18}/></Button>
   {!quiz&&<><div className="study-rail-separator"/><Button variant="ghost" disabled={!canBack} onClick={back} aria-label="Back / Undo" title="Back / Undo · Ctrl/Cmd+Z"><Undo2 size={18}/></Button><Button variant="ghost" disabled={!canForward} onClick={forward} aria-label="Forward / Redo" title="Forward / Redo · Ctrl/Cmd+Shift+Z"><Redo2 size={18}/></Button><div className="study-rail-separator"/><div className="study-tool-buttons">{(['save','help'] as StudyTool[]).map(t=>{const Icon=t==='save'?Save:HelpCircle;return <Button key={t} variant="ghost" aria-label={toolTitles[t]} title={toolTitles[t]} aria-expanded={tool===t} onClick={()=>openTool(t)}><Icon size={18}/></Button>;})}</div></>}
  </nav>
  <div className="study-status">{visibleCount} pieces visible · {quiz?.mode==='find'?'Drag to pan':'Drag to orbit'} · Scroll to zoom</div>
 </div>
 {progress<100&&!error&&<div className="loading glass" role="status">Preparing anatomy · {progress}%</div>}{error&&<div className="loading glass error" role="alert"><p>{error}</p><Button onClick={onExit}>Return to explorer</Button></div>}
 </main>;
}
