// See this example running at:
//
//    https://alexjwayne.github.io/ts-gl-shader/hello-world/
//
//

import { createShaderProgram } from '../../src'

// Pass a 2d coordinate straight through.
const vertSrc = /* glsl */ `
  precision mediump float;
  
  attribute vec2 aVert;
  
  void main() {
    gl_Position = vec4(aVert, 0.0, 1.0);
  }
`

// Mix two colors together in varying amounts over time.
const fragSrc = /* glsl */ `
  precision mediump float;
  
  uniform float uTime;
  uniform vec4 uColorA;
  uniform vec4 uColorB;

  void main() {
    float blending = sin(uTime * 2.0) * 0.5 + 0.5;
    gl_FragColor = mix(uColorA, uColorB, blending);
  }
`

function start() {
  const canvas = setupCanvas()
  const gl = getWebGLContext(canvas)

  const buffer = createQuad(gl)

  // Create the shader program
  const shader = createShaderProgram(gl, vertSrc, fragSrc)

  function render() {
    // Use the shader program and set its data
    shader.use()
    shader.attributes.aVert.set(buffer)
    shader.uniforms.uTime.set(performance.now() / 1000)
    shader.uniforms.uColorA.set(1, 0, 0, 1)
    shader.uniforms.uColorB.set(0, 0, 1, 1)

    // Render
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    // Next frame
    requestAnimationFrame(render)
  }

  // Start rendering
  requestAnimationFrame(render)
}

function createQuad(gl: WebGL2RenderingContext): WebGLBuffer {
  const quadBuffer = gl.createBuffer()
  if (!quadBuffer) throw new Error('gl.createBuffer() returned null')

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].flat(),
    ),
    gl.STATIC_DRAW,
  )

  return quadBuffer
}

function setupCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) throw new Error('Unable to find canvas element.')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  return canvas
}

function getWebGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')
  if (!gl) throw new Error('Unable to create WebGL context.')
  return gl
}

start()
