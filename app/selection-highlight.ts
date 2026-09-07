import * as T from 'three';

/** A separate depth pass makes selection visible through context while retaining its own surface depth. */
export function createSelectionHighlight(partState:T.DataTexture,selectionState:T.DataTexture,stateWidth:number){
  const scene=new T.Scene(),resolution=new T.Vector2(1,1);
  const vertexShader=`
    attribute float partIndex;
    uniform sampler2D partState;
    uniform sampler2D selectionState;
    uniform float stateWidth;
    uniform vec2 resolution;
    uniform float outlinePixels;
    varying float enabled;
    varying vec3 surfaceNormal;
    void main(){
      vec2 uv=vec2((partIndex+0.5)/stateWidth,0.5);
      vec4 state=texture2D(partState,uv);
      enabled=state.w*texture2D(selectionState,uv).r;
      surfaceNormal=normalize(normalMatrix*normal);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position+state.xyz,1.0);
      vec2 direction=surfaceNormal.xy;
      direction/=max(length(direction),0.001);
      gl_Position.xy+=direction*outlinePixels*2.0/resolution*gl_Position.w;
    }
  `;
  const material=(color:string,outlinePixels:number,opacity:number)=>new T.ShaderMaterial({
    uniforms:{partState:{value:partState},selectionState:{value:selectionState},stateWidth:{value:stateWidth},resolution:{value:resolution},outlinePixels:{value:outlinePixels},color:{value:new T.Color(color)},opacity:{value:opacity}},
    vertexShader,
    fragmentShader:`
      uniform vec3 color;
      uniform float opacity;
      varying float enabled;
      varying vec3 surfaceNormal;
      void main(){
        if(enabled<0.5)discard;
        float light=0.6+0.4*abs(normalize(surfaceNormal).z);
        gl_FragColor=vec4(color*light,opacity);
        #include <colorspace_fragment>
      }
    `,
    side:T.DoubleSide,transparent:true,depthTest:outlinePixels===0,depthWrite:outlinePixels===0,toneMapped:false,
  });
  const depth=material('#3ee8c5',0,1),outline=material('#006d79',3,.9),surface=material('#3ee8c5',0,.88);
  // Resolve selection's own depth before blending; rear surfaces must not bleed through its front surface.
  depth.colorWrite=false;
  surface.depthWrite=false;
  return {
    scene,
    resize:(width:number,height:number)=>resolution.set(width,height),
    add:(geometry:T.BufferGeometry)=>{
      for(const [mat,order] of [[depth,0],[outline,1],[surface,2]] as const){const mesh=new T.Mesh(geometry,mat);mesh.frustumCulled=false;mesh.renderOrder=order;scene.add(mesh);}
    },
    dispose:()=>{scene.clear();depth.dispose();outline.dispose();surface.dispose();},
  };
}
