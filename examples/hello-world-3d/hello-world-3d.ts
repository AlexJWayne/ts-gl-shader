// See this example running at:
//
//    https://alexjwayne.github.io/ts-gl-shader/hello-world-3d/
//
//

import { createShaderProgram } from '../../src'

import { mat4 } from '../lib/mat4'

// Pass a 2d coordinate straight through.
const vertSrc = /* glsl */ `
  precision mediump float;
  
  attribute vec3 aVert;
  
  uniform mat4 uProjection;
  uniform mat4 uMatrix;

  varying vec3 vVert;

  void main() {
    vVert = aVert;
    gl_Position = uProjection * uMatrix * vec4(aVert, 1.0);
  }
`

// Mix two colors together in varying amounts over time.
const fragSrc = /* glsl */ `
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
`

function start() {
  const canvas = setupCanvas()
  const gl = getWebGLContext(canvas)

  const cubeVerts = createCube(gl)

  // Create the shader program
  const shader = createShaderProgram(gl, vertSrc, fragSrc)

  // TESTING
  shader.uniforms.uMatrix

  let projection = mat4.perspective(Math.PI * 0.2, canvas.clientWidth / canvas.clientHeight, 1, 2000)
  projection = mat4.translate(projection, 0, 0, -1000)

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let time = performance.now() / 1000

    // Put the cube at [0,0,0] and rotate it over time.
    let cubeMatrix = mat4.translation(0, 0, 0)
    cubeMatrix = mat4.xRotate(cubeMatrix, time * 0.1)
    cubeMatrix = mat4.yRotate(cubeMatrix, time * 0.3)
    cubeMatrix = mat4.zRotate(cubeMatrix, -time * 0.5)
    cubeMatrix = mat4.scale(cubeMatrix, 100, 100, 100)

    // Use the shader program and set its data.
    shader.use()
    shader.attributes.aVert.set(cubeVerts)
    shader.uniforms.uProjection.setArray(projection)
    shader.uniforms.uMatrix.setArray(cubeMatrix)
    shader.uniforms.uMainColor.set(0, 0, 1, 1)
    shader.uniforms.uLineColor.set(1, 0, 1, 1)
    shader.uniforms.uLineWidth.set(0.05)

    // Render
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6)

    // Next frame
    requestAnimationFrame(render)
  }

  // Start rendering
  requestAnimationFrame(render)
}

function createCube(gl: WebGL2RenderingContext): WebGLBuffer {
  const quadBuffer = gl.createBuffer()
  if (!quadBuffer) throw new Error('gl.createBuffer() returned null')

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      //
      -1, -1, 1, 1, -1, 1, 1, 1, 1,
      //
      -1, -1, 1, 1, 1, 1, -1, 1, 1,
      //
      1, -1, 1, 1, -1, -1, 1, 1, -1,
      //
      1, -1, 1, 1, 1, -1, 1, 1, 1,
      //
      1, -1, -1, -1, -1, -1, -1, 1, -1,
      //
      1, -1, -1, -1, 1, -1, 1, 1, -1,
      //
      -1, -1, -1, -1, -1, 1, -1, 1, 1,
      //
      -1, -1, -1, -1, 1, 1, -1, 1, -1,
      //
      -1, 1, 1, 1, 1, 1, 1, 1, -1,
      //
      -1, 1, 1, 1, 1, -1, -1, 1, -1,
      //
      1, -1, 1, -1, -1, -1, 1, -1, -1,
      //
      1, -1, 1, -1, -1, 1, -1, -1, -1,
    ]),

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

  gl.viewport(0, 0, canvas.width, canvas.height)

  gl.enable(gl.DEPTH_TEST)

  return gl
}

start()
