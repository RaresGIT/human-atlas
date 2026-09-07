import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {matchesName,matchesPiece,questionCandidates,createQuiz,answerQuiz,nextQuestion,quizScene} from '../app/study-quiz.ts';
import {REGIONS,regionConcepts,isPartVisible} from '../app/study-model.ts';
const atlas=JSON.parse(await readFile(new URL('../public/models/atlas.json',import.meta.url)));
const heart=atlas.concepts.find(c=>c.name==='heart');
assert.ok(matchesName(heart,'  HEART '));
assert.ok(!matchesName(heart,'lung'));
assert.ok(!matchesName(heart,''));
assert.ok(matchesName({name:'short head of biceps brachii'},'Short   head of BICEPS brachii.'));
for(const id of heart.elements)assert.ok(matchesPiece(heart,id),'Any concept member accepted');
assert.ok(!matchesPiece(heart,'missing'));
for(const r of REGIONS){
 const pool=regionConcepts(atlas,r.id);
 for(const target of pool){
  const candidates=questionCandidates(pool,target,()=>.5);
  assert.ok(candidates.some(c=>c.id===target.id));
  const ids=candidates.flatMap(c=>c.elements);
  assert.equal(ids.length,new Set(ids).size,'Find candidates must not overlap');
 }
 const quiz=createQuiz(pool,'find',()=>.5),target=quiz.questions[0].target;
 const base={visible:[],selected:[],hidden:target.elements,labels:[target],labelsVisible:true,isolate:true,explode:0,view:'back',rotate:true,reset:0};
 const scene=quizScene(base,quiz,atlas);
 assert.ok(scene.hideNames);
 assert.equal(scene.labelsVisible,false);
 assert.deepEqual(scene.selected,[],'Finding must not highlight the answer');
 for(const id of target.elements)assert.ok(isPartVisible(atlas.parts.find(p=>p.id===id),scene),'Target is available despite prior hidden layers');
 const wrong=answerQuiz(quiz,false);
 assert.equal(wrong.correct,0);
 assert.equal(wrong.feedback.correct,false);
 assert.equal(answerQuiz(wrong,true),wrong,'Cannot score a question twice');
 assert.equal(nextQuestion(quiz),quiz,'Cannot advance without answering');
 const next=nextQuestion(wrong);
 assert.equal(next.index,1);
 assert.equal(next.feedback,null);
 let finish=createQuiz([target],'name');
 finish=nextQuestion(answerQuiz(finish,true));
 assert.equal(finish.index,1);
 assert.equal(finish.correct,1);
 assert.throws(()=>createQuiz([],'name'));
 const nameScene=quizScene(base,createQuiz([target],'name'),atlas);
 assert.deepEqual(nameScene.selected,target.elements);
 assert.deepEqual(nameScene.scope,target.elements);
}
console.log('Quiz names, member selection, disjoint candidates, scoring, and answer concealment passed.');
