import {useCallback,useEffect,useRef,useState} from 'react';
import type {Atlas,SceneState} from './anatomy';
import {addHistory,createWorkspace,decodeScene,parseWorkspace,WORKSPACE_KEY,type Workspace,type History} from './workspace-model';
export function useWorkspace(atlas:Atlas){
 const [notice,setNotice]=useState('');
 const [history,setHistory]=useState<History<Workspace>>(()=>{
  let saved:Workspace|null=null;
  try{saved=decodeScene(atlas,location.hash)??parseWorkspace(atlas,localStorage.getItem(WORKSPACE_KEY)??'');}catch{}
  return {past:[],present:saved??createWorkspace(atlas,'upper-limb'),future:[]};
 });
 useEffect(()=>{if(decodeScene(atlas,location.hash))window.history.replaceState(null,'',location.pathname+location.search);},[atlas]);
 const current=history.present,latest=useRef(current);latest.current=current;
 const commit=useCallback((update:Workspace|((w:Workspace)=>Workspace),record=true)=>setHistory(h=>{
  const next=typeof update==='function'?update(h.present):update;
  return record?addHistory(h,next):{...h,present:next};
 }),[]);
 const scene=useCallback((update:(s:SceneState)=>SceneState,record=true)=>commit(w=>({...w,scene:update(w.scene)}),record),[commit]);
 const restore=useCallback((next:Workspace)=>commit(w=>({...next,scene:{...next.scene,reset:w.scene.reset+1,cameraRevision:(w.scene.cameraRevision??0)+1}})),[commit]);
 const move=useCallback((direction:'back'|'forward')=>setHistory(h=>{
  const source=direction==='back'?h.past:h.future;if(!source.length)return h;
  const next=direction==='back'?source[source.length-1]:source[0];
  const present={...next,scene:{...next.scene,reset:h.present.scene.reset+1,cameraRevision:(h.present.scene.cameraRevision??0)+1}};
  return direction==='back'?{past:h.past.slice(0,-1),present,future:[h.present,...h.future]}:{past:[...h.past,h.present].slice(-40),present,future:h.future.slice(1)};
 }),[]);
 useEffect(()=>{
  const write=()=>{try{localStorage.setItem(WORKSPACE_KEY,JSON.stringify(latest.current));}catch{setNotice('Workspace could not be saved. Export a scene to keep this view.');}};
  const timer=setTimeout(write,400);window.addEventListener('pagehide',write);
  return()=>{clearTimeout(timer);window.removeEventListener('pagehide',write);};
 },[current]);
 useEffect(()=>()=>{try{localStorage.setItem(WORKSPACE_KEY,JSON.stringify(latest.current));}catch{}},[]);
 return {workspace:current,commit,scene,restore,back:()=>move('back'),forward:()=>move('forward'),canBack:!!history.past.length,canForward:!!history.future.length,notice,setNotice};
}
