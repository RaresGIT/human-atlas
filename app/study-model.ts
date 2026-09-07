import type {Atlas, Concept, Part, SceneState} from './anatomy';

export const REGIONS = [
  {id:'upper-limb',name:'Upper limb',conceptIds:[
    'FMA13303','FMA23463','FMA23466','FMA13394','FMA13321',
    'FMA37682','FMA37683','FMA37692','FMA37693','FMA37694','FMA37667',
    'FMA22689','FMA22730','FMA22796','FMA13324','FMA22908',
  ]},
  {id:'thorax',name:'Thorax',conceptIds:[
    'FMA7088','FMA7309','FMA7310','FMA7485','FMA7574','FMA9139',
    'FMA13295','FMA7394','FMA7131','FMA3736','FMA3768','FMA87217','FMA4720',
  ]},
  {id:'head-neck',name:'Head and neck',conceptIds:[
    'FMA50801','FMA52748','FMA9711','FMA52749','FMA13407',
    'FMA3939','FMA4724','FMA13341','FMA13343','FMA13344','FMA9625',
  ]},
] as const;
export type RegionId = typeof REGIONS[number]['id'];

export function regionConcepts(atlas:Atlas, regionId:string):Concept[]{
  const region=REGIONS.find(r=>r.id===regionId);
  return region?region.conceptIds.map(id=>atlas.concepts.find(c=>c.id===id)).filter((c):c is Concept=>!!c):[];
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

/** The same reserved area is used for camera fitting and projected labels. */
export function studyViewport(width:number,height:number){
  if(width>height&&height<=600)return {left:310,right:width-16,top:85,bottom:height-70};
  if(width<768)return {left:16,right:width-16,top:140,bottom:height*.55-45};
  return {left:370,right:width-20,top:100,bottom:height-100};
}
