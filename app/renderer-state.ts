import * as T from 'three';
import type {CameraPose,CutawayPlane} from './anatomy';

/** Positive signed distance is retained. This clips surfaces; it does not create tissue caps. */
export function cutawayEquation(cut:CutawayPlane|undefined,bounds:T.Box3):T.Vector4 {
 if(!cut)return new T.Vector4(0,0,0,1);
 const axis=cut.axis,position=T.MathUtils.clamp(Number.isFinite(cut.position)?cut.position:.5,0,1),sign=cut.invert?-1:1;
 const coordinate=T.MathUtils.lerp(bounds.min[axis],bounds.max[axis],position);
 return new T.Vector4(axis==='x'?sign:0,axis==='y'?sign:0,axis==='z'?sign:0,-sign*coordinate);
}
export function retainedPoint(point:T.Vector3,plane:T.Vector4){return point.x*plane.x+point.y*plane.y+point.z*plane.z+plane.w>=-1e-7;}
export function clippedBounds(box:T.Box3,plane:T.Vector4):T.Box3 {
 const result=box.clone();
 for(const axis of ['x','y','z'] as const){const n=plane[axis];if(n>0)result.min[axis]=Math.max(result.min[axis],-plane.w/n);else if(n<0)result.max[axis]=Math.min(result.max[axis],-plane.w/n);}
 return result.isEmpty()?result.makeEmpty():result;
}
export function validCameraPose(pose:CameraPose|undefined):pose is CameraPose {
 return !!pose&&[pose.position,pose.target].every(v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<1000))&&new T.Vector3().fromArray(pose.position).distanceToSquared(new T.Vector3().fromArray(pose.target))>1e-8;
}
