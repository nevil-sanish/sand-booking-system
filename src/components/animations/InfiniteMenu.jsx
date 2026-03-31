import { useEffect, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import './InfiniteMenu.css';

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
#define PI 3.141593
void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }
    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;
    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

class Face { constructor(a, b, c) { this.a = a; this.b = b; this.c = c; } }
class Vertex { constructor(x, y, z) { this.position = vec3.fromValues(x, y, z); this.normal = vec3.create(); this.uv = vec2.create(); } }
class Geometry {
  constructor() { this.vertices = []; this.faces = []; }
  addVertex(...args) { for (let i=0; i<args.length; i+=3) this.vertices.push(new Vertex(args[i], args[i+1], args[i+2])); return this; }
  addFace(...args) { for (let i=0; i<args.length; i+=3) this.faces.push(new Face(args[i], args[i+1], args[i+2])); return this; }
  get lastVertex() { return this.vertices[this.vertices.length - 1]; }
  subdivide(divisions=1) {
    const cache = {}; let f = this.faces;
    for (let div=0; div<divisions; ++div) {
      const newFaces = new Array(f.length * 4);
      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, cache); const mBC = this.getMidPoint(face.b, face.c, cache); const mCA = this.getMidPoint(face.c, face.a, cache);
        const i = ndx * 4;
        newFaces[i] = new Face(face.a, mAB, mCA); newFaces[i+1] = new Face(face.b, mBC, mAB); newFaces[i+2] = new Face(face.c, mCA, mBC); newFaces[i+3] = new Face(mAB, mBC, mCA);
      });
      f = newFaces;
    }
    this.faces = f; return this;
  }
  spherize(radius=1) { this.vertices.forEach(v => { vec3.normalize(v.normal, v.position); vec3.scale(v.position, v.normal, radius); }); return this; }
  get data() { return { vertices: this.vertexData, indices: this.indexData, normals: this.normalData, uvs: this.uvData }; }
  get vertexData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.position))); }
  get normalData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal))); }
  get uvData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv))); }
  get indexData() { return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c])); }
  getMidPoint(a, b, cache) {
    const key = a < b ? `k_${b}_${a}` : `k_${a}_${b}`;
    if (cache.hasOwnProperty(key)) return cache[key];
    const posA = this.vertices[a].position; const posB = this.vertices[b].position; const ndx = this.vertices.length;
    cache[key] = ndx; this.addVertex((posA[0]+posB[0])*0.5, (posA[1]+posB[1])*0.5, (posA[2]+posB[2])*0.5); return ndx;
  }
}
class IcosahedronGeometry extends Geometry {
  constructor() {
    super(); const t = Math.sqrt(5)*0.5 + 0.5;
    this.addVertex(-1,t,0, 1,t,0, -1,-t,0, 1,-t,0, 0,-1,t, 0,1,t, 0,-1,-t, 0,1,-t, t,0,-1, t,0,1, -t,0,-1, -t,0,1)
        .addFace(0,11,5, 0,5,1, 0,1,7, 0,7,10, 0,10,11, 1,5,9, 5,11,4, 11,10,2, 10,7,6, 7,1,8, 3,9,4, 3,4,2, 3,2,6, 3,6,8, 3,8,9, 4,9,5, 2,4,11, 6,2,10, 8,6,7, 9,8,1);
  }
}
class DiscGeometry extends Geometry {
  constructor(steps=4, radius=1) {
    super(); steps = Math.max(4, steps); const alpha = (2*Math.PI)/steps;
    this.addVertex(0,0,0); this.lastVertex.uv[0]=0.5; this.lastVertex.uv[1]=0.5;
    for(let i=0; i<steps; ++i) {
      const x = Math.cos(alpha*i); const y = Math.sin(alpha*i);
      this.addVertex(radius*x, radius*y, 0); this.lastVertex.uv[0]=x*0.5+0.5; this.lastVertex.uv[1]=y*0.5+0.5;
      if (i>0) this.addFace(0, i, i+1);
    }
    this.addFace(0, steps, 1);
  }
}
function createProgram(gl, shaders, varyings, attribs) {
  const p = gl.createProgram();
  shaders.forEach((src, ndx) => {
    const s = gl.createShader(ndx ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
    gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(p, s);
  });
  for(let a in attribs) gl.bindAttribLocation(p, attribs[a], a);
  gl.linkProgram(p); return p;
}
function makeVertexArray(gl, attrs, indices) {
  const va = gl.createVertexArray(); gl.bindVertexArray(va);
  for(const [b, l, n] of attrs) {
    if (l === -1) continue; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
  }
  if (indices) {
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null); return va;
}
function makeBuffer(gl, data, usage) { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); return b; }

