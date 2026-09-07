/**
 * Practical study navigation, not an exhaustive or exclusive anatomical taxonomy.
 * Regional naming reference: OpenStax, Anatomical Terminology:
 * https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology
 * Membership uses available BodyParts3D atlas concepts. Contextual bones may cross
 * joint boundaries; the supplied male reference has limited ear and abdominal-wall detail.
 */
export const REGION_GROUPS = [
  {id:'head-neck',name:'Head and neck'},
  {id:'back',name:'Back'},
  {id:'thorax',name:'Thorax'},
  {id:'abdomen',name:'Abdomen'},
  {id:'pelvis-perineum',name:'Pelvis and perineum'},
  {id:'upper-limb',name:'Upper limb'},
  {id:'lower-limb',name:'Lower limb'},
 ] as const;
export type RegionGroupId = typeof REGION_GROUPS[number]['id'];
export type RegionView = 'front' | 'back' | 'three-quarter' | 'side';

export type StudyRegion = {
  id:string;
  name:string;
  group:RegionGroupId;
  conceptIds:readonly string[];
  overview:boolean;
  view:RegionView;
  coverageNote?:string;
};

function region<const Id extends string>(id:Id,name:string,group:RegionGroupId,conceptIds:readonly string[],view:RegionView,coverageNote?:string):StudyRegion & {id:Id}{
  return {id,name,group,conceptIds,view,overview:false,coverageNote};
}

function overview<const Id extends RegionGroupId>(id:Id,name:string,children:readonly StudyRegion[],view:RegionView):StudyRegion & {id:Id}{
  return {id,name,group:id,conceptIds:[...new Set(children.flatMap(region=>region.conceptIds))],view,overview:true};
}

const HEAD_NECK = [
  region('cranial','Cranium and brain','head-neck',[
    'FMA9613', // parietal bone
    'FMA52734', // frontal bone
    'FMA52735', // occipital bone
    'FMA52736', // sphenoid bone
    'FMA52737', // temporal bone
    'FMA52740', // ethmoid
    'FMA50801', // brain
    'FMA242787', // ventricular system of brain
  ],'three-quarter'),
  region('face','Face','head-neck',[
    'FMA46751', // muscle of face
    'FMA9711', // maxilla
    'FMA52748', // mandible
    'FMA52745', // nasal bone
  ],'front'),
  region('eyes','Eyes and orbits','head-neck',[
    'FMA54449', // right eye
    'FMA54450', // left eye
  ],'front'),
  region('external-ear','External ear','head-neck',[
    'FMA52781', // external ear
  ],'side','This atlas contains one external-ear mesh; middle and inner ear structures are unavailable.'),
  region('nose','Nose','head-neck',[
    'FMA46472', // nose
    'FMA59654', // osseous skeleton of nose
  ],'three-quarter'),
  region('oral','Mouth and teeth','head-neck',[
    'FMA12516', // tooth
    'FMA54640', // tongue
    'FMA46689', // muscle of tongue
    'FMA9597', // salivary gland
    'FMA52748', // mandible
    'FMA9711', // maxilla
  ],'three-quarter'),
  region('neck','Neck','head-neck',[
    'FMA9915', // cervical vertebra
    'FMA9617', // muscle of neck
    'FMA3939', // common carotid artery
    'FMA4724', // internal jugular vein
    'FMA52749', // hyoid bone
    'FMA46562', // muscle of larynx
    'FMA46619', // muscle of pharynx
    'FMA55099', // thyroid cartilage
  ],'three-quarter'),
] as const;

