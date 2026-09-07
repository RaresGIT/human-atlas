import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REGIONS, regionConcepts, conceptPieces, isPartVisible} from '../app/study-model.ts';

const atlas=JSON.parse(await readFile(new URL('../public/models/atlas.json',import.meta.url)));
for(const region of REGIONS){
  const concepts=regionConcepts(atlas,region.id);
  assert.equal(concepts.length,region.conceptIds.length,`${region.name}: missing concept`);
  assert.equal(new Set(concepts.map(c=>c.id)).size,concepts.length);
  const ids=conceptPieces(concepts);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.length>5);
  const parts=atlas.parts.filter(p=>ids.includes(p.id));
  assert.ok(new Set(parts.map(p=>p.system)).size>=3,`${region.name}: should cross systems`);
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
