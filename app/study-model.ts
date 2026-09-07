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