const BACK = [
  region('vertebral-column','Vertebral column and cord','back',[
    'FMA9914', // vertebra
    'FMA13895', // intervertebral disk of cervical vertebra
    'FMA10455', // intervertebral disk of thoracic vertebra
    'FMA13894', // intervertebral disk of lumbar vertebra
    'FMA7647', // spinal cord
  ],'back'),
  region('back-muscles','Back muscles','back',[
    'FMA22703', // iliocostalis thoracis
    'FMA22709', // longissimus thoracis
    'FMA22765', // spinalis thoracis
    'FMA22828', // semispinalis thoracis
    'FMA32555', // ascending part of trapezius
    'FMA32556', // transverse part of trapezius
    'FMA32557', // descending part of trapezius
    'FMA32519', // levator scapulae
    'FMA61681', // back of abdomen
  ],'back'),
] as const;

const THORAX = [
  region('thoracic-wall','Thoracic wall','thorax',[
    'FMA7485', // sternum
    'FMA7574', // rib
    'FMA13354', // intercostal muscle
    'FMA13295', // diaphragm
    'FMA3960', // internal thoracic artery
  ],'front'),
  region('mediastinum','Heart and mediastinum','thorax',[
    'FMA7088', // heart
    'FMA3736', // ascending aorta
    'FMA3768', // arch of aorta
    'FMA4720', // superior vena cava
    'FMA87217', // descending thoracic aorta
    'FMA7131', // esophagus
    'FMA9607', // thymus
  ],'front'),
  region('lungs','Lungs and airways','thorax',[
    'FMA7309', // right lung
    'FMA7310', // left lung
    'FMA7394', // trachea
    'FMA13295', // diaphragm
  ],'front'),
] as const;

const ABDOMEN = [
  region('abdominal-wall','Abdominal wall','abdomen',[
    'FMA14627', // anterior abdominal wall
    'FMA14628', // posterior abdominal wall
    'FMA13335', // external oblique
    'FMA9921', // lumbar vertebra
  ],'three-quarter','Available anterior and posterior wall structures; this atlas does not include every abdominal-wall muscle.'),
  region('digestive','Abdominal digestive organs','abdomen',[
    'FMA7148', // stomach
    'FMA7200', // small intestine
    'FMA7201', // large intestine
    'FMA7197', // liver
    'FMA7198', // pancreas
    'FMA7202', // gallbladder
    'FMA7196', // spleen
  ],'front'),
  region('retroperitoneum','Kidneys and retroperitoneum','abdomen',[
    'FMA7203', // kidney
    'FMA9704', // ureter
    'FMA9604', // adrenal gland
    'FMA3789', // abdominal aorta
    'FMA18060', // psoas major
    'FMA9921', // lumbar vertebra
  ],'front'),
] as const;

const PELVIS = [
  region('pelvic-cavity','Pelvis and pelvic organs','pelvis-perineum',[
    'FMA16580', // bony pelvis
    'FMA15900', // urinary bladder
    'FMA9600', // prostate
    'FMA19386', // seminal vesicle
    'FMA14544', // rectum
    'FMA19089', // zone of levator ani
  ],'front'),
  region('perineum','Perineum and external genitalia','pelvis-perineum',[
    'FMA9579', // perineum
    'FMA9623', // perineal muscle
    'FMA21930', // external anal sphincter
    'FMA18247', // glans penis
    'FMA19617', // corpus spongiosum of penis
    'FMA19618', // corpus cavernosum of penis
    'FMA7210', // testis
  ],'front','Structures shown belong to the supplied adult male reference.'),
] as const;

