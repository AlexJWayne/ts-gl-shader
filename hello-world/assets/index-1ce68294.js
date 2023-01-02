(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))e(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerpolicy&&(i.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?i.credentials="include":n.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}})();const A={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function s(r,t){const o=r.getError();if(o){const e=["WebGL Error:",t,o,A[o]].filter(n=>n).join(" ");console.error(e)}}function E(r,t,o){const e=o.match(/(?:attribute) \w+ \w+;/g);return e?e.reduce((n,i)=>{var m;const a=i.split(" "),c=a[1],u=a[2].replace(/;$/,""),h=Number((m=c.match(/([234])$/))==null?void 0:m[1])||1,l=r.getAttribLocation(t,u);return s(r,`ShaderProgramObject gl.getAttribLocation() ${u}`),n[u]={type:c,set:b(r,l,h)},n},{}):{}}function b(r,t,o){return e=>{r.bindBuffer(r.ARRAY_BUFFER,e),r.enableVertexAttribArray(t),r.vertexAttribPointer(t,o,r.FLOAT,!1,0,0)}}function p(r,t,o){const e=o.match(/(?:uniform) \w+ \w+;/g);return e?e.reduce((n,i)=>{const a=i.split(" "),c=a[1],u=a[2].replace(/;$/,"");return n[u]=w(r,t,c,u),n},{}):{}}function w(r,t,o,e){const n=r.getUniformLocation(t,e);return s(r,`ShaderProgramObject gl.getUniformLocation() ${e}`),{type:o,set:S(r,n,o)}}function S(r,t,o){if(t===null)return()=>{};switch(o){case"float":return e=>r.uniform1f(t,e);case"int":return e=>r.uniform1i(t,e);case"uint":return e=>r.uniform1ui(t,e);case"bool":return e=>r.uniform1ui(t,e?1:0);case"vec2":return(e,n)=>r.uniform2f(t,e,n);case"vec3":return(e,n,i)=>r.uniform3f(t,e,n,i);case"vec4":return(e,n,i,a)=>r.uniform4f(t,e,n,i,a);case"mat2":return e=>(e.length!==4&&f("mat2",4,e.length),r.uniformMatrix2fv(t,!1,e));case"mat3":return e=>(e.length!==9&&f("mat3",9,e.length),r.uniformMatrix3fv(t,!1,e));case"mat4":return e=>(e.length!==16&&f("mat4",16,e.length),r.uniformMatrix4fv(t,!1,e));default:throw new Error(`Unsupported uniform type ${o}`)}}function f(r,t,o){throw new Error(`Expected an array of length ${t} to set a ${r} uniform. Got ${o}.`)}function g(r,t,o){const e=R(r,t,o),n=P(t,o),i=E(r,e,n),a=p(r,e,n),c={program:e,attributes:i,uniforms:a};return{...c,use:L(r,c,e)}}function L(r,t,o){return e=>{r.useProgram(o),e&&(e(t),r.useProgram(null))}}function P(r,t){return[r,t].join(`
`).replace(/\/\*.*\*\//gms,"").replace(/\/\/.*$/gm,"")}function R(r,t,o){const e=r.createProgram();if(!e)throw new Error("Failed to create empty shader program.");if(r.attachShader(e,d(r,"VERTEX_SHADER",t)),r.attachShader(e,d(r,"FRAGMENT_SHADER",o)),r.linkProgram(e),s(r,"ShaderProgramObject gl.linkProgram()"),r.getProgramParameter(e,r.LINK_STATUS))return e;const i=r.getProgramInfoLog(e);throw new Error(`Failed to link shader program
${i}`)}function d(r,t,o){const e=r.createShader(r[t]);if(!e)throw new Error("Failed to create empty shader.");if(r.shaderSource(e,o),r.compileShader(e),s(r,`ShaderProgramObject gl.compileShader():
${o}`),r.getShaderParameter(e,r.COMPILE_STATUS))return e;const i=r.getShaderInfoLog(e);throw new Error(`Failed to compile ${t}
${i}`)}const F=`
  precision mediump float;
  
  attribute vec2 aVert;
  
  void main() {
    gl_Position = vec4(aVert, 0.0, 1.0);
  }
`,O=`
  precision mediump float;
  
  uniform float uTime;
  uniform vec4 uColorA;
  uniform vec4 uColorB;

  void main() {
    float blending = sin(uTime * 2.0) * 0.5 + 0.5;
    gl_FragColor = mix(uColorA, uColorB, blending);
  }
`;function T(){const r=I(),t=U(r),o=_(t),e=g(t,F,O);function n(){e.use(),e.attributes.aVert.set(o),e.uniforms.uTime.set(performance.now()/1e3),e.uniforms.uColorA.set(1,0,0,1),e.uniforms.uColorB.set(0,0,1,1),t.drawArrays(t.TRIANGLE_FAN,0,4),requestAnimationFrame(n)}requestAnimationFrame(n)}function _(r){const t=r.createBuffer();if(!t)throw new Error("gl.createBuffer() returned null");return r.bindBuffer(r.ARRAY_BUFFER,t),r.bufferData(r.ARRAY_BUFFER,new Float32Array([[-1,-1],[1,-1],[1,1],[-1,1]].flat()),r.STATIC_DRAW),t}function I(){const r=document.getElementById("canvas");if(!r)throw new Error("Unable to find canvas element.");return r.width=window.innerWidth,r.height=window.innerHeight,r}function U(r){const t=r.getContext("webgl2");if(!t)throw new Error("Unable to create WebGL context.");return t}T();
