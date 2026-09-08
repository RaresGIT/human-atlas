import type {ReactNode} from 'react';
import {Camera,Info,Layers3,Orbit,SlidersHorizontal,Redo2,RotateCcw,Search,Undo2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverContent,PopoverTitle,PopoverTrigger} from '@/components/ui/popover';
import type {SceneState,View} from './anatomy';
import {ViewTools} from './view-tools';

type Props={state:SceneState;onChange:(update:(s:SceneState)=>SceneState)=>void;onSearch:()=>void;searchOpen:boolean;onLayers:()=>void;layersOpen:boolean;onOpenTool:()=>void;onReset:()=>void;onAbout:()=>void;onUndo:()=>void;onRedo:()=>void;canUndo:boolean;canRedo:boolean;onCapture:()=>void};
function ToolPopover({label,icon,children,onOpen,active=false}:{label:string;icon:ReactNode;children:ReactNode;onOpen:()=>void;active?:boolean}){
 return <Popover onOpenChange={open=>{if(open)onOpen();}}><PopoverTrigger render={<Button variant="ghost" className={active?'active':''} aria-label={label} title={label}/>}>{icon}</PopoverTrigger><PopoverContent side="left" align="start" sideOffset={10} className="explorer-tool-popover"><PopoverTitle>{label}</PopoverTitle>{children}</PopoverContent></Popover>;
}
export default function ExplorerToolbar({state,onChange,onSearch,searchOpen,onLayers,layersOpen,onOpenTool,onReset,onAbout,onUndo,onRedo,canUndo,canRedo,onCapture}:Props){
 return <nav className="explorer-toolrail glass" aria-label="Explorer tools">
  <Button variant="ghost" aria-label="Search anatomy" title="Search anatomy (/)" aria-pressed={searchOpen} onClick={onSearch}><Search size={19}/></Button>
  <Button variant="ghost" aria-label="Anatomical layers" title="Anatomical layers" aria-pressed={layersOpen} onClick={onLayers}><Layers3 size={19}/></Button>
  <ToolPopover label="Appearance and cutaway" icon={<SlidersHorizontal size={19}/>} onOpen={onOpenTool}><ViewTools embedded state={state} onChange={onChange} onCapture={onCapture}/></ToolPopover>
  <ToolPopover label="Camera views" icon={<Camera size={19}/>} onOpen={onOpenTool}><div className="explorer-tool-options">{(['three-quarter','front','side','back'] as View[]).map((view,i)=><Button key={view} variant="ghost" aria-pressed={state.view===view} disabled={state.explode>.8&&view!=='front'} onClick={()=>onChange(s=>({...s,view,reset:s.reset+1,rotate:false}))}>{['Three-quarter view','Front view','Side view','Back view'][i]}</Button>)}</div></ToolPopover>
  <ToolPopover label="Auto rotation" icon={<Orbit size={19}/>} onOpen={onOpenTool} active={state.rotate}><div className="explorer-tool-options"><Button variant="ghost" disabled={state.explode>=.4} aria-pressed={state.rotate&&(state.rotationDirection??1)===1} onClick={()=>onChange(s=>({...s,rotate:true,rotationDirection:1}))}>Clockwise</Button><Button variant="ghost" disabled={state.explode>=.4} aria-pressed={state.rotate&&state.rotationDirection===-1} onClick={()=>onChange(s=>({...s,rotate:true,rotationDirection:-1}))}>Counterclockwise</Button><Button variant="ghost" disabled={!state.rotate} onClick={()=>onChange(s=>({...s,rotate:false}))}>Stop rotation</Button></div>{state.explode>=.4&&<p>Assemble the anatomy below 40% to rotate.</p>}</ToolPopover>
  <span className="explorer-tool-divider"/>
  <Button variant="ghost" aria-label="Undo" title="Undo (Ctrl / ⌘ + Z)" disabled={!canUndo} onClick={onUndo}><Undo2 size={19}/></Button>
  <Button variant="ghost" aria-label="Redo" title="Redo (Ctrl / ⌘ + Shift + Z)" disabled={!canRedo} onClick={onRedo}><Redo2 size={19}/></Button>
  <Button variant="ghost" aria-label="Reset view and layers" title="Reset view and layers" onClick={onReset}><RotateCcw size={19}/></Button>
  <Button variant="ghost" aria-label="About this atlas" title="About this atlas" onClick={onAbout}><Info size={19}/></Button>
 </nav>;
}