const UPPER_LIMB = [
  region('shoulder-axilla','Shoulder and axilla','upper-limb',[
    'FMA13394', // scapula
    'FMA13321', // clavicle
    'FMA13303', // humerus
    'FMA33531', // muscle of shoulder
    'FMA34676', // zone of deltoid
    'FMA22654', // axillary artery
    'FMA13329', // axillary vein
  ],'three-quarter'),
  region('arm','Arm','upper-limb',[
    'FMA13303', // humerus
    'FMA37370', // muscle of arm
    'FMA37682', // short head of biceps brachii
    'FMA37683', // long head of biceps brachii
    'FMA37692', // long head of triceps brachii
    'FMA37693', // medial head of triceps brachii
    'FMA37694', // lateral head of triceps brachii
    'FMA13324', // cephalic vein
    'FMA22908', // basilic vein
    'FMA22689', // brachial artery
    'FMA22934', // brachial vein
  ],'front'),
  region('elbow','Elbow','upper-limb',[
    'FMA13303', // humerus
    'FMA23463', // radius
    'FMA23466', // ulna
    'FMA37704', // anconeus
    'FMA37667', // brachialis
    'FMA22706', // superior ulnar collateral artery
    'FMA22710', // inferior ulnar collateral artery
    'FMA22800', // anterior ulnar recurrent artery
    'FMA22803', // posterior ulnar recurrent artery
  ],'front'),
  region('forearm','Forearm','upper-limb',[
    'FMA23463', // radius
    'FMA23466', // ulna
    'FMA37371', // muscle of forearm
    'FMA23706', // interosseous membrane of forearm
    'FMA22730', // radial artery
    'FMA22796', // ulnar artery
  ],'front'),
  region('wrist-hand','Wrist and hand','upper-limb',[
    'FMA23889', // carpal bone
    'FMA9612', // metacarpal bone
    'FMA23914', // phalanx of finger
    'FMA37372', // muscle of hand
    'FMA39988', // flexor retinaculum of wrist
    'FMA67977', // dorsal venous network of hand
  ],'front'),
] as const;

const LOWER_LIMB = [
  region('hip-gluteal','Hip and gluteal region','lower-limb',[
    'FMA16585', // hip bone
    'FMA9611', // femur
    'FMA64922', // gluteal muscle
    'FMA18908', // superior gluteal vein
    'FMA18911', // inferior gluteal vein
  ],'back'),
  region('thigh','Thigh','lower-limb',[
    'FMA9611', // femur
    'FMA22470', // muscle of thigh
    'FMA70248', // femoral artery
    'FMA21185', // femoral vein
  ],'front'),
  region('knee','Knee','lower-limb',[
    'FMA9611', // femur
    'FMA24476', // tibia
    'FMA24479', // fibula
    'FMA24485', // patella
    'FMA22590', // popliteus
    'FMA77155', // popliteal artery
    'FMA44327', // popliteal vein
  ],'front'),
  region('leg','Leg','lower-limb',[
    'FMA24476', // tibia
    'FMA24479', // fibula
    'FMA22471', // muscle of leg
    'FMA35187', // interosseous membrane of leg
    'FMA43894', // anterior tibial artery
    'FMA43895', // posterior tibial artery
    'FMA44331', // anterior tibial vein
    'FMA44332', // posterior tibial vein
  ],'front'),
  region('ankle-foot','Ankle and foot','lower-limb',[
    'FMA24491', // tarsal bone
    'FMA24492', // metatarsal bone
    'FMA24493', // phalanx of toe
    'FMA37369', // muscle of foot
    'FMA44197', // tarsal ligament
    'FMA44356', // dorsal venous arch of foot
    'FMA44489', // plantar venous arch of foot
  ],'three-quarter'),
] as const;

export const REGIONS = [
  overview('head-neck','Head and neck',HEAD_NECK,'three-quarter'),
  ...HEAD_NECK,
  overview('back','Back',BACK,'back'),
  ...BACK,
  overview('thorax','Thorax',THORAX,'three-quarter'),
  ...THORAX,
  overview('abdomen','Abdomen',ABDOMEN,'three-quarter'),
  ...ABDOMEN,
  overview('pelvis-perineum','Pelvis and perineum',PELVIS,'three-quarter'),
  ...PELVIS,
  overview('upper-limb','Upper limb',UPPER_LIMB,'three-quarter'),
  ...UPPER_LIMB,
  overview('lower-limb','Lower limb',LOWER_LIMB,'three-quarter'),
  ...LOWER_LIMB,
] as const;
export type RegionId = typeof REGIONS[number]['id'];
