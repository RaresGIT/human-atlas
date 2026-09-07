import type {Atlas,Concept,SceneState} from './anatomy';

export type QuizMode='name'|'find';
export interface QuizQuestion {target:Concept;candidates:Concept[]}
export interface QuizSession {
  mode:QuizMode;questions:QuizQuestion[];index:number;correct:number;
  feedback:{correct:boolean;revealed:boolean}|null;
}
function normalize(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function matchesName(concept:Pick<Concept,'name'>,answer:string){return !!normalize(answer)&&normalize(concept.name)===normalize(answer);}
export function matchesPiece(concept:Concept,id:string){return concept.elements.includes(id);}
function shuffle<T>(items:readonly T[],random:()=>number):T[]{
  const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;
}
export function questionCandidates(pool:readonly Concept[],target:Concept,random:()=>number=Math.random):Concept[]{
  const used=new Set(target.elements),candidates=[target];
  for(const c of shuffle(pool,random)){
    if(c.id===target.id||c.elements.some(id=>used.has(id)))continue;
    candidates.push(c);c.elements.forEach(id=>used.add(id));if(candidates.length===4)break;
  }
  return shuffle(candidates,random);
}
export function createQuiz(pool:readonly Concept[],mode:QuizMode,random:()=>number=Math.random):QuizSession{
  if(!pool.length)throw new Error('Choose at least one structure to practice.');
  const unique=[...new Map(pool.map(c=>[c.id,c])).values()];
  return {mode,questions:shuffle(unique,random).map(target=>({target,candidates:questionCandidates(unique,target,random)})),index:0,correct:0,feedback:null};
}
export function answerQuiz(quiz:QuizSession,correct:boolean,revealed=false):QuizSession{
  if(quiz.feedback||quiz.index>=quiz.questions.length)return quiz;
  return {...quiz,correct:quiz.correct+(correct&&!revealed?1:0),feedback:{correct:correct&&!revealed,revealed}};
}
export function nextQuestion(quiz:QuizSession):QuizSession{
  return quiz.feedback?{...quiz,index:quiz.index+1,feedback:null}:quiz;
}
export function quizScene(base:SceneState,quiz:QuizSession,atlas:Atlas):SceneState{
  const question=quiz.questions[Math.min(quiz.index,quiz.questions.length-1)];
  const ids=quiz.mode==='name'?question.target.elements:[...new Set(question.candidates.flatMap(c=>c.elements))];
  return {...base,scope:ids,focus:quiz.mode==='name'?ids:undefined,hidden:[],visible:[...new Set(atlas.parts.map(p=>p.system))],
    selected:quiz.mode==='name'||quiz.feedback?question.target.elements:[],
    isolate:false,explode:quiz.mode==='find'?1:0,view:quiz.mode==='find'?'front':base.view,rotate:false,inventoryGroups:quiz.mode==='find'?question.candidates:undefined,
    labels:[],labelsVisible:false,hideNames:true,reset:base.reset+quiz.index+1};
}
