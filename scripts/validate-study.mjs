import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REGIONS, regionForConcept, regionConcepts, conceptPieces, isPartVisible, hidePieces, hiddenPieces, undoHide, studyViewport, studyFrameKey, leaveIsolation} from '../app/study-model.ts';

const atlas=JSON.parse(await readFile(new URL('../public/models/atlas.json',import.meta.url)));
for(const region of REGIONS){
  const concepts=regionConcepts(atlas,region.id);
  assert.equal(concepts.length,region.conceptIds.length,`${region.name}: missing concept`);
  assert.equal(new Set(concepts.map(c=>c.id)).size,concepts.length);
  const ids=conceptPieces(concepts);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.length>0);
  const parts=atlas.parts.filter(p=>ids.includes(p.id));
  assert.ok(parts.every(p=>p.system),`${region.name}: pieces have systems`);
  assert.equal(parts.length,ids.length,'All regional pieces exist');
}
const part=atlas.parts[0];
const state={visible:[part.system],selected:[],isolate:false};
assert.equal(isPartVisible(part,state),true);
assert.equal(isPartVisible(part,{...state,scope:[]}),false);
assert.equal(isPartVisible(part,{...state,scope:[part.id]}),true);
assert.equal(isPartVisible(part,{...state,hidden:[part.id],selected:[part.id]}),false,'Hidden overrides selection');
assert.equal(isPartVisible(part,{...state,scope:[],selected:[part.id]}),false,'Selection cannot escape region');
assert.equal(isPartVisible(part,{...state,isolate:true}),false);
assert.equal(isPartVisible(part,{...state,isolate:true,selected:[part.id]}),true);
console.log('Regional collections and visibility precedence passed.');
let history=hidePieces([],['a','b']);
history=hidePieces(history,['b','c']);
assert.deepEqual(hiddenPieces(history),['a','b','c']);
assert.deepEqual(hiddenPieces(undoHide(history)),['a','b']);
assert.deepEqual(hiddenPieces(undoHide(undoHide(history))),[]);
assert.deepEqual(hidePieces(history,['a']),history,'No duplicate hide action');
assert.deepEqual(undoHide([]),[]);
for(const [w,h] of [[1280,800],[390,844],[320,568],[844,390]]){
  const r=studyViewport(w,h);
  assert.ok(r.left>=0&&r.top>=0&&r.right<=w&&r.bottom<=h);
  assert.ok(r.right-r.left>=100&&r.bottom-r.top>=80,'Usable anatomy viewport');
}
console.log('Hide/undo history and study viewport passed.');
const regional={...state,study:true,scope:['a','b'],focus:undefined};
assert.notEqual(studyFrameKey(regional),studyFrameKey({...regional,scope:['a']}),'Returning from question must refit despite identical reset counter');
assert.notEqual(studyFrameKey(regional),studyFrameKey({...regional,focus:['a']}),'Focus changes invalidate framing');
assert.equal(studyFrameKey(regional),studyFrameKey({...regional,selected:['b']}),'Ordinary selection preserves framing');
assert.equal(leaveIsolation({...regional,isolate:true,focus:['a']}).focus,undefined);
assert.equal(leaveIsolation({...regional,isolate:true,focus:['a']}).isolate,false);
console.log('Study camera transition invalidation passed.');

for(const id of ["FMA9625","FMA13341","FMA37682"]){
 const concept=atlas.concepts.find(c=>c.id===id);
 const region=regionForConcept(atlas,concept);
 assert.ok(region,`${id}: legacy revision resolves to regional membership`);
 assert.ok(concept.elements.every(id=>conceptPieces(regionConcepts(atlas,region.id)).includes(id)));
}
console.log("Legacy revision regional membership passed.");
