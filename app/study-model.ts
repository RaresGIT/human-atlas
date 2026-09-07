import type {Atlas, Concept, Part, SceneState} from './anatomy';

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

export function studyFrameKey(state:Pick<SceneState,'study'|'scope'|'focus'|'inspectorOpen'>):string{
  return state.study||state.focus?JSON.stringify([state.scope,state.focus,state.inspectorOpen]):'';
}

/** The same reserved area is used for camera fitting and projected labels. */
export function studyViewport(width:number,height:number){
  if(width>height&&height<=600)return {left:310,right:width-16,top:85,bottom:height-70};
  if(width<768)return {left:16,right:width-16,top:140,bottom:height*.55-45};
  return {left:370,right:width-20,top:100,bottom:height-100};
}
