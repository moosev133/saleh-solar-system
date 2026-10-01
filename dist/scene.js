import * as THREE from 'three';

const mix = THREE.MathUtils.lerp;
export function createSolarScene(container, state) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0xffffff);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xffffff, .018);
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();

  // A locally generated studio environment: broad reflection cards, no image assets.
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xa7b9d6);
  const card = (x,y,z,w,h,color,intensity,rx=0,ry=0) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
    mesh.position.set(x,y,z); mesh.rotation.set(rx,ry,0); env.add(mesh);
  };
  card(0,6,0,14,10,0xffffff,1,-Math.PI/2);
  card(-6,3,0,6,9,0xffefc9,1,0,Math.PI/2);
  card(5,1,-4,4,8,0x7296c9,1);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(env,.02);
  scene.environment = environment.texture;
  env.traverse(o=> {o.geometry?.dispose();o.material?.dispose();}); pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xf0f6ff,0xa3aaba,1.3); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffde9c,4.1);
  sun.position.set(-8,12,3); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;
  sun.shadow.normalBias=.025; sun.shadow.bias=-.0003; sun.shadow.radius=4; scene.add(sun);
  const rim = new THREE.DirectionalLight(0xdce9ff,2.5); rim.position.set(7,5,-7); scene.add(rim);
  const glowLight = new THREE.PointLight(0xf9cc69,1,12,2);glowLight.position.set(0,-.1,2);scene.add(glowLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.09}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.16;floor.receiveShadow=true;scene.add(floor);
  const grid = new THREE.GridHelper(100,100,0x56604a,0x3b4b3e);grid.position.y=-1.153;grid.material.transparent=true;grid.material.opacity=.065;

  const installation=new THREE.Group();scene.add(installation);
  function roundedBlock(width,height,depth,radius,material){
    const w=width/2,d=depth/2,r=radius,s=new THREE.Shape();
    s.moveTo(-w+r,-d);s.lineTo(w-r,-d);s.quadraticCurveTo(w,-d,w,-d+r);s.lineTo(w,d-r);s.quadraticCurveTo(w,d,w-r,d);s.lineTo(-w+r,d);s.quadraticCurveTo(-w,d,-w,d-r);s.lineTo(-w,-d+r);s.quadraticCurveTo(-w,-d,-w+r,-d);
    const geometry=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:5});
    geometry.rotateX(-Math.PI/2);geometry.translate(0,-height/2,0);
    const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  const stone=new THREE.MeshStandardMaterial({color:0xf3f4f4,roughness:.75,metalness:.06});
  const base=roundedBlock(7.1,.36,5.5,.12,stone);base.position.y=-.5;installation.add(base);
  const under=new THREE.Mesh(new THREE.BoxGeometry(6.95,.08,5.35),new THREE.MeshStandardMaterial({color:0x0a2853,roughness:.6,metalness:.5}));under.position.y=-.75;installation.add(under);
  const gold=new THREE.MeshStandardMaterial({color:0xffca00,roughness:.35,metalness:.28,emissive:0xae711c,emissiveIntensity:.18});
  const edge=new THREE.Mesh(new THREE.BoxGeometry(6.8,.018,.016),gold);edge.position.set(0,-.63,2.754);installation.add(edge);

  // Solar-cell texture. Fine collector lines remain legible when the camera moves in.
  const textureCanvas=document.createElement('canvas');textureCanvas.width=768;textureCanvas.height=1024;
  const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#82a2c7';ctx.fillRect(0,0,768,1024);
  const cols=6,rows=10,cw=768/cols,ch=1024/rows;
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    const px=x*cw+3,py=y*ch+3,w=cw-6,h=ch-6,k=7;
    ctx.fillStyle=`rgb(${13+(x+y)%3*2},${44+(x*y)%4*2},${87+(y%3)*3})`;
    ctx.beginPath();ctx.moveTo(px+k,py);ctx.lineTo(px+w-k,py);ctx.lineTo(px+w,py+k);ctx.lineTo(px+w,py+h-k);ctx.lineTo(px+w-k,py+h);ctx.lineTo(px+k,py+h);ctx.lineTo(px,py+h-k);ctx.lineTo(px,py+k);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#6389b9';ctx.lineWidth=.65;
    for(let l=1;l<9;l++){const yy=py+l*h/9;ctx.beginPath();ctx.moveTo(px+2,yy);ctx.lineTo(px+w-2,yy);ctx.stroke();}
    ctx.strokeStyle='#82a3a3';ctx.lineWidth=1.8;
    for(let l=1;l<=3;l++){const xx=px+l*w/4;ctx.beginPath();ctx.moveTo(xx,py);ctx.lineTo(xx,py+h);ctx.stroke();}
  }
  const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const panelSurface=new THREE.MeshPhysicalMaterial({map:texture,color:0xd3e6ff,roughness:.36,metalness:.15,clearcoat:1,clearcoatRoughness:.14,envMapIntensity:.45});
  const frameMat=new THREE.MeshStandardMaterial({color:0xc1cddd,metalness:.9,roughness:.3});
  const blackMat=new THREE.MeshStandardMaterial({color:0x15231e,roughness:.5,metalness:.65});
  const rails=new THREE.Group();installation.add(rails);
  for(const z of [-1.9,-.2,.8,2.3]){const rail=new THREE.Mesh(new THREE.BoxGeometry(6.5,.07,.055),frameMat);rail.position.set(0,-.02,z);rail.castShadow=true;rails.add(rail);}
  const array=new THREE.Group();installation.add(array);
  const panelGroups=[];
  for(let row=0;row<3;row++) for(let col=0;col<4;col++){
    const module=new THREE.Group();module.position.set((col-1.5)*1.64,.19,(row-.5)*2.6);module.rotation.x=-.22;array.add(module);panelGroups.push(module);module.userData={row,col};module.visible=row<2;
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.57,.075,2.44),frameMat);frame.castShadow=true;frame.receiveShadow=true;module.add(frame);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1.505,2.375),panelSurface);face.rotation.x=-Math.PI/2;face.position.y=.041;face.receiveShadow=true;module.add(face);
    for(const x of [-.62,.62]){
      const support=new THREE.Mesh(new THREE.BoxGeometry(.045,.24,.045),blackMat);support.position.set(module.position.x+x,-.24,module.position.z-.82);support.castShadow=true;support.visible=row<2;installation.add(support);
    }
  }
  // An inverter and two neatly routed power lines anchor the energy narrative.
  const inverter=roundedBlock(.58,.65,.18,.05,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.45,metalness:.35}));inverter.position.set(-2.15,-.28,2.74);installation.add(inverter);
  const led=new THREE.Mesh(new THREE.BoxGeometry(.18,.025,.014),new THREE.MeshBasicMaterial({color:0xd9fb9a}));led.position.set(-2.15,-.04,2.85);installation.add(led);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.15,-.4,2.85),new THREE.Vector3(-2.1,-.68,2.9),new THREE.Vector3(-1.5,-.7,2.91),new THREE.Vector3(0,-.7,2.91),new THREE.Vector3(2,-.7,2.91)]);
  const cable=new THREE.Mesh(new THREE.TubeGeometry(curve,40,.014,6,false),new THREE.MeshStandardMaterial({color:0x766c40,emissive:0xdb9b2d,emissiveIntensity:.4}));installation.add(cable);
  const energyDots=[];for(let i=0;i<7;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.025,6,6),new THREE.MeshBasicMaterial({color:0xffdc86}));installation.add(dot);energyDots.push(dot);}

  // A sunny, sculptural display platform replaces the previous night-time orbit.
  const sunPlatform=new THREE.Mesh(new THREE.CylinderGeometry(4.9,5,.11,96),new THREE.MeshBasicMaterial({color:0xffdc37,toneMapped:false}));
  sunPlatform.position.y=-1.04;scene.add(sunPlatform);
  const platformShadow=new THREE.Mesh(new THREE.CircleGeometry(4.9,96),new THREE.ShadowMaterial({opacity:.12}));platformShadow.rotation.x=-Math.PI/2;platformShadow.position.y=-.983;platformShadow.receiveShadow=true;scene.add(platformShadow);
  const platformEdge=new THREE.Mesh(new THREE.TorusGeometry(4.92,.012,5,96),new THREE.MeshBasicMaterial({color:0xeabc06}));platformEdge.rotation.x=Math.PI/2;platformEdge.position.y=-.972;scene.add(platformEdge);
  // Translucent volumes catch the upper-left light without a heavy postprocessing pass.
  const beamMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{strength:{value:.08}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv; uniform float strength; void main(){float edge=pow(sin(vUv.x*3.14159),2.);float fade=sin(vUv.y*3.14159);gl_FragColor=vec4(1.,.84,.48,edge*fade*strength);}' });
  const beams=new THREE.Group();
  for(let i=0;i<3;i++){
    const start=new THREE.Vector3(-16+i*.75,10,9-i*.4),end=new THREE.Vector3(i*1.6-1.6,0,0);
    const geo=new THREE.CylinderGeometry(.25,1.6+i*.3,start.distanceTo(end),32,1,true);
    const beam=new THREE.Mesh(geo,beamMaterial);
    beam.position.copy(start).add(end).multiplyScalar(.5);beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),start.clone().sub(end).normalize());beams.add(beam);
  }
  const particleCount=50,particlePositions=new Float32Array(particleCount*3);
  for(let i=0;i<particleCount;i++){particlePositions[i*3]=(Math.random()-.5)*18;particlePositions[i*3+1]=Math.random()*9;particlePositions[i*3+2]=(Math.random()-.5)*12;}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const dustMaterial=new THREE.PointsMaterial({color:0xe6b51e,size:.025,transparent:true,opacity:.45,depthWrite:false});
  const dust=new THREE.Points(dustGeometry,dustMaterial);scene.add(dust);

  let width=1,height=1,mobile=false,visible=true,time=0,frames=0,totalFrameTime=0;
  const observer=new ResizeObserver(()=>resize());observer.observe(container);
  function resize(){width=container.clientWidth;height=container.clientHeight;mobile=width<760;camera.aspect=width/height;camera.clearViewOffset();camera.updateProjectionMatrix();renderer.setSize(width,height);}
  resize();
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;clock.getDelta();});
  const viewObserver=new IntersectionObserver(([entry])=>{state.onScreen=entry.isIntersecting;},{threshold:0});viewObserver.observe(container);
  let currentProgress=0,currentHour=state.hour,qualityAdjusted=false;
  const target=new THREE.Vector3(),camTarget=new THREE.Vector3();
  function frame(){
    const dt=Math.min(clock.getDelta(),.05);
    if(!visible||state.onScreen===false)return;
    const moving=!state.paused;
    if(moving)time+=dt;
    currentProgress=mix(currentProgress,state.progress,reduced?1:1-Math.exp(-dt*5));
    currentHour=mix(currentHour,state.hour,1-Math.exp(-dt*7));
    const daylight=Math.max(.025,Math.sin((currentHour-6)/12*Math.PI));
    const intro=(reduced||state.paused)?1:THREE.MathUtils.smoothstep(time,.1,4.3);
    const energy=daylight*intro;
    const p=currentProgress;
    const angle=.68-p*.85+(moving?Math.sin(time*.12)*.025:0);
    const radius=(mobile?20:12.5)-p*.3+(state.system==='business'?1.4:0);
    camTarget.set(Math.sin(angle)*radius,(mobile?13:8.5)+p*2,Math.cos(angle)*radius);
    camTarget.x+=state.pointer.x*.3;camTarget.y+=state.pointer.y*.2;
    camera.position.lerp(camTarget,reduced?1:.07);
    target.set(0,-.65,0);camera.lookAt(target);
    installation.position.y=.12+Math.sin(time*.65)*.055;
    installation.rotation.y=Math.sin(time*.13)*.025;
    const business=state.system==='business';
    const platformScale=business?1.16:1;
    sunPlatform.scale.setScalar(mix(sunPlatform.scale.x,platformScale,.07));
    platformShadow.scale.setScalar(sunPlatform.scale.x);platformEdge.scale.setScalar(sunPlatform.scale.x);
    const depthTarget=business?1.42:1;
    base.scale.z=mix(base.scale.z,depthTarget,.07);under.scale.z=base.scale.z;
    panelGroups.forEach((module,i)=>{const {row,col}=module.userData;module.visible=row<(business?3:2);module.position.z=mix(module.position.z,(row-(business?1:.5))*(business?2.47:2.6),.07);module.position.y=.19+Math.sin(time*.5+i*.25)*.008;});
    inverter.position.z=mix(inverter.position.z,business?3.84:2.74,.07);led.position.z=inverter.position.z+.11;
    cable.position.z=mix(cable.position.z,business?1.1:0,.07);edge.position.z=mix(edge.position.z,business?3.88:2.754,.07);
    const sunAngle=(currentHour-6)/12*Math.PI;
    sun.position.set(-Math.cos(sunAngle)*11,Math.max(.8,Math.sin(sunAngle)*12),5);
    sun.intensity=.8+energy*3.8;hemi.intensity=1.15+energy*.7;rim.intensity=1.1+energy*1.2;
    sun.color.setHSL(.12,.1+(1-daylight)*.65,.88);
    renderer.toneMappingExposure=1.05+energy*.25;
    beamMaterial.uniforms.strength.value=.021*energy;
    beams.rotation.z=(currentHour-10.5)*.065;
    dustMaterial.opacity=.15+energy*.45;dust.rotation.y=time*.008;dust.position.y=Math.sin(time*.12)*.18;
    glowLight.intensity=energy*1.5;gold.emissiveIntensity=.1+energy*.3;
    for(let i=0;i<energyDots.length;i++){energyDots[i].position.copy(curve.getPointAt((time*(.06+energy*.1)+i/energyDots.length)%1));energyDots[i].position.z+=cable.position.z;energyDots[i].visible=energy>.06;}
    led.material.color.set(energy>.1?0xd9fb9a:0x4b5546);
    renderer.render(scene,camera);
    frames++;totalFrameTime+=dt;
    if(frames===180&&!qualityAdjusted){const fps=frames/totalFrameTime;if(fps<40){renderer.setPixelRatio(1);}qualityAdjusted=true;}
    if(frames%60===0){container.dataset.fps=String(Math.round(frames/totalFrameTime));container.dataset.drawCalls=String(renderer.info.render.calls);container.dataset.triangles=String(renderer.info.render.triangles);}
    container.dataset.ready='true';
    state.metrics={drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,approxFps:Math.round(frames/totalFrameTime),pixelRatio:renderer.getPixelRatio()};
  }
  camera.position.set(Math.sin(.68)*(mobile?20:12.5),mobile?13:8.5,Math.cos(.68)*(mobile?20:12.5));
  renderer.setAnimationLoop(frame);
  renderer.domElement.addEventListener('webglcontextlost',(event)=>{event.preventDefault();container.style.opacity='0';document.querySelector('.scene-fallback').hidden=false;});
  renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  return {renderer,scene,camera};
}
