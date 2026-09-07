import {useCallback,useState} from 'react';
import type {Dispatch,SetStateAction} from 'react';
import type {SceneState} from './anatomy';
import {addHistory,type History} from './workspace-model';
export function useSceneHistory(initial:SceneState){
 const [history,setHistory]=useState<History<SceneState>>({past:[],present:initial,future:[]});
 const set:Dispatch<SetStateAction<SceneState>>=useCallback(update=>setHistory(h=>addHistory(h,typeof update==='function'?update(h.present):update)),[]);
 const replace:Dispatch<SetStateAction<SceneState>>=useCallback(update=>setHistory(h=>({...h,present:typeof update==='function'?update(h.present):update})),[]);
 const move=(forward:boolean)=>setHistory(h=>{
  const next=forward?h.future[0]:h.past[h.past.length-1];if(!next)return h;
  const present={...next,reset:h.present.reset+1,cameraRevision:(h.present.cameraRevision??0)+1};
  return forward?{past:[...h.past,h.present].slice(-40),present,future:h.future.slice(1)}:{past:h.past.slice(0,-1),present,future:[h.present,...h.future]};
 });
 return [history.present,set,{back:()=>move(false),forward:()=>move(true),canBack:!!history.past.length,canForward:!!history.future.length,replace}] as const;
}
