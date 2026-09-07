import type {Atlas,Concept,SceneState,SystemId} from './anatomy';
import {REGIONS,REGION_GROUPS} from './study-regions.ts';
export type Side='both'|'left'|'right';
export interface Workspace {version:1;region:string;side:Side;scene:SceneState;selection:Concept|null}
export interface StudySet {id:string;name:string;conceptIds:string[]}
export interface SavedScene {id:string;name:string;workspace:Workspace}
export interface Library {version:1;sets:StudySet[];scenes:SavedScene[]}
export const WORKSPACE_KEY='human-atlas.workspace.v1',LIBRARY_KEY='human-atlas.library.v1';
const cache=new WeakMap<Atlas,ReturnType<typeof buildIndex>>();
function buildIndex(atlas:Atlas){
 const parts=new Map(atlas.parts.map(p=>[p.id,p]));const concepts=new Map(atlas.concepts.map(c=>[c.id,c]));
 const regions=new Map(REGIONS.map(r=>[r.id as string,r.conceptIds.map(id=>concepts.get(id)).filter((c):c is Concept=>!!c)]));
 const pieces=new Map([...regions].map(([id,cs])=>[id,new Set(cs.flatMap(c=>c.elements))]));
 const systems=new Map(atlas.concepts.map(c=>[c.id,new Set(c.elements.map(id=>parts.get(id)?.system))]));
 const laterality=new Map(atlas.parts.map(p=>[p.id,/\bleft\b/i.test(p.name)?'left':/\bright\b/i.test(p.name)?'right':'central']));
 const names=new Map(atlas.concepts.map(c=>[c.id,`${c.name} ${c.id}`.toLowerCase()]));
 return {parts,concepts,regions,pieces,systems,names,laterality};
}
export function atlasIndex(atlas:Atlas){let index=cache.get(atlas);if(!index){index=buildIndex(atlas);cache.set(atlas,index);}return index;}
export function sidePieces(atlas:Atlas,ids:readonly string[],side:Side):string[]{
 if(side==='both')return [...ids];const {parts,laterality}=atlasIndex(atlas),opposite=side==='left'?'right':'left';
 return ids.filter(id=>{const p=parts.get(id);return p&&laterality.get(id)!==opposite;});
}
export function regionFor(atlas:Atlas,concept:Concept):string|undefined{
 const index=atlasIndex(atlas);return REGIONS.find(r=>!r.overview&&r.conceptIds.includes(concept.id))?.id??REGIONS.find(r=>!r.overview&&concept.elements.every(id=>index.pieces.get(r.id)?.has(id)))?.id;
}
export function searchConcepts(atlas:Atlas,pool:readonly Concept[],query:string,system:string,side:Side):Concept[]{
 const index=atlasIndex(atlas),terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return pool.filter(c=>terms.every(t=>(index.names.get(c.id)??c.name.toLowerCase()).includes(t))&&(system==='all'||index.systems.get(c.id)?.has(system as SystemId))&&sidePieces(atlas,c.elements,side).length>0);
}
export function createWorkspace(atlas:Atlas,region:string):Workspace{
 const r=REGIONS.find(r=>r.id===region)??REGIONS.find(r=>r.id==='upper-limb')!;
 return {version:1,region:r.id,side:'both',selection:null,scene:{study:true,scope:[...atlasIndex(atlas).pieces.get(r.id)!],selected:[],visible:[...new Set(atlas.parts.map(p=>p.system))],isolate:false,explode:0,view:r.view,rotate:false,reset:0}};
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function ids(value:unknown,valid:ReadonlyMap<string,unknown>|ReadonlySet<string>,limit=5000):string[]{return Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string'&&valid.has(v)))].slice(0,limit):[];}
const vector=(v:unknown):v is [number,number,number]=>Array.isArray(v)&&v.length===3&&v.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=100);
export function parseWorkspace(atlas:Atlas,raw:string):Workspace|null{
 if(raw.length>250000)return null;
 try{
 const v:unknown=JSON.parse(raw);if(!object(v)||v.version!==1||!REGIONS.some(r=>r.id===v.region)||!object(v.scene))return null;
 const result=createWorkspace(atlas,v.region as string),s=v.scene,index=atlasIndex(atlas),allSystems=new Set(atlas.parts.map(p=>p.system));
 result.side=v.side==='left'||v.side==='right'?v.side:'both';
 const scope=Array.isArray(s.scope)?ids(s.scope,index.parts):result.scene.scope!;const allowed=new Set(scope);
 result.scene={...result.scene,scope,visible:ids(s.visible,allSystems) as SystemId[],selected:ids(s.selected,allowed),hidden:ids(s.hidden,allowed),isolate:s.isolate===true,view:['front','back','side','three-quarter'].includes(String(s.view))?s.view as SceneState['view']:result.scene.view,
 explode:typeof s.explode==='number'&&Number.isFinite(s.explode)?Math.min(1,Math.max(0,s.explode)):0,focus:Array.isArray(s.focus)?ids(s.focus,allowed):undefined,labelsVisible:s.labelsVisible===true};
 result.scene.labels=Array.isArray(s.labels)?s.labels.slice(0,6).flatMap(label=>{
 if(!object(label)||typeof label.id!=='string')return [];const c=index.concepts.get(label.id);if(!c)return [];const elements=ids(label.elements,new Set(c.elements)).filter(id=>allowed.has(id));return elements.length?[{...c,elements}]:[];
 }):[];
 if(object(s.camera)&&vector(s.camera.position)&&vector(s.camera.target)&&Math.hypot(...s.camera.position.map((n,i)=>n-(s.camera as {target:number[]}).target[i]))>.005)result.scene.camera={position:s.camera.position,target:s.camera.target};
 if(result.scene.camera&&object(s.camera)&&object(s.camera.viewOffset)){
  const o=s.camera.viewOffset,positive=['fullWidth','fullHeight','width','height'],offset=['offsetX','offsetY'];
  if(positive.every(k=>typeof o[k]==='number'&&Number.isFinite(o[k])&&(o[k] as number)>0&&(o[k] as number)<=100000)&&offset.every(k=>typeof o[k]==='number'&&Number.isFinite(o[k])&&Math.abs(o[k] as number)<=100000))result.scene.camera.viewOffset={fullWidth:o.fullWidth as number,fullHeight:o.fullHeight as number,width:o.width as number,height:o.height as number,offsetX:o.offsetX as number,offsetY:o.offsetY as number};
 }
 if(['solid','outline','xray'].includes(String(s.selectionStyle)))result.scene.selectionStyle=s.selectionStyle as SceneState['selectionStyle'];
 if(typeof s.contextOpacity==='number'&&Number.isFinite(s.contextOpacity))result.scene.contextOpacity=Math.min(1,Math.max(.05,s.contextOpacity));
 if(object(s.cutaway)&&['x','y','z'].includes(String(s.cutaway.axis))&&typeof s.cutaway.position==='number'&&Number.isFinite(s.cutaway.position))result.scene.cutaway={axis:s.cutaway.axis as 'x'|'y'|'z',position:Math.min(1,Math.max(0,s.cutaway.position)),invert:s.cutaway.invert===true};
 if(v.selection!==null&&result.scene.selected.length){const c=object(v.selection)&&typeof v.selection.id==='string'?index.concepts.get(v.selection.id):undefined;const p=index.parts.get(result.scene.selected[0]);const matching=c&&result.scene.selected.every(id=>c.elements.includes(id));result.selection=matching?{...c,elements:result.scene.selected}:p&&result.scene.selected.length===1?{id:p.conceptId,name:p.name,elements:result.scene.selected}:null;}
 return result;
 }catch{return null;}
}
export function encodeScene(workspace:Workspace){return '#scene='+encodeURIComponent(JSON.stringify(workspace));}
export function decodeScene(atlas:Atlas,hash:string){try{return hash.startsWith('#scene=')?parseWorkspace(atlas,decodeURIComponent(hash.slice(7))):null;}catch{return null;}}
export function parseLibrary(atlas:Atlas,raw:string):Library{
 if(raw.length>2000000)throw Error('File is too large (maximum 2 MB).');
 const v:unknown=JSON.parse(raw);if(!object(v)||v.version!==1||!Array.isArray(v.sets)||!Array.isArray(v.scenes)||v.sets.length>50||v.scenes.length>30)throw Error('Choose a valid study library export (up to 50 sets and 30 scenes).');
 const index=atlasIndex(atlas),name=(x:unknown)=>typeof x==='string'&&x.trim().length>0&&x.length<=80;
 const sets=v.sets.map(x=>{if(!object(x)||!name(x.id)||!name(x.name)||!Array.isArray(x.conceptIds)||x.conceptIds.length>500||x.conceptIds.some(id=>typeof id!=='string'||!index.concepts.has(id)))throw Error('Study set contains an unknown structure or invalid name.');return {id:x.id as string,name:x.name as string,conceptIds:ids(x.conceptIds,index.concepts,500)};});
 const scenes=v.scenes.map(x=>{if(!object(x)||!name(x.id)||!name(x.name))throw Error('Invalid saved scene.');const workspace=parseWorkspace(atlas,JSON.stringify(x.workspace));if(!workspace)throw Error('Invalid saved scene.');return {id:x.id as string,name:x.name as string,workspace};});
 if(new Set(sets.map(s=>s.id)).size!==sets.length||new Set(scenes.map(s=>s.id)).size!==scenes.length)throw Error('Duplicate set or scene identifiers.');
 return {version:1,sets,scenes};
}
export interface History<T>{past:T[];present:T;future:T[]}
export function addHistory<T>(history:History<T>,present:T):History<T>{return {past:[...history.past,history.present].slice(-40),present,future:[]};}
export function downloadText(name:string,text:string,type='application/json'){
 const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export {REGION_GROUPS};
