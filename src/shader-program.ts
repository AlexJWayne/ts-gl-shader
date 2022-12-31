import { createAttributes, type ShaderAttributes } from './attribute'
import { GlslVarsInfo } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'
import { RemoveComments, Resolve } from './lib/utility-types'
import { createUniforms, type ShaderUniforms } from './uniform'

export type ShaderProgramInternal<
  VertSrc extends string,
  FragSrc extends string,
  TCombinedSrc extends string = RemoveComments<`${VertSrc}\n${FragSrc}`>,
> = {
  program: WebGLProgram
  attributes: ShaderAttributes<GlslVarsInfo<TCombinedSrc, 'attribute'>>
  uniforms: ShaderUniforms<GlslVarsInfo<TCombinedSrc, 'uniform'>>
}

export type ShaderProgram<VertSrc extends string, FragSrc extends string> = Resolve<
  ShaderProgramInternal<VertSrc, FragSrc> & {
    use(fn?: (program: Omit<ShaderProgram<VertSrc, FragSrc>, 'use'>) => void): void
  }
>

export function createShaderProgram<VertSrc extends string, FragSrc extends string>(
  gl: WebGL2RenderingContext,
  { vertSrc, fragSrc }: { vertSrc: VertSrc; fragSrc: FragSrc },
): ShaderProgram<VertSrc, FragSrc> {
  const glProgram = createProgram(gl, vertSrc, fragSrc)

  const combinedSrc = combineShaderSource(vertSrc, fragSrc)
  const attributes = createAttributes(gl, glProgram, combinedSrc)
  const uniforms = createUniforms(gl, glProgram, combinedSrc)

  const shaderProgram: ShaderProgramInternal<VertSrc, FragSrc> = {
    program: glProgram,
    attributes,
    uniforms,
  }
  return {
    ...shaderProgram,
    use: createUse(gl, shaderProgram, glProgram),
  } as ShaderProgram<VertSrc, FragSrc>
}

/** Returns a function that prepares this shader program for rendering. */
function createUse<T extends ShaderProgramInternal<string, string>>(
  gl: WebGL2RenderingContext,
  shaderProgram: T,
  glProgram: WebGLProgram,
) {
  return (fn?: (shaderProgram: T) => void): void => {
    gl.useProgram(glProgram)
    if (fn) {
      fn(shaderProgram)
      gl.useProgram(null)
    }
  }
}

/** Combine vertex and fragment shader sources into one string with comments removed. */
function combineShaderSource<
  VertSrc extends string,
  FragSrc extends string,
  Return = RemoveComments<`${VertSrc}\n${FragSrc}`>,
>(vertSrc: VertSrc, fragSrc: FragSrc): Return {
  return [vertSrc, fragSrc]
    .join('\n')
    .replace(/\/\*.*\*\//gms, '')
    .replace(/\/\/.*$/gm, '') as Return
}

/** Create a program from a vertex shader and a fragment shader source. */
function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  // Create a shader program object to store the combined shader program.
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) throw new Error('Failed to create empty shader program.')

  // Attach a vertex shader.
  gl.attachShader(shaderProgram, createShader(gl, 'VERTEX_SHADER', vertSrc))

  // Attach a fragment shader.
  gl.attachShader(shaderProgram, createShader(gl, 'FRAGMENT_SHADER', fragSrc))

  // Link both the programs.
  gl.linkProgram(shaderProgram)
  handleGlError(gl, 'ShaderProgramObject gl.linkProgram()')

  // Check for success and return the program.
  const success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)
  if (success) return shaderProgram

  // Report failure.
  const errorMessage = gl.getProgramInfoLog(shaderProgram)
  throw new Error(`Failed to link shader program\n${errorMessage}`)
}

/** Compile a shader and return a handle to it. */
function createShader(gl: WebGL2RenderingContext, type: 'VERTEX_SHADER' | 'FRAGMENT_SHADER', src: string): WebGLShader {
  // Create an empty shader object.
  const shader = gl.createShader(gl[type])
  if (!shader) throw new Error('Failed to create empty shader.')

  // Add the sahder source code.
  gl.shaderSource(shader, src)

  // Compile the shader.
  gl.compileShader(shader)
  handleGlError(gl, `ShaderProgramObject gl.compileShader():\n${src}`)

  // Check for success and return the shader.
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader

  // Report failure.
  const errorMessage = gl.getShaderInfoLog(shader)
  throw new Error(`Failed to compile ${type}\n${errorMessage}`)
}