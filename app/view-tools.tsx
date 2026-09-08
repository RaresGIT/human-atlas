import {Button} from '@/components/ui/button';
import type {SceneState} from './anatomy';
export function ViewTools({state,onChange,onCapture,embedded=false}:{state:SceneState;onChange:(update:(s:SceneState)=>SceneState)=>void;onCapture?:()=>void;embedded?:boolean}){
 const fields=<div className="tool-fields">
  <label>Selection style<select value={state.selectionStyle??'solid'} onChange={e=>onChange(s=>({...s,selectionStyle:e.target.value as SceneState['selectionStyle']}))}><option value="solid">Solid surface</option><option value="outline">Outline</option><option value="xray">X-ray highlight</option></select></label>
  <label>Surrounding anatomy · {Math.round((state.contextOpacity??1)*100)}%<input aria-label="Surrounding anatomy opacity" type="range" min="5" max="100" step="5" value={(state.contextOpacity??1)*100} onChange={e=>onChange(s=>({...s,contextOpacity:Number(e.target.value)/100}))}/></label>
  <label>Cutaway plane<select value={state.cutaway?.axis??'off'} onChange={e=>onChange(s=>({...s,cutaway:e.target.value==='off'?undefined:{axis:e.target.value as 'x'|'y'|'z',position:.5,invert:false}}))}><option value="off">Off</option><option value="x">Sagittal · left / right</option><option value="y">Transverse · upper / lower</option><option value="z">Coronal · front / back</option></select></label>
  {state.cutaway&&<><label>Plane position · {Math.round(state.cutaway.position*100)}%<input aria-label="Cutaway plane position" type="range" min="0" max="100" value={state.cutaway.position*100} onChange={e=>onChange(s=>({...s,cutaway:{...s.cutaway!,position:Number(e.target.value)/100}}))}/></label><label className="inline-check"><input type="checkbox" checked={state.cutaway.invert} onChange={e=>onChange(s=>({...s,cutaway:{...s.cutaway!,invert:e.target.checked}}))}/>Reverse cutaway</label><p className="study-note">Cuts through surface meshes; cut edges can be open. This is not CT or MRI imaging.</p></>}
  <Button variant="outline" aria-pressed={!!state.chooseAtPoint} onClick={()=>onChange(s=>({...s,chooseAtPoint:!s.chooseAtPoint}))}>{state.chooseAtPoint?'Cancel picking':'Choose overlapping structure'}</Button>{state.chooseAtPoint&&<p role="status">Tap a point on the anatomy to list the structures beneath it.</p>}
  {onCapture&&<Button variant="outline" onClick={onCapture}>Export annotated PNG</Button>}
 </div>;
 return embedded?<div className="view-tools">{fields}</div>:<details className="view-tools"><summary>Appearance and cutaway</summary>{fields}</details>;
}
