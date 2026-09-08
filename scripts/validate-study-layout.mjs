import assert from 'node:assert/strict';
import {studyViewport,studyFrameKey} from '../app/study-model.ts';
const browse={panel:'browse',inspector:false,sheet:'half'};
const inspected={...browse,inspector:true};
assert.ok(studyViewport(1440,900,inspected).right < studyViewport(1440,900,browse).right,'Inspector reserves camera space');
assert.ok(studyViewport(1440,900,{...browse,panel:'wide'}).left > studyViewport(1440,900,browse).left,'Management panel reserves its width');
assert.ok(studyViewport(390,844,{...browse,sheet:'collapsed'}).bottom > studyViewport(390,844,browse).bottom,'Collapsed sheet gives anatomy more room');
assert.notEqual(studyFrameKey({study:true,studyLayout:browse}),studyFrameKey({study:true,studyLayout:inspected}),'Opening inspector updates framing');
for(const [w,h] of [[1440,900],[1024,768],[390,844],[320,568],[844,390]]) for(const sheet of ['collapsed','half','expanded']) {
 const r=studyViewport(w,h,{...inspected,sheet});
 assert.ok(r.left>=0&&r.top>=0&&r.right<=w&&r.bottom<=h);
 assert.ok(r.right-r.left>=100&&r.bottom-r.top>=80,`Usable viewport at ${w}x${h}, ${sheet}`);
}
console.log('Study responsive camera reservations and layout invalidation passed.');
