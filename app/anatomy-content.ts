import type {Atlas,Concept,View} from './anatomy';

export interface ContentSource {title:string;url:string}
export interface StructureContent {id:string;name:string;facts:{label:string;text:string}[];sources:ContentSource[]}
const book='https://openstax.org/books/anatomy-and-physiology-2e/pages/';
const source=(page:string,title:string):ContentSource=>({title:`OpenStax · ${title}`,url:book+page});
const muscles:ContentSource={title:'StatPearls / NCBI Bookshelf · Upper limb muscles',url:'https://www.ncbi.nlm.nih.gov/books/NBK482410/'};
const bones=source('8-2-bones-of-the-upper-limb','Bones of the upper limb');
const vessels=source('20-5-circulatory-pathways','Circulatory pathways');
const heart=source('19-1-heart-anatomy','Heart anatomy');
const lungs=source('22-2-the-lungs','The lungs');
const airway=source('22-1-organs-and-structures-of-the-respiratory-system','Respiratory structures');
const kidney=source('25-3-gross-anatomy-of-the-kidney','Gross anatomy of the kidney');
const urine=source('25-2-gross-anatomy-of-urine-transport','Urine transport');
const digestion=source('23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder','Accessory digestive organs');
const stomach=source('23-4-the-stomach','The stomach');
const card=(id:string,name:string,ref:ContentSource,rows:[string,string][]):StructureContent=>({id,name,sources:[ref],facts:rows.map(([label,text])=>({label,text}))});
/** Deliberately finite coverage. References support text, not inferred mesh proximity. */
export const CONTENT:readonly StructureContent[]=[
 card('FMA37682','short head of biceps brachii',muscles,[['Origin','Scapular coracoid process.'],['Insertion','Radial tuberosity and forearm fascia via the bicipital aponeurosis.'],['Action','Elbow flexion and forearm supination.'],['Innervation','Musculocutaneous nerve.']]),
 card('FMA37683','long head of biceps brachii',muscles,[['Origin','Supraglenoid tubercle of the scapula.'],['Insertion','Radial tuberosity and bicipital aponeurosis.'],['Action','Elbow flexion and forearm supination.'],['Innervation','Musculocutaneous nerve.']]),
 card('FMA37692','long head of triceps brachii',muscles,[['Origin','Infraglenoid tubercle of the scapula.'],['Insertion','Olecranon of the ulna.'],['Action','Elbow extension.'],['Innervation','Radial nerve.']]),
 card('FMA34676','zone of deltoid',muscles,[['Origin','Lateral clavicle, acromion and scapular spine.'],['Insertion','Deltoid tuberosity of the humerus.'],['Action','Middle fibers abduct; anterior fibers flex and medially rotate; posterior fibers extend and laterally rotate the arm.'],['Innervation','Axillary nerve.']]),
 card('FMA13303','humerus',bones,[['Articulations','The head meets the scapular glenoid. Distally, the capitulum meets the radius and the trochlea meets the ulna.'],['Landmark','The deltoid tuberosity is a muscle attachment on the shaft.']]),
 card('FMA23463','radius',bones,[['Position','Lateral forearm bone in anatomical position, on the thumb side.'],['Articulations','Meets the humeral capitulum, the ulna, and the scaphoid and lunate at the wrist.']]),
 card('FMA23466','ulna',bones,[['Position','Medial forearm bone in anatomical position.'],['Landmarks','The trochlear notch meets the humerus; the olecranon forms the bony tip of the elbow.']]),
 card('FMA3736','ascending aorta',vessels,[['Origin','Leaves the left ventricle through the aortic valve.'],['Branches','The right and left coronary arteries arise near its root.']]),
 card('FMA3768','arch of aorta',vessels,[['Continuity','Connects ascending and descending aorta.'],['Typical branches','Brachiocephalic trunk, left common carotid and left subclavian arteries.']]),
 card('FMA22689','brachial artery',vessels,[['Origin','Continuation of the axillary artery in the arm.'],['Branches','Gives deep brachial and collateral branches; ends as radial and ulnar arteries near the elbow.']]),
 card('FMA14751','renal artery',vessels,[['Origin','Paired branches of the abdominal aorta.'],['Distribution','Supply the kidneys; divide into smaller vessels within each kidney.']]),
 card('FMA7088','heart',heart,[['Relationships','Located in the mediastinum between the lungs, behind the sternum.'],['Flow','Right ventricle → pulmonary trunk → lungs. Left ventricle → aorta → systemic circulation.'],['Chambers','Two receiving atria and two pumping ventricles.']]),
 card('FMA7394','trachea',airway,[['Continuity','Connects the larynx to the main bronchi.'],['Relationships','Anterior to the esophagus; C-shaped cartilage rings support its wall.']]),
 card('FMA7309','right lung',lungs,[['Lobes','Superior, middle and inferior lobes, separated by horizontal and oblique fissures.'],['Relationships','Its base rests on the diaphragm; its medial surface faces the mediastinum.']]),
 card('FMA7310','left lung',lungs,[['Lobes','Superior and inferior lobes, separated by an oblique fissure.'],['Relationships','The cardiac notch accommodates the heart; the base rests on the diaphragm.']]),
 card('FMA7203','kidney',kidney,[['Relationships','Paired retroperitoneal organs on either side of the vertebral column; the right lies lower than the left.'],['Hilum','Medial entry and exit for vessels, nerves, lymphatics and the urine drainage pathway.']]),
 card('FMA9704','ureter',urine,[['Continuity','Carries urine from the renal pelvis to the urinary bladder.'],['Function','Smooth muscle peristalsis propels urine; its oblique bladder entry helps limit backward flow.']]),
 card('FMA15900','urinary bladder',urine,[['Relationships','Behind the pubic bone and anterior to the rectum; the prostate lies below it in this male reference.'],['Function','Stores urine from both ureters and empties through the urethra.']]),
 card('FMA7148','stomach',stomach,[['Continuity','Receives food from the esophagus and empties through the pylorus into the duodenum.'],['Function','Stores and mixes food; acid and enzymes begin protein digestion.']]),
 card('FMA7197','liver',digestion,[['Relationships','Lies mainly in the right upper abdomen beneath the diaphragm.'],['Function','Produces bile and processes absorbed nutrients.']]),
 card('FMA7198','pancreas',digestion,[['Relationships','Extends from the duodenal curve toward the spleen.'],['Function','Delivers digestive enzymes and bicarbonate to the duodenum; endocrine cells release hormones including insulin and glucagon.']]),
];

