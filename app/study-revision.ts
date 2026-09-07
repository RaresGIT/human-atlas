export interface RevisionItem {id:string;mistakes:number}
export const REVISION_KEY='human-atlas.revision.v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
const storageWarning='Browser storage is unavailable. Revision is kept for this session only.';

export function recordMistake(items:readonly RevisionItem[],id:string):RevisionItem[]{
  return items.some(item=>item.id===id)?items.map(item=>item.id===id?{...item,mistakes:Math.min(1_000_000,item.mistakes+1)}:item):[...items,{id,mistakes:1}];
}
export function parseRevision(raw:string|null,validIds:ReadonlySet<string>):{items:RevisionItem[];warning:string}{
  if(!raw)return {items:[],warning:''};
  try{
    const data:unknown=JSON.parse(raw);
    if(!data||typeof data!=='object'||!('version' in data)||data.version!==1||!('items' in data)||!Array.isArray(data.items))throw new Error('Unsupported revision data');
    const items=new Map<string,RevisionItem>();
    for(const item of data.items){
      if(!item||typeof item!=='object'||typeof item.id!=='string'||!validIds.has(item.id)||!Number.isSafeInteger(item.mistakes)||item.mistakes<1||item.mistakes>1_000_000)continue;
      items.set(item.id,{id:item.id,mistakes:Math.max(items.get(item.id)?.mistakes??0,item.mistakes)});
    }
    return {items:[...items.values()],warning:''};
  }catch{return {items:[],warning:'Saved revision data could not be read. A new revision set has been started.'};}
}
export function readRevision(storage:StoragePort,validIds:ReadonlySet<string>){
  try{return parseRevision(storage.getItem(REVISION_KEY),validIds);}catch{return {items:[] as RevisionItem[],warning:storageWarning};}
}
export function saveRevision(storage:StoragePort,items:readonly RevisionItem[]):string{
  try{storage.setItem(REVISION_KEY,JSON.stringify({version:1,items}));return '';}catch{return storageWarning;}
}
