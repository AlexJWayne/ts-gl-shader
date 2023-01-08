(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();const W={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function D(r,e){const a=r.getError();if(a){const t=["WebGL Error:",e,a,W[a]].filter(n=>n).join(" ");console.error(t)}}function j(r){return r.replace(/\/\*.*?\*\//gms,"").replace(/\/\/.*$/gm,"")}function $(r,e){const a=r==="attribute"?/(?:attribute)(?:\s+(?:lowp|mediump|highp))?\s+(\w+)\s+(\w+)\s*;/gm:/(?:uniform)(?:\s+(?:lowp|mediump|highp))?\s+(\w+)\s+(\w+)\s*;/gm;return Array.from(e.matchAll(a)).map(n=>{const o=n[1],c=n[2];return{qualifier:r,type:o,identifier:c.replace(/;$/,"")}})}function G(r,e,a){return $("attribute",a).reduce((n,o)=>{var f;const{type:c,identifier:i}=o,m=Number((f=c.match(/([234])$/))==null?void 0:f[1])||1,s=r.getAttribLocation(e,i);return D(r,`ShaderProgramObject gl.getAttribLocation() ${i}`),n[i]={type:c,location:s,set:H(r,s,m)},n},{})}function H(r,e,a){return t=>{r.bindBuffer(r.ARRAY_BUFFER,t),r.enableVertexAttribArray(e),r.vertexAttribPointer(e,a,r.FLOAT,!1,0,0)}}const N={current:!1};function z(r,e,a){return $("uniform",a).reduce((n,o)=>{const{type:c,identifier:i}=o;return n[i]=K(r,e,c,i),n},{})}function K(r,e,a,t){const n=r.getUniformLocation(e,t);D(r,`createShaderProgram gl.getUniformLocation() ${t}`);const o=N.current?i=>{c.value=typeof i[Symbol.iterator]=="function"?[...i]:i}:void 0,c={type:a,location:n,set:Y(r,n,a,o),setArray:k(r,n,a,t,o),value:void 0};return c}function Y(r,e,a,t){if(e===null)return()=>{};switch(a){case"float":return n=>{r.uniform1f(e,n),t&&t(n)};case"int":return n=>{r.uniform1i(e,n),t&&t(n)};case"uint":return n=>{r.uniform1ui(e,n),t&&t(n)};case"bool":return n=>{r.uniform1ui(e,n?1:0),t&&t(n?1:0)};case"vec2":return(n,o)=>{r.uniform2f(e,n,o),t&&t([n,o])};case"vec3":return(n,o,c)=>{r.uniform3f(e,n,o,c),t&&t([n,o,c])};case"vec4":return(n,o,c,i)=>{r.uniform4f(e,n,o,c,i),t&&t([n,o,c,i])}}return null}function k(r,e,a,t,n){if(e===null)return()=>{};switch(a){case"vec2":return o=>{o.length!==2&&h("vec2",t,2,o.length),r.uniform2fv(e,o),n&&n(o)};case"vec3":return o=>{o.length!==3&&h("vec3",t,3,o.length),r.uniform3fv(e,o),n&&n(o)};case"vec4":return o=>{o.length!==4&&h("vec4",t,4,o.length),r.uniform4fv(e,o),n&&n(o)};case"mat2":return o=>{o.length!==4&&h("mat2",t,4,o.length),r.uniformMatrix2fv(e,!1,o),n&&n(o)};case"mat3":return o=>{o.length!==9&&h("mat3",t,9,o.length),r.uniformMatrix3fv(e,!1,o),n&&n(o)};case"mat4":return o=>{o.length!==16&&h("mat4",t,16,o.length),r.uniformMatrix4fv(e,!1,o),n&&n(o)}}return null}function h(r,e,a,t){throw new Error(`Expected an array of length ${a} for "uniform ${r} ${e};". Got ${t}.`)}function B(r,e,a){const t=J(r,e,a),n=X(e,a),o=G(r,t,n),c=z(r,t,n),i={program:t,attributes:o,uniforms:c};return{...i,use:q(r,i,t)}}function q(r,e,a){return t=>{r.useProgram(a),t&&(t(e),r.useProgram(null))}}function X(r,e){return j([r,e].join(`
`))}function J(r,e,a){const t=r.createProgram();if(!t)throw new Error("Failed to create empty shader program.");if(r.attachShader(t,S(r,"VERTEX_SHADER",e)),r.attachShader(t,S(r,"FRAGMENT_SHADER",a)),r.linkProgram(t),D(r,"ShaderProgramObject gl.linkProgram()"),r.getProgramParameter(t,r.LINK_STATUS))return t;const o=r.getProgramInfoLog(t);throw new Error(`Failed to link shader program
${o}`)}function S(r,e,a){const t=r.createShader(r[e]);if(!t)throw new Error("Failed to create empty shader.");if(r.shaderSource(t,a),r.compileShader(t),D(r,`ShaderProgramObject gl.compileShader():
${a}`),r.getShaderParameter(t,r.COMPILE_STATUS))return t;const o=r.getShaderInfoLog(t);throw new Error(`Failed to compile ${e}
${o}`)}B.enableTestMode=()=>{N.current=!0};B.disableTestMode=()=>{N.current=!1};const u={perspective:function(r,e,a,t){var n=Math.tan(Math.PI*.5-.5*r),o=1/(a-t);return[n/e,0,0,0,0,n,0,0,0,0,(a+t)*o,-1,0,0,a*t*o*2,0]},projection:function(r,e,a){return[2/r,0,0,0,0,-2/e,0,0,0,0,2/a,0,-1,1,0,1]},multiply:function(r,e){var a=r[0],t=r[0*4+1],n=r[0*4+2],o=r[0*4+3],c=r[1*4+0],i=r[1*4+1],m=r[1*4+2],s=r[1*4+3],f=r[2*4+0],l=r[2*4+1],v=r[2*4+2],p=r[2*4+3],A=r[3*4+0],E=r[3*4+1],b=r[3*4+2],g=r[3*4+3],R=e[0*4+0],d=e[0*4+1],w=e[0*4+2],y=e[0*4+3],L=e[1*4+0],M=e[1*4+1],P=e[1*4+2],F=e[1*4+3],T=e[2*4+0],_=e[2*4+1],O=e[2*4+2],I=e[2*4+3],U=e[3*4+0],V=e[3*4+1],x=e[3*4+2],C=e[3*4+3];return[R*a+d*c+w*f+y*A,R*t+d*i+w*l+y*E,R*n+d*m+w*v+y*b,R*o+d*s+w*p+y*g,L*a+M*c+P*f+F*A,L*t+M*i+P*l+F*E,L*n+M*m+P*v+F*b,L*o+M*s+P*p+F*g,T*a+_*c+O*f+I*A,T*t+_*i+O*l+I*E,T*n+_*m+O*v+I*b,T*o+_*s+O*p+I*g,U*a+V*c+x*f+C*A,U*t+V*i+x*l+C*E,U*n+V*m+x*v+C*b,U*o+V*s+x*p+C*g]},translation:function(r,e,a){return[1,0,0,0,0,1,0,0,0,0,1,0,r,e,a,1]},xRotation:function(r){var e=Math.cos(r),a=Math.sin(r);return[1,0,0,0,0,e,a,0,0,-a,e,0,0,0,0,1]},yRotation:function(r){var e=Math.cos(r),a=Math.sin(r);return[e,0,-a,0,0,1,0,0,a,0,e,0,0,0,0,1]},zRotation:function(r){var e=Math.cos(r),a=Math.sin(r);return[e,a,0,0,-a,e,0,0,0,0,1,0,0,0,0,1]},scaling:function(r,e,a){return[r,0,0,0,0,e,0,0,0,0,a,0,0,0,0,1]},translate:function(r,e,a,t){return u.multiply(r,u.translation(e,a,t))},xRotate:function(r,e){return u.multiply(r,u.xRotation(e))},yRotate:function(r,e){return u.multiply(r,u.yRotation(e))},zRotate:function(r,e){return u.multiply(r,u.zRotation(e))},scale:function(r,e,a,t){return u.multiply(r,u.scaling(e,a,t))}},Q=`
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
`;function rr(){const r=tr(),e=nr(r),a=er(e),t=B(e,Q,Z);t.uniforms.uMatrix;let n=u.perspective(Math.PI*.2,r.clientWidth/r.clientHeight,1,2e3);n=u.translate(n,0,0,-1e3);function o(){e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);let c=performance.now()/1e3,i=u.translation(0,0,0);i=u.xRotate(i,c*.1),i=u.yRotate(i,c*.3),i=u.zRotate(i,-c*.5),i=u.scale(i,100,100,100),t.use(),t.attributes.aVert.set(a),t.uniforms.uProjection.setArray(n),t.uniforms.uMatrix.setArray(i),t.uniforms.uMainColor.set(0,0,1,1),t.uniforms.uLineColor.set(1,0,1,1),t.uniforms.uLineWidth.set(.05),e.drawArrays(e.TRIANGLES,0,6*6),requestAnimationFrame(o)}requestAnimationFrame(o)}function er(r){const e=r.createBuffer();if(!e)throw new Error("gl.createBuffer() returned null");return r.bindBuffer(r.ARRAY_BUFFER,e),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1]),r.STATIC_DRAW),e}function tr(){const r=document.getElementById("canvas");if(!r)throw new Error("Unable to find canvas element.");return r.width=window.innerWidth,r.height=window.innerHeight,r}function nr(r){const e=r.getContext("webgl2");if(!e)throw new Error("Unable to create WebGL context.");return e.viewport(0,0,r.width,r.height),e.enable(e.DEPTH_TEST),e}rr();