class ArcballControl {
  constructor(canvas, updateCb) {
    this.canvas = canvas; this.cb = updateCb; this.isPointerDown = false;
    this.orientation = quat.create(); this.pointerRotation = quat.create(); this._combinedQuat = quat.create();
    this.rotationAxis = vec3.fromValues(1,0,0); this.snapDirection = vec3.fromValues(0,0,-1);
    this.pointerPos = vec2.create(); this.prevPos = vec2.create(); this._rv = 0; this.rotationVelocity = 0;
    canvas.addEventListener('pointerdown', e => { vec2.set(this.pointerPos, e.clientX, e.clientY); vec2.copy(this.prevPos, this.pointerPos); this.isPointerDown = true; });
    canvas.addEventListener('pointerup', () => this.isPointerDown = false);
    canvas.addEventListener('pointerleave', () => this.isPointerDown = false);
    canvas.addEventListener('pointermove', e => { if (this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY); });
    canvas.style.touchAction = 'none';
  }
  update(dt) {
    const ts = dt/16 + 0.00001; let af = ts; let snR = quat.create();
    if (this.isPointerDown) {
      const mid = vec2.sub(vec2.create(), this.pointerPos, this.prevPos); vec2.scale(mid, mid, 0.3*ts);
      if (vec2.sqrLen(mid) > 0.1) {
        vec2.add(mid, this.prevPos, mid);
        const a = vec3.normalize(vec3.create(), this.proj(mid)); const b = vec3.normalize(vec3.create(), this.proj(this.prevPos));
        vec2.copy(this.prevPos, mid); af *= (5/ts); this.quatFrom(a, b, this.pointerRotation, af);
      } else quat.slerp(this.pointerRotation, this.pointerRotation, quat.create(), 0.3*ts);
    } else {
      quat.slerp(this.pointerRotation, this.pointerRotation, quat.create(), 0.1*ts);
      if (this.snapTarget) {
        let df = Math.max(0.1, 1 - vec3.sqrDist(this.snapTarget, this.snapDirection)*10);
        af *= 0.2 * df; this.quatFrom(this.snapTarget, this.snapDirection, snR, af);
      }
    }
    const combQuat = quat.multiply(quat.create(), snR, this.pointerRotation);
    this.orientation = quat.normalize(quat.create(), quat.multiply(quat.create(), combQuat, this.orientation));
    quat.normalize(this._combinedQuat, quat.slerp(this._combinedQuat, this._combinedQuat, combQuat, 0.8*ts));
    const rad = Math.acos(this._combinedQuat[3])*2.0; const s = Math.sin(rad/2.0);
    let rv = 0; if (s > 0.000001) { rv = rad/(2*Math.PI); this.rotationAxis[0]=this._combinedQuat[0]/s; this.rotationAxis[1]=this._combinedQuat[1]/s; this.rotationAxis[2]=this._combinedQuat[2]/s; }
    this._rv += (rv - this._rv)*0.5*ts; this.rotationVelocity = this._rv/ts; this.cb(dt);
  }
  quatFrom(a, b, out, af) { const axis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b)); quat.setAxisAngle(out, axis, Math.acos(Math.max(-1, Math.min(1, vec3.dot(a, b))))*af); }
  proj(p) {
    const w = this.canvas.clientWidth; const h = this.canvas.clientHeight; const s = Math.max(w,h)-1;
    const x = (2*p[0]-w-1)/s; const y = (2*p[1]-h-1)/s; const xySq = x*x+y*y; const rSq = 4;
    let z = xySq <= rSq/2 ? Math.sqrt(rSq-xySq) : rSq/Math.sqrt(xySq); return vec3.fromValues(-x, y, z);
  }
}