/** A partial mesh gets explicitly labelled parent context, never parent facts passed off as its own. */
export function contentForConcept(concept:Concept,atlas:Atlas):{entry:StructureContent;broader:boolean}|undefined{
 const exact=CONTENT.find(c=>c.id===concept.id);if(exact)return {entry:exact,broader:false};
 if(!concept.elements.length)return;
 const matches=CONTENT.map(entry=>({entry,concept:atlas.concepts.find(c=>c.id===entry.id)})).filter(({concept:c})=>c&&concept.elements.every(id=>c.elements.includes(id)));
 matches.sort((a,b)=>a.concept!.elements.length-b.concept!.elements.length);
 return matches[0]?{entry:matches[0].entry,broader:true}:undefined;
}
export interface LessonStep {title:string;text:string;selected:string[];hidden:string[];sources:ContentSource[]}
export interface GuidedLesson {id:string;title:string;region:string;view:View;focus:string[];practice:string[];steps:LessonStep[]}
export const LESSONS:readonly GuidedLesson[]=[
 {id:'arm-attachments',title:'Arm: attachments and movement',region:'upper-limb',view:'front',focus:['FMA13303','FMA23463','FMA23466'],practice:['FMA13303','FMA23463','FMA23466','FMA37682','FMA37683','FMA37692'],steps:[
  {title:'Orient the bones',text:'Find the humerus, then the lateral radius and medial ulna. Orient these bones in anatomical position before tracing muscle attachments.',selected:['FMA13303','FMA23463','FMA23466'],hidden:['FMA37370','FMA34676'],sources:[bones]},
  {title:'Trace biceps',text:'Reveal both biceps heads. They arise from different scapular landmarks and share distal attachments. Recall elbow flexion and supination.',selected:['FMA37682','FMA37683'],hidden:['FMA34676'],sources:[muscles]},
  {title:'Compare the extensor',text:'Hide the biceps heads to explore the long head of triceps. Trace from scapula toward olecranon and recall its radial nerve supply.',selected:['FMA37692'],hidden:['FMA37682','FMA37683','FMA34676'],sources:[muscles]},
 ]},
 {id:'thoracic-window',title:'Thorax: reveal the mediastinum',region:'thorax',view:'front',focus:['FMA7088','FMA7309','FMA7310'],practice:['FMA7088','FMA7394','FMA7309','FMA7310','FMA3736','FMA3768'],steps:[
  {title:'Open the thoracic wall',text:'Ribs, sternum and intercostal muscles are hidden for this virtual study window. Compare the three right lung lobes with the two on the left.',selected:['FMA7309','FMA7310'],hidden:['FMA7574','FMA7485','FMA13354'],sources:[lungs]},
  {title:'Reveal the heart',text:'Hide both lungs to expose the mediastinal view. The heart sits between the lungs; follow the left ventricular outflow toward the ascending aorta.',selected:['FMA7088','FMA3736'],hidden:['FMA7574','FMA7485','FMA13354','FMA7309','FMA7310'],sources:[heart]},
  {title:'Follow the aortic arch',text:'Locate the arch above the heart. Name its three typical major branches, then use practice to identify the thoracic structures you explored.',selected:['FMA3768'],hidden:['FMA7574','FMA7485','FMA13354','FMA7309','FMA7310'],sources:[vessels]},
 ]},
 {id:'abdominal-depth',title:'Abdomen: surface organs to kidneys',region:'abdomen',view:'front',focus:['FMA7197','FMA7148','FMA7203'],practice:['FMA7197','FMA7148','FMA7198','FMA7203','FMA9704'],steps:[
  {title:'Orient the digestive organs',text:'With abdominal wall structures hidden, locate liver and stomach. Follow the stomach outlet toward the duodenum.',selected:['FMA7197','FMA7148'],hidden:['FMA14627','FMA14628','FMA13335'],sources:[digestion,stomach]},
  {title:'Reveal the pancreas',text:'Hide liver, stomach and intestines for a clearer pancreatic view. Recall its digestive secretion pathway to the duodenum.',selected:['FMA7198'],hidden:['FMA14627','FMA14628','FMA13335','FMA7197','FMA7148','FMA7200','FMA7201'],sources:[digestion]},
  {title:'Find the urine pathway',text:'Hide the remaining digestive organs. Locate the retroperitoneal kidneys and follow the ureters inferiorly. The bladder is outside this abdominal scene.',selected:['FMA7203','FMA9704'],hidden:['FMA14627','FMA14628','FMA13335','FMA7197','FMA7148','FMA7200','FMA7201','FMA7198','FMA7202','FMA7196'],sources:[kidney,urine]},
 ]},
];
export interface LessonScene {region:string;selected:string[];hidden:string[];focus?:string[];view?:View}
export function lessonScene(atlas:Atlas,lesson:GuidedLesson,step:LessonStep):LessonScene{
 const pieces=(ids:string[])=>[...new Set(ids.flatMap(id=>atlas.concepts.find(c=>c.id===id)?.elements??[]))];
 const selected=pieces(step.selected),selectedSet=new Set(selected);
 return {region:lesson.region,view:lesson.view,focus:pieces(lesson.focus),selected,hidden:pieces(step.hidden).filter(id=>!selectedSet.has(id))};
}
