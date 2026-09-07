import assert from 'node:assert/strict';
import * as T from 'three';
import {cutawayEquation,retainedPoint,clippedBounds,validCameraPose} from '../app/renderer-state.ts';
const box=new T.Box3(new T.Vector3(-2,0,-4),new T.Vector3(2,10,4));
for(const axis of ['x','y','z'])for(const invert of [false,true]){
 const plane=cutawayEquation({axis,position:.5,invert},box),center=box.getCenter(new T.Vector3());
 assert.ok(retainedPoint(center,plane));
 const positive=center.clone();positive[axis]+=1;
 const negative=center.clone();negative[axis]-=1;
 assert.equal(retainedPoint(positive,plane),!invert);
 assert.equal(retainedPoint(negative,plane),invert);
 const clipped=clippedBounds(box,plane);
 assert.equal(invert?clipped.max[axis]:clipped.min[axis],center[axis]);
}
const plane=cutawayEquation({axis:'y',position:.6,invert:false},box);
assert.ok(clippedBounds(new T.Box3(new T.Vector3(-1,0,-1),new T.Vector3(1,2,1)),plane).isEmpty());
assert.ok(retainedPoint(new T.Vector3(-100,0,0),cutawayEquation(undefined,box)));
assert.equal(cutawayEquation({axis:'y',position:20,invert:false},box).w,-10);
assert.ok(validCameraPose({position:[1,2,3],target:[0,1,0]}));
assert.equal(validCameraPose({position:[0,0,0],target:[0,0,0]}),false);
assert.equal(validCameraPose({position:[Infinity,0,0],target:[0,0,0]}),false);
assert.equal(validCameraPose({position:[1,2],target:[0,0,0]}),false);
console.log('Renderer clipping axes, inversion, clipped label bounds and camera validation passed.');
