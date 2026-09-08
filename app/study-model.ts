import type {Atlas, Concept, Part, SceneState, StudyLayout} from './anatomy';

import {REGIONS} from './study-regions.ts';
export {REGIONS,REGION_GROUPS} from './study-regions.ts';
export type {RegionId} from './study-regions.ts';

export function regionConcepts(atlas:Atlas, regionId:string):Concept[]{
  const region=REGIONS.find(r=>r.id===regionId);
  return region?region.conceptIds.map(id=>atlas.concepts.find(c=>c.id===id)).filter((c):c is Concept=>!!c):[];
}

/** Saved concepts may now sit inside a broader catalog concept. */
export function regionForConcept(atlas:Atlas,concept:Concept){
  const focused=REGIONS.filter(r=>!r.overview);
  return focused.find(r=>r.conceptIds.includes(concept.id))??focused.find(r=>{
    const pieces=new Set(conceptPieces(regionConcepts(atlas,r.id)));
    return concept.elements.length>0&&concept.elements.every(id=>pieces.has(id));
  });
}

export function conceptPieces(concepts:readonly Concept[]):string[]{
  return [...new Set(concepts.flatMap(c=>c.elements))];
}

export function isPartVisible(part:Part,state:Pick<SceneState,'visible'|'selected'|'isolate'|'scope'|'hidden'>){
  if(state.scope&&!state.scope.includes(part.id))return false;
  if(state.hidden?.includes(part.id))return false;
  return state.isolate?state.selected.includes(part.id):state.visible.includes(part.system)||state.selected.includes(part.id);
}

export function hiddenPieces(history:readonly string[][]):string[]{return [...new Set(history.flat())];}
export function hidePieces(history:readonly string[][],ids:readonly string[]):string[][]{
  const hidden=new Set(hiddenPieces(history)),added=[...new Set(ids)].filter(id=>!hidden.has(id));
  return added.length?[...history,added]:[...history];
}
export function undoHide(history:readonly string[][]):string[][]{return history.slice(0,-1);}

export function revealPieces(history:readonly string[][],ids:readonly string[]):string[][]{
  const revealed=new Set(ids);return history.map(action=>action.filter(id=>!revealed.has(id))).filter(action=>action.length>0);
}

export function leaveIsolation<T extends Pick<SceneState,'isolate'|'focus'>>(state:T):T{
  return {...state,isolate:false,focus:undefined};
}

export function studyFrameKey(state:Pick<SceneState,'study'|'scope'|'focus'|'inspectorOpen'|'studyLayout'>):string{
  return state.study||state.focus?JSON.stringify([state.scope,state.focus,state.inspectorOpen,state.studyLayout]):'';
}

/** The same reserved area is used for camera fitting and projected labels. */
export function studyViewport(width:number,height:number,layout?:StudyLayout){
  const sheet=layout?.sheet??'half';
  if(width>height&&height<=600)return {left:sheet==='collapsed'?16:318,right:width-76,top:104,bottom:Math.max(184,height-100)};
  if(width<768){
    const reserved=sheet==='collapsed'?64:Math.min(height*.44,420);
    return {left:16,right:width-76,top:148,bottom:Math.max(228,height-reserved-32)};
  }
  return {left:layout?.panel==='wide'?472:336,right:width-(layout?.inspector&&width>=1100?392:80),top:width<1100?140:96,bottom:height-130};
}
