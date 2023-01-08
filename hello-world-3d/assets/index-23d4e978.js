(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))e(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&e(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function e(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();const W={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function D(r,t){const a=r.getError();if(a){const e=["WebGL Error:",t,a,W[a]].filter(n=>n).join(" ");console.error(e)}}function j(r){return r.replace(/\/\*.*?\*\//gms,"").replace(/\/\/.*$/gm,"")}function $(r,t){const a=r==="attribute"?/(?:attribute)\s+\w+\s+\w+\s*;/gm:/(?:uniform)\s+\w+\s+\w+\s*;/gm;return(t.match(a)??[]).map(n=>{const o=n.split(/\s+/gm).map(c=>c.trim());return{qualifier:r,type:o[1],identifier:o[2].replace(/;$/,"")}})}function G(r,t,a){return $("attribute",a).reduce((n,o)=>{var f;const{type:c,identifier:i}=o,m=Number((f=c.match(/([234])$/))==null?void 0:f[1])||1,s=r.getAttribLocation(t,i);return D(r,`ShaderProgramObject gl.getAttribLocation() ${i}`),n[i]={type:c,location:s,set:H(r,s,m)},n},{})}function H(r,t,a){return e=>{r.bindBuffer(r.ARRAY_BUFFER,e),r.enableVertexAttribArray(t),r.vertexAttribPointer(t,a,r.FLOAT,!1,0,0)}}const N={current:!1};function k(r,t,a){return $("uniform",a).reduce((n,o)=>{const{type:c,identifier:i}=o;return n[i]=z(r,t,c,i),n},{})}function z(r,t,a,e){const n=r.getUniformLocation(t,e);D(r,`createShaderProgram gl.getUniformLocation() ${e}`);const o=N.current?i=>{c.value=typeof i[Symbol.iterator]=="function"?[...i]:i}:void 0,c={type:a,location:n,set:K(r,n,a,o),setArray:Y(r,n,a,e,o),value:void 0};return c}function K(r,t,a,e){if(t===null)return()=>{};switch(a){case"float":return n=>{r.uniform1f(t,n),e&&e(n)};case"int":return n=>{r.uniform1i(t,n),e&&e(n)};case"uint":return n=>{r.uniform1ui(t,n),e&&e(n)};case"bool":return n=>{r.uniform1ui(t,n?1:0),e&&e(n?1:0)};case"vec2":return(n,o)=>{r.uniform2f(t,n,o),e&&e([n,o])};case"vec3":return(n,o,c)=>{r.uniform3f(t,n,o,c),e&&e([n,o,c])};case"vec4":return(n,o,c,i)=>{r.uniform4f(t,n,o,c,i),e&&e([n,o,c,i])}}return null}function Y(r,t,a,e,n){if(t===null)return()=>{};switch(a){case"vec2":return o=>{o.length!==2&&l("vec2",e,2,o.length),r.uniform2fv(t,o),n&&n(o)};case"vec3":return o=>{o.length!==3&&l("vec3",e,3,o.length),r.uniform3fv(t,o),n&&n(o)};case"vec4":return o=>{o.length!==4&&l("vec4",e,4,o.length),r.uniform4fv(t,o),n&&n(o)};case"mat2":return o=>{o.length!==4&&l("mat2",e,4,o.length),r.uniformMatrix2fv(t,!1,o),n&&n(o)};case"mat3":return o=>{o.length!==9&&l("mat3",e,9,o.length),r.uniformMatrix3fv(t,!1,o),n&&n(o)};case"mat4":return o=>{o.length!==16&&l("mat4",e,16,o.length),r.uniformMatrix4fv(t,!1,o),n&&n(o)}}return null}function l(r,t,a,e){throw new Error(`Expected an array of length ${a} for "uniform ${r} ${t};". Got ${e}.`)}function B(r,t,a){const e=J(r,t,a),n=X(t,a),o=G(r,e,n),c=k(r,e,n),i={program:e,attributes:o,uniforms:c};return{...i,use:q(r,i,e)}}function q(r,t,a){return e=>{r.useProgram(a),e&&(e(t),r.useProgram(null))}}function X(r,t){return j([r,t].join(`
`))}function J(r,t,a){const e=r.createProgram();if(!e)throw new Error("Failed to create empty shader program.");if(r.attachShader(e,S(r,"VERTEX_SHADER",t)),r.attachShader(e,S(r,"FRAGMENT_SHADER",a)),r.linkProgram(e),D(r,"ShaderProgramObject gl.linkProgram()"),r.getProgramParameter(e,r.LINK_STATUS))return e;const o=r.getProgramInfoLog(e);throw new Error(`Failed to link shader program
${o}`)}function S(r,t,a){const e=r.createShader(r[t]);if(!e)throw new Error("Failed to create empty shader.");if(r.shaderSource(e,a),r.compileShader(e),D(r,`ShaderProgramObject gl.compileShader():
${a}`),r.getShaderParameter(e,r.COMPILE_STATUS))return e;const o=r.getShaderInfoLog(e);throw new Error(`Failed to compile ${t}
${o}`)}B.enableTestMode=()=>{N.current=!0};B.disableTestMode=()=>{N.current=!1};const u={perspective:function(r,t,a,e){var n=Math.tan(Math.PI*.5-.5*r),o=1/(a-e);return[n/t,0,0,0,0,n,0,0,0,0,(a+e)*o,-1,0,0,a*e*o*2,0]},projection:function(r,t,a){return[2/r,0,0,0,0,-2/t,0,0,0,0,2/a,0,-1,1,0,1]},multiply:function(r,t){var a=r[0],e=r[0*4+1],n=r[0*4+2],o=r[0*4+3],c=r[1*4+0],i=r[1*4+1],m=r[1*4+2],s=r[1*4+3],f=r[2*4+0],h=r[2*4+1],v=r[2*4+2],p=r[2*4+3],A=r[3*4+0],E=r[3*4+1],b=r[3*4+2],R=r[3*4+3],g=t[0*4+0],d=t[0*4+1],w=t[0*4+2],L=t[0*4+3],y=t[1*4+0],M=t[1*4+1],P=t[1*4+2],F=t[1*4+3],T=t[2*4+0],_=t[2*4+1],O=t[2*4+2],I=t[2*4+3],U=t[3*4+0],V=t[3*4+1],x=t[3*4+2],C=t[3*4+3];return[g*a+d*c+w*f+L*A,g*e+d*i+w*h+L*E,g*n+d*m+w*v+L*b,g*o+d*s+w*p+L*R,y*a+M*c+P*f+F*A,y*e+M*i+P*h+F*E,y*n+M*m+P*v+F*b,y*o+M*s+P*p+F*R,T*a+_*c+O*f+I*A,T*e+_*i+O*h+I*E,T*n+_*m+O*v+I*b,T*o+_*s+O*p+I*R,U*a+V*c+x*f+C*A,U*e+V*i+x*h+C*E,U*n+V*m+x*v+C*b,U*o+V*s+x*p+C*R]},translation:function(r,t,a){return[1,0,0,0,0,1,0,0,0,0,1,0,r,t,a,1]},xRotation:function(r){var t=Math.cos(r),a=Math.sin(r);return[1,0,0,0,0,t,a,0,0,-a,t,0,0,0,0,1]},yRotation:function(r){var t=Math.cos(r),a=Math.sin(r);return[t,0,-a,0,0,1,0,0,a,0,t,0,0,0,0,1]},zRotation:function(r){var t=Math.cos(r),a=Math.sin(r);return[t,a,0,0,-a,t,0,0,0,0,1,0,0,0,0,1]},scaling:function(r,t,a){return[r,0,0,0,0,t,0,0,0,0,a,0,0,0,0,1]},translate:function(r,t,a,e){return u.multiply(r,u.translation(t,a,e))},xRotate:function(r,t){return u.multiply(r,u.xRotation(t))},yRotate:function(r,t){return u.multiply(r,u.yRotation(t))},zRotate:function(r,t){return u.multiply(r,u.zRotation(t))},scale:function(r,t,a,e){return u.multiply(r,u.scaling(t,a,e))}},Q=`
  precision mediump float;
  
  attribute vec3 aVert;
  
  uniform mat4 uProjection;
  uniform mat4 uMatrix;

  varying vec3 vVert;

  void main() {
    vVert = aVert;
    gl_Position = uProjection * uMatrix * vec4(aVert, 1.0);
  }
`,Z=`
  precision mediump float;
  
  uniform vec4 uMainColor;
  uniform vec4 uLineColor;

  uniform float uLineWidth;

  varying vec3 vVert;

  float lines(float val) {
    val += 0.5;
    return step(mod(val, 1.0), uLineWidth);
  }

  void main() {
    float linesAlpha =
      lines(vVert.x) +
      lines(vVert.y) +
      lines(vVert.z);

    linesAlpha = clamp(linesAlpha, 0.0, 1.0);
    gl_FragColor = mix(uMainColor, uLineColor, linesAlpha);
  }
`;function rr(){const r=er(),t=nr(r),a=tr(t),e=B(t,Q,Z);e.uniforms.uMatrix;let n=u.perspective(Math.PI*.2,r.clientWidth/r.clientHeight,1,2e3);n=u.translate(n,0,0,-1e3);function o(){t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);let c=performance.now()/1e3,i=u.translation(0,0,0);i=u.xRotate(i,c*.1),i=u.yRotate(i,c*.3),i=u.zRotate(i,-c*.5),i=u.scale(i,100,100,100),e.use(),e.attributes.aVert.set(a),e.uniforms.uProjection.setArray(n),e.uniforms.uMatrix.setArray(i),e.uniforms.uMainColor.set(0,0,1,1),e.uniforms.uLineColor.set(1,0,1,1),e.uniforms.uLineWidth.set(.05),t.drawArrays(t.TRIANGLES,0,6*6),requestAnimationFrame(o)}requestAnimationFrame(o)}function tr(r){const t=r.createBuffer();if(!t)throw new Error("gl.createBuffer() returned null");return r.bindBuffer(r.ARRAY_BUFFER,t),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1]),r.STATIC_DRAW),t}function er(){const r=document.getElementById("canvas");if(!r)throw new Error("Unable to find canvas element.");return r.width=window.innerWidth,r.height=window.innerHeight,r}function nr(r){const t=r.getContext("webgl2");if(!t)throw new Error("Unable to create WebGL context.");return t.viewport(0,0,r.width,r.height),t.enable(t.DEPTH_TEST),t}rr();