class InfiniteGridMenu {
  constructor(canvas, items, onActive, onMove, scale) {
    this.canvas = canvas; this.items = items; this.onActive = onActive; this.onMove = onMove; this.scale = scale;
    this.c = { m: mat4.create(), vn: mat4.create(), p: mat4.create(), pos: [0,0,3*scale], up: [0,1,0] };
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false }); this.gl = gl;
    this.prog = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, { aModelPosition:0, aModelNormal:1, aModelUvs:2, aInstanceMatrix:3 });
    this.locs = { uWm: gl.getUniformLocation(this.prog, 'uWorldMatrix'), uVm: gl.getUniformLocation(this.prog, 'uViewMatrix'), uPm: gl.getUniformLocation(this.prog, 'uProjectionMatrix'), uCam: gl.getUniformLocation(this.prog, 'uCameraPosition'), uRav: gl.getUniformLocation(this.prog, 'uRotationAxisVelocity'), uItemCount: gl.getUniformLocation(this.prog, 'uItemCount'), uAtlasSize: gl.getUniformLocation(this.prog, 'uAtlasSize'), uTex: gl.getUniformLocation(this.prog, 'uTex') };
    const geo = new DiscGeometry(56, 1); const iGeo = new IcosahedronGeometry(); iGeo.subdivide(1).spherize(2);
    this.discVAO = makeVertexArray(gl, [[makeBuffer(gl, geo.vertexData, gl.STATIC_DRAW), 0, 3], [makeBuffer(gl, geo.uvData, gl.STATIC_DRAW), 2, 2]], geo.indexData);
    this.icnt = iGeo.vertices.length; this.ipos = iGeo.vertices.map(v => v.position);
    this.imats = new Float32Array(this.icnt * 16); this.imatsArr = []; this.ibuf = gl.createBuffer();
    for(let i=0; i<this.icnt; ++i) { const ma = new Float32Array(this.imats.buffer, i*64, 16); ma.set(mat4.create()); this.imatsArr.push(ma); }
    gl.bindVertexArray(this.discVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.ibuf); gl.bufferData(gl.ARRAY_BUFFER, 64*this.icnt, gl.DYNAMIC_DRAW);
    for(let j=0; j<4; ++j) { gl.enableVertexAttribArray(3+j); gl.vertexAttribPointer(3+j, 4, gl.FLOAT, false, 64, j*16); gl.vertexAttribDivisor(3+j, 1); }
    this.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    this.atlasSize = Math.ceil(Math.sqrt(Math.max(1, items.length))); const cv = document.createElement('canvas'); cv.width = cv.height = this.atlasSize*512; const ctx = cv.getContext('2d');
    Promise.all(items.map(i => new Promise(res => { const img = new Image(); img.crossOrigin='anonymous'; img.onload=()=>res(img); img.src = i.image || 'https://picsum.photos/512/512?grayscale'; }))).then(imgs => {
      imgs.forEach((img, i) => ctx.drawImage(img, (i%this.atlasSize)*512, Math.floor(i/this.atlasSize)*512, 512, 512));
      gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv); gl.generateMipmap(gl.TEXTURE_2D);
    });
    this.ctrl = new ArcballControl(canvas, dt => this.updateControl(dt));
    this.wm = mat4.create(); this.time = 0; this.frames = 0;
  }
  resize() {
    const gl = this.gl; const w = gl.canvas.clientWidth*2, h = gl.canvas.clientHeight*2;
    if (gl.canvas.width !== w || gl.canvas.height !== h) { gl.canvas.width = w; gl.canvas.height = h; gl.viewport(0,0,w,h); }
    const a = w/h; const d = this.c.pos[2]; const fov = 2*Math.atan((2*0.35)/(a>1?d:(a*d)));
    mat4.perspective(this.c.p, fov, a, 0.1, 40);
  }
  update(time) {
    const dt = Math.min(32, time - this.time); this.time = time; this.frames++;
    this.ctrl.update(dt);
    const pos = this.ipos.map(p => vec3.transformQuat(vec3.create(), p, this.ctrl.orientation));
    pos.forEach((p, i) => {
      const s = ((Math.abs(p[2])/2)*0.6 + 0.4) * 0.25;
      const m = mat4.create(); mat4.translate(m, m, vec3.negate(vec3.create(), p)); mat4.targetTo(m, [0,0,0], p, [0,1,0]); mat4.scale(m, m, [s,s,s]); mat4.translate(m, m, [0,0,-2]);
      mat4.copy(this.imatsArr[i], m);
    });
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.ibuf); this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.imats);
    mat4.targetTo(this.c.m, this.c.pos, [0,0,0], this.c.up); mat4.invert(this.c.vn, this.c.m);
    
    const gl = this.gl; gl.useProgram(this.prog); gl.enable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.locs.uWm, false, this.wm); gl.uniformMatrix4fv(this.locs.uVm, false, this.c.vn); gl.uniformMatrix4fv(this.locs.uPm, false, this.c.p);
    gl.uniform3f(this.locs.uCam, this.c.pos[0], this.c.pos[1], this.c.pos[2]);
    gl.uniform4f(this.locs.uRav, this.ctrl.rotationAxis[0], this.ctrl.rotationAxis[1], this.ctrl.rotationAxis[2], this.ctrl.rotationVelocity*1.1);
    gl.uniform1i(this.locs.uItemCount, this.items.length); gl.uniform1i(this.locs.uAtlasSize, this.atlasSize);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(this.locs.uTex, 0);
    gl.bindVertexArray(this.discVAO); gl.drawElementsInstanced(gl.TRIANGLES, 56*3, gl.UNSIGNED_SHORT, 0, this.icnt);
    requestAnimationFrame(t => this.update(t));
  }
  updateControl(dt) {
    const isMoving = this.ctrl.isPointerDown || Math.abs(this.ctrl.rotationVelocity) > 0.01;
    if (isMoving !== this.isM) { this.isM = isMoving; this.onMove(isMoving); }
    if (!this.ctrl.isPointerDown) {
      const invO = quat.conjugate(quat.create(), this.ctrl.orientation);
      const nt = vec3.transformQuat(vec3.create(), this.ctrl.snapDirection, invO);
      let mD = -1, ni;
      this.ipos.forEach((p, i) => { const d = vec3.dot(nt, p); if(d>mD){ mD=d; ni=i; } });
      this.onActive(ni % Math.max(1, this.items.length));
      this.ctrl.snapTarget = vec3.normalize(vec3.create(), vec3.transformQuat(vec3.create(), this.ipos[ni], this.ctrl.orientation));
    }
  }
}

export default function InfiniteMenu({ items = [], scale = 1.0 }) {
  const canvasRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    let sketch; const cv = canvasRef.current;
    if (cv) {
      const dfItems = items.length ? items : [{ image: "https://picsum.photos/900/900?grayscale", link: "#", title: "", description: "" }];
      sketch = new InfiniteGridMenu(cv, dfItems, i => setActiveItem(dfItems[i]), setIsMoving, scale);
      sketch.resize(); sketch.update(0);
      const hr = () => sketch.resize(); window.addEventListener('resize', hr);
      return () => window.removeEventListener('resize', hr);
    }
  }, [items, scale]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas id="infinite-grid-menu-canvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {activeItem && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', zIndex: 10 }}>
          <h2 className={`face-title ${isMoving ? 'inactive' : 'active'}`}>{activeItem.title}</h2>
          <p className={`face-description ${isMoving ? 'inactive' : 'active'}`}>{activeItem.description}</p>
          <div onClick={() => window.open(activeItem.link, '_blank')} className={`action-button ${isMoving ? 'inactive' : 'active'}`}>
            <p className="action-button-icon">&#x2197;</p>
          </div>
        </div>
      )}
    </div>
  );
}
