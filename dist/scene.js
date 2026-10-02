import * as THREE from 'three';

const mix = THREE.MathUtils.lerp;
const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);

export function createSolarScene(container, state, onIntroComplete = () => {}) {
  const introHost = document.querySelector('#intro-scene');
  let introActive = document.documentElement.classList.contains('intro-pending');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  (introActive ? introHost : container).append(renderer.domElement);
  const scene = new THREE.Scene();
  const background = new THREE.Color(0xffffff);
  const night = new THREE.Color(0x050912);
  const white = new THREE.Color(0xf8f3e5);
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const clock = new THREE.Clock();

  // Reflection cards give the glass and aluminum a moving studio highlight.
  const environmentScene = new THREE.Scene();
  environmentScene.background = new THREE.Color(0x677782);
  for (const [x,y,z,w,h,color,rx,ry] of [
    [0,8,0,7,10,0xffffff,-Math.PI/2,0],
    [-7,4,3,5,9,0xfff2cf,0,Math.PI/2],
    [6,2,-5,2,7,0x6585aa,0,0],
  ]) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color, side:THREE.DoubleSide}));
    card.position.set(x,y,z); card.rotation.set(rx,ry,0); environmentScene.add(card);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, .04);
  scene.environment = environment.texture;
  environmentScene.traverse(o => {o.geometry?.dispose(); o.material?.dispose();});
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xe5efff, 0x48536a, 1.25);
  const sun = new THREE.DirectionalLight(0xffe3a9, 3.6);
  sun.position.set(-8,12,5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera, {left:-8,right:8,top:8,bottom:-8,near:.5,far:45});
  sun.shadow.normalBias = .035; sun.shadow.bias = -.00025;
  const rim = new THREE.DirectionalLight(0x9fbcf1, 1.5); rim.position.set(5,3,-7);
  const currentLight = new THREE.PointLight(0xffbc38, 2, 8, 2); currentLight.position.set(0,-.8,3.2);
  scene.add(hemi,sun,rim,currentLight);

  const installation = new THREE.Group(); scene.add(installation);
  const brushing=document.createElement('canvas');brushing.width=256;brushing.height=256;
  const brush=brushing.getContext('2d');brush.fillStyle='#909090';brush.fillRect(0,0,256,256);
  for(let i=0;i<256;i++){brush.fillStyle=`rgba(255,255,255,${.08+.12*Math.sin(i*12.7)**2})`;brush.fillRect(0,i,256,1);}
  const brushTexture=new THREE.CanvasTexture(brushing);brushTexture.wrapS=brushTexture.wrapT=THREE.RepeatWrapping;
  const aluminum = new THREE.MeshStandardMaterial({color:0xd1d8db, metalness:.65, roughness:.3,roughnessMap:brushTexture,envMapIntensity:1.25});
  const charcoal = new THREE.MeshStandardMaterial({color:0x132137, metalness:.45, roughness:.4});
  const stone = new THREE.MeshStandardMaterial({color:0xe9e4d7, metalness:.08, roughness:.55});
  const gold = new THREE.MeshStandardMaterial({color:0xf5bc1c, metalness:.6, roughness:.3});
  function box(w,h,d,material,parent,x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  function roundedBlock(w,h,d,r,material) {
    const x=w/2,z=d/2,shape=new THREE.Shape();
    shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.quadraticCurveTo(x,-z,x,-z+r);
    shape.lineTo(x,z-r);shape.quadraticCurveTo(x,z,x-r,z);shape.lineTo(-x+r,z);
    shape.quadraticCurveTo(-x,z,-x,z-r);shape.lineTo(-x,-z+r);shape.quadraticCurveTo(-x,-z,-x+r,-z);
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:5});
    geometry.rotateX(-Math.PI/2);geometry.translate(0,-h/2,0);
    const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  const base=roundedBlock(7.25,.36,5.65,.13,stone);base.position.y=-.51;installation.add(base);
  const under=roundedBlock(7.12,.15,5.51,.1,charcoal);under.position.y=-.77;installation.add(under);
  const trim=roundedBlock(7.16,.025,5.55,.11,gold);trim.position.y=-.68;installation.add(trim);

  // A micro-texture belongs to each individual silicon wafer, rather than a grid on a flat panel.
  const cellCanvas=document.createElement('canvas');cellCanvas.width=512;cellCanvas.height=512;
  const ctx=cellCanvas.getContext('2d');
  const waferGradient=ctx.createLinearGradient(0,0,512,512);
  waferGradient.addColorStop(0,'#d5e7ee');waferGradient.addColorStop(.45,'#95abb7');waferGradient.addColorStop(1,'#bbd0db');
  ctx.fillStyle=waferGradient;ctx.fillRect(0,0,512,512);
  let seed=419;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<150;i++){
    const x=random()*512,y=random()*512,size=12+random()*65;
    ctx.fillStyle=`rgba(${random()>.5?'255,255,255':'20,40,60'},${.025+random()*.045})`;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size,y+size*.22);ctx.lineTo(x+size*.65,y+size);ctx.closePath();ctx.fill();
  }
  for(let i=0;i<34;i++){ctx.fillStyle='#d7e3e745';ctx.fillRect(0,i*15.5,512,.85);}
  for(const x of [104,256,408]){
    const bus=ctx.createLinearGradient(x-3,0,x+3,0);bus.addColorStop(0,'#6c829280');bus.addColorStop(.5,'#e3ded1bb');bus.addColorStop(1,'#879ca480');
    ctx.fillStyle=bus;ctx.fillRect(x-2,0,4,512);
  }
  const cellTexture=new THREE.CanvasTexture(cellCanvas);cellTexture.colorSpace=THREE.SRGBColorSpace;
  cellTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const silicon=new THREE.MeshPhysicalMaterial({map:cellTexture,metalness:.48,roughness:.27,clearcoat:.7,clearcoatRoughness:.18,envMapIntensity:.75});
  const gasket=new THREE.MeshStandardMaterial({color:0x080e17,roughness:.58,metalness:.15});
  const glassMaterial=new THREE.MeshPhysicalMaterial({color:0xcbe3ec,metalness:.05,roughness:.08,clearcoat:1,clearcoatRoughness:.06,transparent:true,opacity:.15,envMapIntensity:1.7,depthWrite:false});
  const glintUniforms={phase:{value:0},strength:{value:.13}};
  const glintMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:glintUniforms,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform float phase;uniform float strength;void main(){float d=vUv.x*.75+vUv.y*.6-phase;float reflection=exp(-pow(d/.23,2.))+.2*exp(-pow((d-.26)/.018,2.));gl_FragColor=vec4(.83,.93,1.,reflection*strength);}'
  });
  const cw=.224,ch=.211,k=.023,cellShape=new THREE.Shape();
  cellShape.moveTo(-cw/2+k,-ch/2);cellShape.lineTo(cw/2-k,-ch/2);cellShape.lineTo(cw/2,-ch/2+k);
  cellShape.lineTo(cw/2,ch/2-k);cellShape.lineTo(cw/2-k,ch/2);cellShape.lineTo(-cw/2+k,ch/2);
  cellShape.lineTo(-cw/2,ch/2-k);cellShape.lineTo(-cw/2,-ch/2+k);cellShape.closePath();
  const cellGeometry=new THREE.ExtrudeGeometry(cellShape,{depth:.009,bevelEnabled:false,steps:1});
  const pos=cellGeometry.getAttribute('position'),uv=cellGeometry.getAttribute('uv');
  for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/cw+.5,pos.getY(i)/ch+.5);
  cellGeometry.rotateX(-Math.PI/2);
  const matrix=new THREE.Matrix4(),cellColor=new THREE.Color();
  const boltGeometry=new THREE.CylinderGeometry(.027,.027,.024,6);
  function buildPanel(){
    const panel=new THREE.Group();
    // Recessed backsheet, a rubber seal, and four actual aluminum frame extrusions.
    const back=roundedBlock(1.57,.085,2.44,.028,charcoal);panel.add(back);
    box(1.485,.021,2.35,gasket,panel,0,.052,0);
    for(const x of [-.776,.776]){
      box(.046,.135,2.45,aluminum,panel,x,.025,0);
      box(.013,.013,2.44,aluminum,panel,x-Math.sign(x)*.029,.096,0);
    }
    for(const z of [-1.206,1.206])box(1.535,.135,.042,aluminum,panel,0,.025,z);
    const cells=new THREE.InstancedMesh(cellGeometry,silicon,60);
    for(let row=0;row<10;row++)for(let col=0;col<6;col++){
      const i=row*6+col;
      matrix.makeTranslation((col-2.5)*.238,.067,(row-4.5)*.227+(row<5?-.012:.012));cells.setMatrixAt(i,matrix);
      cellColor.setHSL(.57+random()*.06,.34+random()*.1,.16+random()*.09);cells.setColorAt(i,cellColor);
    }
    cells.instanceMatrix.needsUpdate=true;cells.instanceColor.needsUpdate=true;panel.add(cells);
    const cover=box(1.496,.019,2.36,glassMaterial,panel,0,.092,0);cover.castShadow=false;cover.receiveShadow=false;cover.renderOrder=2;
    const sheen=new THREE.Mesh(new THREE.PlaneGeometry(1.48,2.34),glintMaterial);sheen.rotation.x=-Math.PI/2;sheen.position.y=.103;sheen.renderOrder=3;panel.add(sheen);
    const hardware=new THREE.InstancedMesh(boltGeometry,aluminum,4);let index=0;
    for(const x of [-.775,.775])for(const z of [-1.15,1.15]){matrix.makeTranslation(x,.105,z);hardware.setMatrixAt(index++,matrix);}
    panel.add(hardware);
    const junction=box(.25,.08,.18,charcoal,panel,0,-.09,.76);
    panel.userData={cells,cover,sheen,junction};return panel;
  }
  const panels=[];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const module=new THREE.Group();module.userData={row,col};module.position.set((col-1.5)*1.66,0,(row-.5)*2.62);installation.add(module);panels.push(module);
    const panel=buildPanel();panel.position.y=.3;panel.rotation.x=-.27;module.add(panel);
    for(const x of [-.57,.57]){
      box(.075,.3,.075,aluminum,module,x,-.17,-.9);
      box(.075,.81,.075,aluminum,module,x,.075,.92);
      const brace=box(.05,.055,1.89,charcoal,module,x,-.02,0);brace.rotation.x=-.27;
      box(.19,.038,2.08,aluminum,module,x,-.315,0);
      for(const z of [-.85,.85])box(.23,.06,.12,aluminum,module,x,-.29,z);
    }
    const wiring=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.12,.7),new THREE.Vector3(.22,-.08,.5),new THREE.Vector3(.3,-.2,0),new THREE.Vector3(.7,-.3,-.4)]);
    module.add(new THREE.Mesh(new THREE.TubeGeometry(wiring,12,.018,5,false),charcoal));
  }
  // The close-up separates the glass, silicon layer, and frame while keeping the live circuit below.
  const detailPanel=buildPanel();detailPanel.rotation.set(-.27,0,0);detailPanel.position.y=-.03;detailPanel.visible=false;installation.add(detailPanel);
  const inverterGroup=new THREE.Group();inverterGroup.position.set(-2.35,-.42,2.92);installation.add(inverterGroup);
  const inverter=roundedBlock(.64,.57,.19,.07,stone);inverterGroup.add(inverter);
  const ledMaterial=new THREE.MeshBasicMaterial({color:0xffd23d});
  box(.22,.035,.014,ledMaterial,inverterGroup,0,.12,.113);
  for(let i=0;i<4;i++)box(.2,.012,.014,charcoal,inverterGroup,0,-.045-i*.042,.113);

  // A visible energy circuit hangs below the array, with flowing golden packets.
  const circuit=new THREE.Group();installation.add(circuit);
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.35,-.64,3.04),new THREE.Vector3(-2.35,-1.04,3.13),
    new THREE.Vector3(-1.65,-1.08,3.32),new THREE.Vector3(.1,-1.08,3.32),
    new THREE.Vector3(2.6,-1.08,3.32),new THREE.Vector3(3.64,-1.06,2.94),
    new THREE.Vector3(3.82,-1.02,1.9),new THREE.Vector3(3.82,-.9,.85)
  ]);
  const tubeGeometry=new THREE.TubeGeometry(curve,100,.031,8,false);
  const flowUniforms={time:{value:0},power:{value:1},reveal:{value:1}};
  const flowMaterial=new THREE.ShaderMaterial({uniforms:flowUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;uniform float power;uniform float reveal;void main(){float pulse=pow(max(0.,sin((vUv.x*5.-time)*6.28318)),14.);float on=1.-smoothstep(reveal-.025,reveal,vUv.x);vec3 base=vec3(.45,.21,.025);vec3 gold=mix(vec3(1.,.59,.035),vec3(1.,.98,.7),pulse);gl_FragColor=vec4(mix(base,gold,on*(.25+.75*power)),1.);}`});
  circuit.add(new THREE.Mesh(tubeGeometry,flowMaterial));
  const haloMaterial=new THREE.MeshBasicMaterial({color:0xffbc25,transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending});
  circuit.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.085,8,false),haloMaterial));
  const packets=[];
  for(let i=0;i<5;i++){
    const packet=new THREE.Mesh(new THREE.SphereGeometry(.047,8,6),new THREE.MeshBasicMaterial({color:0xffe79b,toneMapped:false}));
    circuit.add(packet);packets.push(packet);
  }
  const platform=new THREE.Group();scene.add(platform);
  const sunCanvas=document.createElement('canvas');sunCanvas.width=sunCanvas.height=512;
  const sunCtx=sunCanvas.getContext('2d'),sunGradient=sunCtx.createRadialGradient(175,130,20,256,256,340);
  sunGradient.addColorStop(0,'#fff1b5');sunGradient.addColorStop(.48,'#f6ce64');sunGradient.addColorStop(.83,'#dca639');sunGradient.addColorStop(1,'#b57619');
  sunCtx.fillStyle=sunGradient;sunCtx.fillRect(0,0,512,512);
  for(const radius of [227,233,246]){sunCtx.beginPath();sunCtx.arc(256,256,radius,0,Math.PI*2);sunCtx.strokeStyle='#fff6ce88';sunCtx.lineWidth=1;sunCtx.stroke();}
  const sunTexture=new THREE.CanvasTexture(sunCanvas);sunTexture.colorSpace=THREE.SRGBColorSpace;
  const platformMaterial=new THREE.MeshStandardMaterial({map:sunTexture,roughness:.42,metalness:.32});
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(5.05,5.12,.18,96),[gold,platformMaterial,charcoal]);disk.position.y=-1.48;disk.receiveShadow=true;platform.add(disk);
  const platformEdge=new THREE.Mesh(new THREE.TorusGeometry(5.06,.022,6,96),gold);platformEdge.rotation.x=Math.PI/2;platformEdge.position.y=-1.408;platform.add(platformEdge);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.13}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.57;floor.receiveShadow=true;scene.add(floor);

  // A soft volumetric shaft travels from the upper left to the actual glass.
  const beamUniforms={strength:{value:0},reach:{value:0}};
  const beamMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:beamUniforms,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform float strength;uniform float reach;void main(){float fromSource=1.-vUv.y;float arriving=1.-smoothstep(reach-.18,reach,fromSource);float edge=pow(sin(vUv.x*3.14159),4.);float fade=.3+.7*vUv.y;gl_FragColor=vec4(1.,.78,.35,edge*fade*arriving*strength);}'
  });
  const beams=new THREE.Group();scene.add(beams);
  for(let i=0;i<3;i++){
    const start=new THREE.Vector3(-11+i*.5,13,4),end=new THREE.Vector3(-1.5+i*1.5,.25,0);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.22,1.1+i*.25,start.distanceTo(end),24,1,true),beamMaterial);
    beam.position.copy(start).add(end).multiplyScalar(.5);beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),start.clone().sub(end).normalize());beams.add(beam);
  }
  const dustPositions=new Float32Array(60*3);
  for(let i=0;i<60;i++){dustPositions[i*3]=(Math.random()-.5)*16;dustPositions[i*3+1]=Math.random()*7;dustPositions[i*3+2]=(Math.random()-.5)*10;}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dustMaterial=new THREE.PointsMaterial({color:0xffcd64,size:.026,transparent:true,opacity:.35,depthWrite:false});
  const dust=new THREE.Points(dustGeometry,dustMaterial);scene.add(dust);

  let width=1,height=1,mobile=false,visible=!document.hidden,time=0,introTime=0,frames=0,totalFrameTime=0;
  let currentProgress=state.progress,currentHour=state.hour,currentBusiness=0,detailAmount=0,qualityAdjusted=false;
  const cameraTarget=new THREE.Vector3();
  function resize(){
    const host=introActive?introHost:container;
    width=host.clientWidth;height=Math.max(1,host.clientHeight);mobile=width<760;
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
  }
  const observer=new ResizeObserver(resize);observer.observe(container);observer.observe(introHost);resize();
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;clock.getDelta();});
  const viewObserver=new IntersectionObserver(([entry])=>{state.onScreen=entry.isIntersecting;},{threshold:0});viewObserver.observe(container);
  function finishIntro(){
    if(!introActive)return;
    introActive=false;container.append(renderer.domElement);resize();
    camera.position.copy(getCameraTarget());onIntroComplete();
    container.dataset.intro='complete';
  }
  function getCameraTarget(){
    const p=currentProgress,angle=.64-p*.85+Math.sin(time*.12)*.025;
    const radius=(mobile?20.8:14)-p*.3+currentBusiness*1.5+detailAmount*.7;
    cameraTarget.set(Math.sin(angle)*radius,(mobile?12.7:7.9)+p*2,Math.cos(angle)*radius);
    cameraTarget.x+=state.pointer.x*.3;cameraTarget.y+=state.pointer.y*.2;return cameraTarget;
  }
  function frame(){
    const rawDelta=clock.getDelta(),dt=Math.min(rawDelta,.05);
    if(!visible||state.galleryOpen||(!introActive&&state.onScreen===false))return;
    const moving=!state.paused;
    if(moving)time+=dt;
    if(introActive)introTime+=Math.min(rawDelta,.1);
    const damping=state.paused?1:1-Math.exp(-dt*6);
    currentProgress=mix(currentProgress,state.progress,damping);
    currentHour=mix(currentHour,state.hour,damping);
    currentBusiness=mix(currentBusiness,state.system==='business'?1:0,damping);
    detailAmount=mix(detailAmount,state.detail?1:0,damping);
    const strike=introActive?smooth(1.55,2.65,introTime):1;
    const dawn=introActive?smooth(3.1,4.4,introTime):1;
    const daylight=Math.max(0,Math.sin((currentHour-6)/12*Math.PI));
    const power=daylight*strike;
    background.copy(night).lerp(white,dawn);renderer.setClearColor(background,introActive?1:0);
    scene.environmentIntensity=introActive?.06+strike*.74:.8;
    if(introActive){
      const angle=.82-smooth(0,4.5,introTime)*.18,radius=mobile?Math.max(23,20/camera.aspect):17.5;
      camera.position.set(Math.sin(angle)*radius,mobile?radius*.48:8.4,Math.cos(angle)*radius);
      camera.lookAt(0,-1.1,0);
      container.dataset.intro=introTime<1.55?'approaching':introTime<3.1?'energizing':'revealing';
      document.querySelector('#solar-intro').style.setProperty('--intro-light',String(strike));
      document.querySelector('#intro-progress').style.transform=`scaleX(${Math.min(1,introTime/4.65)})`;
    }else{
      camera.position.lerp(getCameraTarget(),damping);camera.lookAt(0,mobile?mix(-1.15,-1.25,detailAmount):mix(-1,-.5,detailAmount),0);
    }
    installation.position.y=.08+Math.sin(time*.65)*.045;
    installation.rotation.y=Math.sin(time*.13)*.025;
    platform.scale.set(1+currentBusiness*.14,1,1+currentBusiness*.14);
    base.scale.z=under.scale.z=trim.scale.z=1+currentBusiness*.42;
    panels.forEach((module)=>{const {row}=module.userData;module.visible=detailAmount<.99&&row<(state.system==='business'?3:2);module.scale.setScalar(Math.max(.001,1-detailAmount));module.position.z=(row-(.5+currentBusiness*.5))*(2.62-currentBusiness*.12);});
    detailPanel.visible=detailAmount>.01;
    detailPanel.scale.setScalar(2.6*detailAmount);
    detailPanel.userData.cells.position.y=detailAmount*.17;
    detailPanel.userData.cover.position.y=.092+detailAmount*.44;
    detailPanel.userData.sheen.position.y=.103+detailAmount*.44;
    glintUniforms.phase.value=.45+Math.sin(time*.22)*.34+(currentHour-12)*.024;
    glintUniforms.strength.value=(introActive?strike:1)*(.12+daylight*.13);
    document.querySelector('.stage').style.setProperty('--sun-x',`${18+(currentHour-6)/12*65}%`);
    container.dataset.detail=state.detail?'open':'closed';
    inverterGroup.position.z=2.92+currentBusiness*1.16;circuit.position.z=currentBusiness*1.16;
    const sunAngle=(currentHour-6)/12*Math.PI;
    if(introActive)sun.position.set(-9,12,5);else sun.position.set(-Math.cos(sunAngle)*12,Math.max(1.1,Math.sin(sunAngle)*12),5);
    sun.intensity=introActive?.05+strike*3.5:.6+daylight*3;
    hemi.intensity=introActive?.06+strike*.7+dawn*.45:.72+daylight*.55;
    rim.intensity=introActive?.3+strike*.9:1.15;
    sun.color.setHSL(.115,.22+(1-daylight)*.5,.86);
    renderer.toneMappingExposure=introActive?.7+strike*.3:1.04;
    beamUniforms.strength.value=introActive?(.16*smooth(.5,1.5,introTime))*(1-dawn*.9):0;
    beamUniforms.reach.value=smooth(.55,2.05,introTime)*1.18;
    beams.visible=introActive;
    flowUniforms.time.value=time*(.52+power*.55);
    flowUniforms.power.value=power;
    flowUniforms.reveal.value=introActive?smooth(1.9,3.1,introTime)*1.04:1.04;
    haloMaterial.opacity=.05+power*.2;
    packets.forEach((packet,i)=>{const along=(time*(.1+power*.12)+i/5)%1;packet.position.copy(curve.getPointAt(along));packet.visible=power>.025&&along<flowUniforms.reveal.value;});
    ledMaterial.color.set(power>.1?0xffd643:0x5a4931);
    currentLight.intensity=power*2.5;
    dust.rotation.y=time*.012;dust.position.y=Math.sin(time*.2)*.15;
    dustMaterial.opacity=introActive?.12+strike*.55:.26;
    renderer.render(scene,camera);
    frames++;totalFrameTime+=rawDelta;
    if(frames===180&&!qualityAdjusted){if(frames/totalFrameTime<38)renderer.setPixelRatio(1);qualityAdjusted=true;}
    if(frames%60===0){container.dataset.fps=String(Math.round(frames/totalFrameTime));container.dataset.drawCalls=String(renderer.info.render.calls);container.dataset.triangles=String(renderer.info.render.triangles);}
    container.dataset.ready='true';container.dataset.flow=power>.025?'active':'idle';container.dataset.flowPhase=time.toFixed(3);
    if(introActive&&introTime>=4.65)finishIntro();
  }
  camera.position.copy(getCameraTarget());renderer.setAnimationLoop(frame);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();finishIntro();container.style.opacity='0';document.querySelector('.scene-fallback').hidden=false;});
  renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  return {skipIntro:finishIntro};
}
