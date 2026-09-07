import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CONTENT,LESSONS,contentForConcept,lessonScene} from '../app/anatomy-content.ts';
import {REGIONS} from '../app/study-regions.ts';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const concepts=new Map(atlas.concepts.map(c=>[c.id,c]));
const parts=new Set(atlas.parts.map(p=>p.id));
assert.equal(new Set(CONTENT.map(c=>c.id)).size,CONTENT.length);
for(const card of CONTENT){
 assert.equal(concepts.get(card.id)?.name,card.name,`Catalog name changed: ${card.id}`);
 assert(card.facts.length>=2&&card.sources.length);
 for(const source of card.sources)assert(['openstax.org','www.ncbi.nlm.nih.gov'].includes(new URL(source.url).hostname));
 assert.equal(contentForConcept(concepts.get(card.id),atlas)?.broader,false);
}
assert.equal(contentForConcept({id:'missing',name:'missing',elements:[]},atlas),undefined);
const rightKidney=concepts.get('FMA7204');
assert.equal(contentForConcept(rightKidney,atlas)?.entry.id,'FMA7203');
assert.equal(contentForConcept(rightKidney,atlas)?.broader,true);
for(const lesson of LESSONS){
 const region=REGIONS.find(r=>r.id===lesson.region);assert(region);
 const scope=new Set(region.conceptIds.flatMap(id=>concepts.get(id).elements));
 assert(lesson.steps.length>=3&&lesson.practice.length>=3);
 for(const id of [...lesson.practice,...lesson.focus])assert(concepts.has(id),id);
 let previous;
 for(const step of lesson.steps){
  assert(step.sources.length&&step.text.length>40);
  for(const id of [...step.selected,...step.hidden])assert(concepts.has(id),id);
  const scene=lessonScene(atlas,lesson,step);
  assert(scene.selected.length&&scene.focus.length&&scene.hidden.length);
  for(const id of [...scene.selected,...scene.hidden,...scene.focus]){assert(parts.has(id),id);assert(scope.has(id),`Outside ${lesson.region}: ${id}`);}
  assert(scene.selected.every(id=>!scene.hidden.includes(id)));
  if(previous)assert.deepEqual(scene.focus,previous.focus,'Camera frame should be stable between steps');
  previous=scene;
 }
 for(const id of lesson.practice)assert(concepts.get(id).elements.every(p=>scope.has(p)),`Practice outside region: ${id}`);
}
console.log(`Validated ${CONTENT.length} sourced cards and ${LESSONS.length} guided lessons: exact catalog names, source domains, parent context, mesh IDs, regional scope and stable focus.`);
