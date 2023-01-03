(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerpolicy&&(a.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?a.credentials="include":t.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(t){if(t.ep)return;t.ep=!0;const a=o(t);fetch(t.href,a)}})();const $={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function C(r,e){const o=r.getError();if(o){const n=["WebGL Error:",e,o,$[o]].filter(t=>t).join(" ");console.error(n)}}function B(r,e,o){const n=o.match(/(?:attribute) \w+ \w+;/g);return n?n.reduce((t,a)=>{var f;const i=a.split(" "),c=i[1],s=i[2].replace(/;$/,""),m=Number((f=c.match(/([234])$/))==null?void 0:f[1])||1,h=r.getAttribLocation(e,s);return C(r,`ShaderProgramObject gl.getAttribLocation() ${s}`),t[s]={type:c,set:D(r,h,m)},t},{}):{}}function D(r,e,o){return n=>{r.bindBuffer(r.ARRAY_BUFFER,n),r.enableVertexAttribArray(e),r.vertexAttribPointer(e,o,r.FLOAT,!1,0,0)}}function j(r,e,o){const n=o.match(/(?:uniform) \w+ \w+;/g);return n?n.reduce((t,a)=>{const i=a.split(" "),c=i[1],s=i[2].replace(/;$/,"");return t[s]=W(r,e,c,s),t},{}):{}}function W(r,e,o,n){const t=r.getUniformLocation(e,n);return C(r,`ShaderProgramObject gl.getUniformLocation() ${n}`),{type:o,set:G(r,t,o,n),setArray:z(r,t,o,n)}}function G(r,e,o,n){if(e===null)return()=>{};switch(o){case"float":return t=>r.uniform1f(e,t);case"int":return t=>r.uniform1i(e,t);case"uint":return t=>r.uniform1ui(e,t);case"bool":return t=>r.uniform1ui(e,t?1:0);case"vec2":return(t,a)=>r.uniform2f(e,t,a);case"vec3":return(t,a,i)=>r.uniform3f(e,t,a,i);case"vec4":return(t,a,i,c)=>r.uniform4f(e,t,a,i,c);case"mat2":return t=>{t.length!==4&&l("mat2",n,4,t.length),r.uniformMatrix2fv(e,!1,t)};case"mat3":return t=>{t.length!==9&&l("mat3",n,9,t.length),r.uniformMatrix3fv(e,!1,t)};case"mat4":return t=>{t.length!==16&&l("mat4",n,16,t.length),r.uniformMatrix4fv(e,!1,t)};default:throw new Error(`Unsupported uniform type ${o}`)}}function z(r,e,o,n){if(e===null)return()=>{};switch(o){case"vec2":return t=>{t.length!==2&&l("vec2",n,2,t.length),r.uniform2fv(e,t)};case"vec3":return t=>{t.length!==3&&l("vec3",n,3,t.length),r.uniform3fv(e,t)};case"vec4":return t=>{t.length!==4&&l("vec4",n,4,t.length),r.uniform4fv(e,t)}}return null}function l(r,e,o,n){throw new Error(`Expected an array of length ${o} for "${r} uniform ${e}". Got ${n}.`)}function H(r,e,o){const n=K(r,e,o),t=q(e,o),a=B(r,n,t),i=j(r,n,t),c={program:n,attributes:a,uniforms:i};return{...c,use:k(r,c,n)}}function k(r,e,o){return n=>{r.useProgram(o),n&&(n(e),r.useProgram(null))}}function q(r,e){return[r,e].join(`
`).replace(/\/\*.*\*\//gms,"").replace(/\/\/.*$/gm,"")}function K(r,e,o){const n=r.createProgram();if(!n)throw new Error("Failed to create empty shader program.");if(r.attachShader(n,N(r,"VERTEX_SHADER",e)),r.attachShader(n,N(r,"FRAGMENT_SHADER",o)),r.linkProgram(n),C(r,"ShaderProgramObject gl.linkProgram()"),r.getProgramParameter(n,r.LINK_STATUS))return n;const a=r.getProgramInfoLog(n);throw new Error(`Failed to link shader program
${a}`)}function N(r,e,o){const n=r.createShader(r[e]);if(!n)throw new Error("Failed to create empty shader.");if(r.shaderSource(n,o),r.compileShader(n),C(r,`ShaderProgramObject gl.compileShader():
${o}`),r.getShaderParameter(n,r.COMPILE_STATUS))return n;const a=r.getShaderInfoLog(n);throw new Error(`Failed to compile ${e}
${a}`)}const u={perspective:function(r,e,o,n){var t=Math.tan(Math.PI*.5-.5*r),a=1/(o-n);return[t/e,0,0,0,0,t,0,0,0,0,(o+n)*a,-1,0,0,o*n*a*2,0]},projection:function(r,e,o){return[2/r,0,0,0,0,-2/e,0,0,0,0,2/o,0,-1,1,0,1]},multiply:function(r,e){var o=r[0],n=r[0*4+1],t=r[0*4+2],a=r[0*4+3],i=r[1*4+0],c=r[1*4+1],s=r[1*4+2],m=r[1*4+3],h=r[2*4+0],f=r[2*4+1],d=r[2*4+2],v=r[2*4+3],p=r[3*4+0],A=r[3*4+1],E=r[3*4+2],b=r[3*4+3],w=e[0*4+0],R=e[0*4+1],g=e[0*4+2],S=e[0*4+3],L=e[1*4+0],P=e[1*4+1],y=e[1*4+2],M=e[1*4+3],F=e[2*4+0],O=e[2*4+1],_=e[2*4+2],T=e[2*4+3],U=e[3*4+0],I=e[3*4+1],x=e[3*4+2],V=e[3*4+3];return[w*o+R*i+g*h+S*p,w*n+R*c+g*f+S*A,w*t+R*s+g*d+S*E,w*a+R*m+g*v+S*b,L*o+P*i+y*h+M*p,L*n+P*c+y*f+M*A,L*t+P*s+y*d+M*E,L*a+P*m+y*v+M*b,F*o+O*i+_*h+T*p,F*n+O*c+_*f+T*A,F*t+O*s+_*d+T*E,F*a+O*m+_*v+T*b,U*o+I*i+x*h+V*p,U*n+I*c+x*f+V*A,U*t+I*s+x*d+V*E,U*a+I*m+x*v+V*b]},translation:function(r,e,o){return[1,0,0,0,0,1,0,0,0,0,1,0,r,e,o,1]},xRotation:function(r){var e=Math.cos(r),o=Math.sin(r);return[1,0,0,0,0,e,o,0,0,-o,e,0,0,0,0,1]},yRotation:function(r){var e=Math.cos(r),o=Math.sin(r);return[e,0,-o,0,0,1,0,0,o,0,e,0,0,0,0,1]},zRotation:function(r){var e=Math.cos(r),o=Math.sin(r);return[e,o,0,0,-o,e,0,0,0,0,1,0,0,0,0,1]},scaling:function(r,e,o){return[r,0,0,0,0,e,0,0,0,0,o,0,0,0,0,1]},translate:function(r,e,o,n){return u.multiply(r,u.translation(e,o,n))},xRotate:function(r,e){return u.multiply(r,u.xRotation(e))},yRotate:function(r,e){return u.multiply(r,u.yRotation(e))},zRotate:function(r,e){return u.multiply(r,u.zRotation(e))},scale:function(r,e,o,n){return u.multiply(r,u.scaling(e,o,n))}},Y=`
  precision mediump float;
  
  attribute vec3 aVert;
  
  uniform mat4 uProjection;
  uniform mat4 uMatrix;

  varying vec3 vVert;

  void main() {
    vVert = aVert;
    gl_Position = uProjection * uMatrix * vec4(aVert, 1.0);
  }
`,X=`
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
`;function J(){const r=Z(),e=rr(r),o=Q(e),n=H(e,Y,X);n.uniforms.uMatrix;let t=u.perspective(Math.PI*.2,r.clientWidth/r.clientHeight,1,2e3);t=u.translate(t,0,0,-1e3);function a(){e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);let i=performance.now()/1e3,c=u.translation(0,0,0);c=u.xRotate(c,i*.1),c=u.yRotate(c,i*.3),c=u.zRotate(c,-i*.5),c=u.scale(c,100,100,100),n.use(),n.attributes.aVert.set(o),n.uniforms.uProjection.set(t),n.uniforms.uMatrix.set(c),n.uniforms.uMainColor.set(0,0,1,1),n.uniforms.uLineColor.set(1,0,1,1),n.uniforms.uLineWidth.set(.05),e.drawArrays(e.TRIANGLES,0,6*6),requestAnimationFrame(a)}requestAnimationFrame(a)}function Q(r){const e=r.createBuffer();if(!e)throw new Error("gl.createBuffer() returned null");return r.bindBuffer(r.ARRAY_BUFFER,e),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1]),r.STATIC_DRAW),e}function Z(){const r=document.getElementById("canvas");if(!r)throw new Error("Unable to find canvas element.");return r.width=window.innerWidth,r.height=window.innerHeight,r}function rr(r){const e=r.getContext("webgl2");if(!e)throw new Error("Unable to create WebGL context.");return e.viewport(0,0,r.width,r.height),e.enable(e.DEPTH_TEST),e}J();
