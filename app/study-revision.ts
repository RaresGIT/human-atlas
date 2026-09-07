export interface RevisionItem {id:string;mistakes:number;attempts?:number;correct?:number;streak?:number;dueAt?:number;lastReviewed?:number}
export const REVISION_KEY='human-atlas.revision.v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
const storageWarning='Browser storage is unavailable. Revision is kept for this session only.';

export function recordMistake(items:readonly RevisionItem[],id:string):RevisionItem[]{
  if(items.find(item=>item.id===id)?.attempts!==undefined)return recordReview(items,id,false);
  return items.some(item=>item.id===id)?items.map(item=>item.id===id?{...item,mistakes:Math.min(1_000_000,item.mistakes+1)}:item):[...items,{id,mistakes:1}];
}
export function parseRevision(raw:string|null,validIds:ReadonlySet<string>):{items:RevisionItem[];warning:string}{
  if(!raw)return {items:[],warning:''};
  try{
    const data:unknown=JSON.parse(raw);
    if(!data||typeof data!=='object'||!('version' in data)||(data.version!==1&&data.version!==2)||!('items' in data)||!Array.isArray(data.items))throw new Error('Unsupported revision data');
    const items=new Map<string,RevisionItem>();
    for(const item of data.items){
      if(!item||typeof item!=='object'||typeof item.id!=='string'||!validIds.has(item.id)||!Number.isSafeInteger(item.mistakes)||item.mistakes<0||item.mistakes>1_000_000)continue;
      const next:RevisionItem={id:item.id,mistakes:item.mistakes};
      if('attempts' in item){
        if(!['attempts','correct','streak','dueAt','lastReviewed'].every(key=>Number.isSafeInteger(item[key])&&item[key]>=0)||item.attempts>1_000_000||item.correct>item.attempts||item.streak>item.correct||item.mistakes>item.attempts||item.dueAt>8_640_000_000_000_000||item.lastReviewed>8_640_000_000_000_000)continue;
        Object.assign(next,{attempts:item.attempts,correct:item.correct,streak:item.streak,dueAt:item.dueAt,lastReviewed:item.lastReviewed});
      }else if(item.mistakes===0)continue;
      const previous=items.get(item.id);
      if(!previous||(next.lastReviewed??0)>(previous.lastReviewed??0)||(!(next.lastReviewed)&&!(previous.lastReviewed)&&next.mistakes>previous.mistakes))items.set(item.id,next);
    }
    return {items:[...items.values()],warning:''};
  }catch{return {items:[],warning:'Saved revision data could not be read. A new revision set has been started.'};}
}
export function readRevision(storage:StoragePort,validIds:ReadonlySet<string>){
  try{return parseRevision(storage.getItem(REVISION_KEY),validIds);}catch{return {items:[] as RevisionItem[],warning:storageWarning};}
}
export function saveRevision(storage:StoragePort,items:readonly RevisionItem[]):string{
  try{storage.setItem(REVISION_KEY,exportRevision(items));return '';}catch{return storageWarning;}
}

const DAY=24*60*60*1000;
/** A transparent local study schedule, not a mastery assessment. */
export function recordReview(items:readonly RevisionItem[],id:string,correct:boolean,now=Date.now()):RevisionItem[]{
  const previous=items.find(item=>item.id===id),streak=correct?Math.min(1_000_000,(previous?.streak??0)+1):0;
  const interval=correct?([1,3,7,14,30][Math.min(streak-1,4)]*DAY):10*60*1000;
  const next:RevisionItem={id,mistakes:Math.min(1_000_000,(previous?.mistakes??0)+(correct?0:1)),attempts:Math.min(1_000_000,(previous?.attempts??previous?.mistakes??0)+1),correct:Math.min(1_000_000,(previous?.correct??0)+(correct?1:0)),streak,dueAt:now+interval,lastReviewed:now};
  return previous?items.map(item=>item.id===id?next:item):[...items,next];
}
export function dueRevision(items:readonly RevisionItem[],now=Date.now()):RevisionItem[]{return items.filter(item=>(item.dueAt??0)<=now);}
export function exportRevision(items:readonly RevisionItem[]):string{return JSON.stringify({version:2,items},null,2);}
export function mergeRevision(current:readonly RevisionItem[],raw:string,validIds:ReadonlySet<string>):{items:RevisionItem[];warning:string}{
  if(raw.length>2_000_000)return {items:[...current],warning:'Revision file is too large.'};
  const parsed=parseRevision(raw,validIds);
  if(parsed.warning)return {items:[...current],warning:'Revision file could not be imported. Your existing reviews are unchanged.'};
  const merged=new Map(current.map(item=>[item.id,item]));
  for(const item of parsed.items){const previous=merged.get(item.id);if(!previous||(item.lastReviewed??0)>(previous.lastReviewed??0)||(!(item.lastReviewed)&&!(previous.lastReviewed)&&item.mistakes>previous.mistakes))merged.set(item.id,item);}
  return {items:[...merged.values()],warning:''};
}
