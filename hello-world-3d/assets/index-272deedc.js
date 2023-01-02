(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerpolicy&&(a.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?a.credentials="include":o.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const B={1280:"INVALID_ENUM",1281:"INVALID_VALUE",1282:"INVALID_OPERATION",1283:"STACK_OVERFLOW",1284:"STACK_UNDERFLOW",1285:"OUT_OF_MEMORY",1286:"INVALID_FRAMEBUFFER_OPERATION",1287:"CONTEXT_LOST"};function V(r,e){const n=r.getError();if(n){const t=["WebGL Error:",e,n,B[n]].filter(o=>o).join(" ");console.error(t)}}function $(r,e,n){const t=n.match(/(?:attribute) \w+ \w+;/g);return t?t.reduce((o,a)=>{var f;const i=a.split(" "),c=i[1],s=i[2].replace(/;$/,""),m=Number((f=c.match(/([234])$/))==null?void 0:f[1])||1,l=r.getAttribLocation(e,s);return V(r,`ShaderProgramObject gl.getAttribLocation() ${s}`),o[s]={type:c,set:D(r,l,m)},o},{}):{}}function D(r,e,n){return t=>{r.bindBuffer(r.ARRAY_BUFFER,t),r.enableVertexAttribArray(e),r.vertexAttribPointer(e,n,r.FLOAT,!1,0,0)}}function j(r,e,n){const t=n.match(/(?:uniform) \w+ \w+;/g);return t?t.reduce((o,a)=>{const i=a.split(" "),c=i[1],s=i[2].replace(/;$/,"");return o[s]=W(r,e,c,s),o},{}):{}}function W(r,e,n,t){const o=r.getUniformLocation(e,t);return V(r,`ShaderProgramObject gl.getUniformLocation() ${t}`),{type:n,set:G(r,o,n)}}function G(r,e,n){if(e===null)return()=>{};switch(n){case"float":return t=>r.uniform1f(e,t);case"int":return t=>r.uniform1i(e,t);case"uint":return t=>r.uniform1ui(e,t);case"bool":return t=>r.uniform1ui(e,t?1:0);case"vec2":return(t,o)=>r.uniform2f(e,t,o);case"vec3":return(t,o,a)=>r.uniform3f(e,t,o,a);case"vec4":return(t,o,a,i)=>r.uniform4f(e,t,o,a,i);case"mat2":return t=>(t.length!==4&&C("mat2",4,t.length),r.uniformMatrix2fv(e,!1,t));case"mat3":return t=>(t.length!==9&&C("mat3",9,t.length),r.uniformMatrix3fv(e,!1,t));case"mat4":return t=>(t.length!==16&&C("mat4",16,t.length),r.uniformMatrix4fv(e,!1,t));default:throw new Error(`Unsupported uniform type ${n}`)}}function C(r,e,n){throw new Error(`Expected an array of length ${e} to set a ${r} uniform. Got ${n}.`)}function z(r,e,n){const t=q(r,e,n),o=k(e,n),a=$(r,t,o),i=j(r,t,o),c={program:t,attributes:a,uniforms:i};return{...c,use:H(r,c,t)}}function H(r,e,n){return t=>{r.useProgram(n),t&&(t(e),r.useProgram(null))}}function k(r,e){return[r,e].join(`
`).replace(/\/\*.*\*\//gms,"").replace(/\/\/.*$/gm,"")}function q(r,e,n){const t=r.createProgram();if(!t)throw new Error("Failed to create empty shader program.");if(r.attachShader(t,N(r,"VERTEX_SHADER",e)),r.attachShader(t,N(r,"FRAGMENT_SHADER",n)),r.linkProgram(t),V(r,"ShaderProgramObject gl.linkProgram()"),r.getProgramParameter(t,r.LINK_STATUS))return t;const a=r.getProgramInfoLog(t);throw new Error(`Failed to link shader program
${a}`)}function N(r,e,n){const t=r.createShader(r[e]);if(!t)throw new Error("Failed to create empty shader.");if(r.shaderSource(t,n),r.compileShader(t),V(r,`ShaderProgramObject gl.compileShader():
${n}`),r.getShaderParameter(t,r.COMPILE_STATUS))return t;const a=r.getShaderInfoLog(t);throw new Error(`Failed to compile ${e}
${a}`)}const u={perspective:function(r,e,n,t){var o=Math.tan(Math.PI*.5-.5*r),a=1/(n-t);return[o/e,0,0,0,0,o,0,0,0,0,(n+t)*a,-1,0,0,n*t*a*2,0]},projection:function(r,e,n){return[2/r,0,0,0,0,-2/e,0,0,0,0,2/n,0,-1,1,0,1]},multiply:function(r,e){var n=r[0],t=r[0*4+1],o=r[0*4+2],a=r[0*4+3],i=r[1*4+0],c=r[1*4+1],s=r[1*4+2],m=r[1*4+3],l=r[2*4+0],f=r[2*4+1],h=r[2*4+2],d=r[2*4+3],v=r[3*4+0],p=r[3*4+1],E=r[3*4+2],A=r[3*4+3],b=e[0*4+0],R=e[0*4+1],w=e[0*4+2],L=e[0*4+3],S=e[1*4+0],g=e[1*4+1],P=e[1*4+2],y=e[1*4+3],M=e[2*4+0],F=e[2*4+1],O=e[2*4+2],_=e[2*4+3],T=e[3*4+0],I=e[3*4+1],U=e[3*4+2],x=e[3*4+3];return[b*n+R*i+w*l+L*v,b*t+R*c+w*f+L*p,b*o+R*s+w*h+L*E,b*a+R*m+w*d+L*A,S*n+g*i+P*l+y*v,S*t+g*c+P*f+y*p,S*o+g*s+P*h+y*E,S*a+g*m+P*d+y*A,M*n+F*i+O*l+_*v,M*t+F*c+O*f+_*p,M*o+F*s+O*h+_*E,M*a+F*m+O*d+_*A,T*n+I*i+U*l+x*v,T*t+I*c+U*f+x*p,T*o+I*s+U*h+x*E,T*a+I*m+U*d+x*A]},translation:function(r,e,n){return[1,0,0,0,0,1,0,0,0,0,1,0,r,e,n,1]},xRotation:function(r){var e=Math.cos(r),n=Math.sin(r);return[1,0,0,0,0,e,n,0,0,-n,e,0,0,0,0,1]},yRotation:function(r){var e=Math.cos(r),n=Math.sin(r);return[e,0,-n,0,0,1,0,0,n,0,e,0,0,0,0,1]},zRotation:function(r){var e=Math.cos(r),n=Math.sin(r);return[e,n,0,0,-n,e,0,0,0,0,1,0,0,0,0,1]},scaling:function(r,e,n){return[r,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1]},translate:function(r,e,n,t){return u.multiply(r,u.translation(e,n,t))},xRotate:function(r,e){return u.multiply(r,u.xRotation(e))},yRotate:function(r,e){return u.multiply(r,u.yRotation(e))},zRotate:function(r,e){return u.multiply(r,u.zRotation(e))},scale:function(r,e,n,t){return u.multiply(r,u.scaling(e,n,t))}},K=`
  precision mediump float;
  
  attribute vec3 aVert;
  
  uniform mat4 uProjection;
  uniform mat4 uMatrix;

  varying vec3 vVert;

  void main() {
    vVert = aVert;
    gl_Position = uProjection * uMatrix * vec4(aVert, 1.0);
  }
`,Y=`
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
`;function X(){const r=Q(),e=Z(r),n=J(e),t=z(e,K,Y);t.uniforms.uMatrix;let o=u.perspective(Math.PI*.2,r.clientWidth/r.clientHeight,1,2e3);o=u.translate(o,0,0,-1e3);function a(){e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);let i=performance.now()/1e3,c=u.translation(0,0,0);c=u.xRotate(c,i*.1),c=u.yRotate(c,i*.3),c=u.zRotate(c,-i*.5),c=u.scale(c,100,100,100),t.use(),t.attributes.aVert.set(n),t.uniforms.uProjection.set(o),t.uniforms.uMatrix.set(c),t.uniforms.uMainColor.set(0,0,1,1),t.uniforms.uLineColor.set(1,0,1,1),t.uniforms.uLineWidth.set(.05),e.drawArrays(e.TRIANGLES,0,6*6),requestAnimationFrame(a)}requestAnimationFrame(a)}function J(r){const e=r.createBuffer();if(!e)throw new Error("gl.createBuffer() returned null");return r.bindBuffer(r.ARRAY_BUFFER,e),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1]),r.STATIC_DRAW),e}function Q(){const r=document.getElementById("canvas");if(!r)throw new Error("Unable to find canvas element.");return r.width=window.innerWidth,r.height=window.innerHeight,r}function Z(r){const e=r.getContext("webgl2");if(!e)throw new Error("Unable to create WebGL context.");return e.viewport(0,0,r.width,r.height),e.enable(e.DEPTH_TEST),e}X();
