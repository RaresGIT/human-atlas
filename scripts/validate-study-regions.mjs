import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REGIONS,REGION_GROUPS} from '../app/study-regions.ts';

const atlas=JSON.parse(await readFile(new URL('../public/models/atlas.json',import.meta.url)));
const concepts=new Map(atlas.concepts.map(concept=>[concept.id,concept]));
const parts=new Map(atlas.parts.map(part=>[part.id,part]));
const ids=new Set(REGIONS.map(region=>region.id));
assert.equal(ids.size,REGIONS.length,'Region IDs must be unique');
assert.equal(REGION_GROUPS.length,7,'Seven major anatomical groups');
assert.ok(REGIONS.length>=30,'Focused study should cover the whole body');
for(const id of ['upper-limb','thorax','head-neck']){
  assert.ok(REGIONS.find(region=>region.id===id)?.overview,`${id}: existing overview remains available`);
}
const allConcepts=new Set(),allParts=new Set();
for(const region of REGIONS){
  assert.ok(REGION_GROUPS.some(group=>group.id===region.group),`${region.id}: valid group`);
  assert.equal(new Set(region.conceptIds).size,region.conceptIds.length,`${region.id}: unique concepts`);
  const members=new Set();
  for(const id of region.conceptIds){
    const concept=concepts.get(id);
    assert.ok(concept,`${region.id}: ${id} must exist in the bundled atlas`);
    assert.ok(concept.elements.length,`${region.id}: ${id} must contain meshes`);
    allConcepts.add(id);
    for(const element of concept.elements){
      assert.ok(parts.has(element),`${region.id}: ${element} must be renderable`);
      members.add(element);allParts.add(element);
    }
  }
  if(region.id==='external-ear'){
    assert.equal(members.size,1,'The atlas supplies only one external-ear mesh');
    assert.ok(region.coverageNote,'Sparse anatomy needs a visible coverage note');
  }else{
    assert.ok(members.size>5,`${region.id}: useful mesh coverage`);
    assert.ok(new Set([...members].map(id=>parts.get(id).system)).size>=2,`${region.id}: useful cross-system context`);
  }
}
for(const group of REGION_GROUPS){
  const entries=REGIONS.filter(region=>region.group===group.id);
  const overviews=entries.filter(region=>region.overview);
  assert.equal(overviews.length,1,`${group.id}: one overview`);
  const children=entries.filter(region=>!region.overview);
  assert.ok(children.length>=2,`${group.id}: focused subdivisions`);
  assert.deepEqual(new Set(overviews[0].conceptIds),new Set(children.flatMap(region=>region.conceptIds)),`${group.id}: overview exactly unions its subdivisions`);
}
console.log(`Study regions passed: ${REGIONS.length} entries in ${REGION_GROUPS.length} groups; ${allConcepts.size} atlas concepts, ${allParts.size} unique meshes.`);
