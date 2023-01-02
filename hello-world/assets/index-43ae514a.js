(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerpolicy&&(i.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?i.credentials="include":o.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const l={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function u(e,t){const n=e.getError();if(n){const r=["WebGL Error:",t,n,l[n]].filter(o=>o).join(" ");console.error(r)}}function A(e,t,n){const r=n.match(/(?:attribute) \w+ \w+;/g);return r?r.reduce((o,i)=>{var f;const a=i.split(" "),c=a[1],s=a[2].replace(/;$/,""),d=Number((f=c.match(/([234])$/))==null?void 0:f[1])||1,h=e.getAttribLocation(t,s);return u(e,`ShaderProgramObject gl.getAttribLocation() ${s}`),o[s]={type:c,set:b(e,h,d)},o},{}):{}}function b(e,t,n){return r=>{e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(t),e.vertexAttribPointer(t,n,e.FLOAT,!1,0,0)}}function E(e,t,n){const r=n.match(/(?:uniform) \w+ \w+;/g);return r?r.reduce((o,i)=>{const a=i.split(" "),c=a[1],s=a[2].replace(/;$/,"");return o[s]=p(e,t,c,s),o},{}):{}}function p(e,t,n,r){const o=e.getUniformLocation(t,r);return u(e,`ShaderProgramObject gl.getUniformLocation() ${r}`),{type:n,set:S(e,o,n)}}function S(e,t,n){if(t===null)return()=>{};switch(n){case"float":return r=>e.uniform1f(t,r);case"int":return r=>e.uniform1i(t,r);case"uint":return r=>e.uniform1ui(t,r);case"bool":return r=>e.uniform1ui(t,r?1:0);case"vec2":return(r,o)=>e.uniform2f(t,r,o);case"vec3":return(r,o,i)=>e.uniform3f(t,r,o,i);case"vec4":return(r,o,i,a)=>e.uniform4f(t,r,o,i,a);default:throw new Error(`Unsupported uniform type ${n}`)}}function w(e,{vertSrc:t,fragSrc:n}){const r=P(e,t,n),o=g(t,n),i=A(e,r,o),a=E(e,r,o),c={program:r,attributes:i,uniforms:a};return{...c,use:L(e,c,r)}}function L(e,t,n){return r=>{e.useProgram(n),r&&(r(t),e.useProgram(null))}}function g(e,t){return[e,t].join(`
`).replace(/\/\*.*\*\//gms,"").replace(/\/\/.*$/gm,"")}function P(e,t,n){const r=e.createProgram();if(!r)throw new Error("Failed to create empty shader program.");if(e.attachShader(r,m(e,"VERTEX_SHADER",t)),e.attachShader(r,m(e,"FRAGMENT_SHADER",n)),e.linkProgram(r),u(e,"ShaderProgramObject gl.linkProgram()"),e.getProgramParameter(r,e.LINK_STATUS))return r;const i=e.getProgramInfoLog(r);throw new Error(`Failed to link shader program
${i}`)}function m(e,t,n){const r=e.createShader(e[t]);if(!r)throw new Error("Failed to create empty shader.");if(e.shaderSource(r,n),e.compileShader(r),u(e,`ShaderProgramObject gl.compileShader():
${n}`),e.getShaderParameter(r,e.COMPILE_STATUS))return r;const i=e.getShaderInfoLog(r);throw new Error(`Failed to compile ${t}
${i}`)}const R=`
  precision mediump float;
  
  attribute vec2 aVert;
  
  void main() {
    gl_Position = vec4(aVert, 0.0, 1.0);
  }
`,F=`
  precision mediump float;
  
  uniform float uTime;
  uniform vec4 uColorA;
  uniform vec4 uColorB;

  void main() {
    float blending = sin(uTime * 2.0) * 0.5 + 0.5;
    gl_FragColor = mix(uColorA, uColorB, blending);
  }
`;function O(){const e=_(),t=U(e),n=T(t),r=w(t,{vertSrc:R,fragSrc:F});function o(){r.use(),r.attributes.aVert.set(n),r.uniforms.uTime.set(performance.now()/1e3),r.uniforms.uColorA.set(1,0,0,1),r.uniforms.uColorB.set(0,0,1,1),t.drawArrays(t.TRIANGLE_FAN,0,4),requestAnimationFrame(o)}requestAnimationFrame(o)}function T(e){const t=e.createBuffer();if(!t)throw new Error("gl.createBuffer() returned null");return e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([[-1,0,-1],[-1,0,1],[1,0,1],[1,0,-1]].flat()),e.STATIC_DRAW),t}function _(){const e=document.getElementById("canvas");if(!e)throw new Error("Unable to find canvas element.");return e.width=window.innerWidth,e.height=window.innerHeight,e}function U(e){const t=e.getContext("webgl2");if(!t)throw new Error("Unable to create WebGL context.");return t}O();
