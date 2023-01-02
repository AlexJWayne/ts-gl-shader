import { GlslVarsInfo } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'

// 2x2 matrix = 4 elements
export type Mat2v = [number, number, number, number]

// 3x3 matrix = 9 elements
export type Mat3v = [number, number, number, number, number, number, number, number, number]

// 4x4 matrix = 16 elements
export type Mat4v = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export type UniformSetterArgs = {
  float: [n: number]
  bool: [bool: boolean]
  int: [n: number]
  uint: [n: number]
  vec2: [x: number, y: number]
  vec3: [x: number, y: number, z: number]
  vec4: [x: number, y: number, z: number, w: number]
  mat2: [values2x2: Mat2v | Float32Array]
  mat3: [values3x3: Mat3v | Float32Array]
  mat4: [values4x4: Mat4v | Float32Array]
  // TODO: matrix types?
}

/** Type of the `uniforms` property of the shader object. */
export type ShaderUniforms<T extends GlslVarsInfo<string, 'uniform'>> = {
  [K in keyof T & string]: T[K] extends keyof UniformSetterArgs //
    ? ShaderUniform<T[K]>
    : never
}

/** Type of one uniform. */
export type ShaderUniform<TType extends keyof UniformSetterArgs> = {
  type: TType
  set(...values: UniformSetterArgs[TType]): void
}

export function createUniforms<
  ShaderSrc extends string,
  Return extends ShaderUniforms<GlslVarsInfo<ShaderSrc, 'uniform'>>,
>(gl: WebGL2RenderingContext, program: WebGLProgram, shaderSrc: ShaderSrc): Return {
  const uniformDeclarations = shaderSrc.match(/(?:uniform) \w+ \w+;/g)
  if (!uniformDeclarations) return {} as Return

  return uniformDeclarations.reduce((uniforms, uniformDeclaration) => {
    const tokens = uniformDeclaration.split(' ') as ['uniform', keyof UniformSetterArgs, string]
    const type = tokens[1]
    const name = tokens[2].replace(/;$/, '') as keyof Return & string

    uniforms[name] = createUniform(gl, program, type, name) as any
    return uniforms
  }, {} as any)
}

export function createUniform<GlslType extends keyof UniformSetterArgs>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: GlslType,
  name: string,
) {
  const location = gl.getUniformLocation(program, name)
  handleGlError(gl, `ShaderProgramObject gl.getUniformLocation() ${name}`)

  return {
    type,
    set: createUniformSetter(gl, location, type),
  }
}

function createUniformSetter<T extends keyof UniformSetterArgs>(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  type: T,
) {
  if (location === null) return () => undefined

  switch (type) {
    case 'float':
      return (n: number) => gl.uniform1f(location, n)

    case 'int':
      return (n: number) => gl.uniform1i(location, n)

    case 'uint':
      return (n: number) => gl.uniform1ui(location, n)

    case 'bool':
      return (boolean: boolean) => gl.uniform1ui(location, boolean ? 1 : 0)

    case 'vec2':
      return (x: number, y: number) => gl.uniform2f(location, x, y)

    case 'vec3':
      return (x: number, y: number, z: number) => gl.uniform3f(location, x, y, z)

    case 'vec4':
      return (x: number, y: number, z: number, w: number) => gl.uniform4f(location, x, y, z, w)

    case 'mat2':
      return (values: Mat2v | Float32Array) => {
        if (values.length !== 4) throwIncorrectLengthError('mat2', 4, values.length)
        return gl.uniformMatrix2fv(location, false, values)
      }

    case 'mat3':
      return (values: Mat3v | Float32Array) => {
        if (values.length !== 9) throwIncorrectLengthError('mat3', 9, values.length)
        return gl.uniformMatrix3fv(location, false, values)
      }

    case 'mat4':
      return (values: Mat4v | Float32Array) => {
        if (values.length !== 16) throwIncorrectLengthError('mat4', 16, values.length)
        return gl.uniformMatrix4fv(location, false, values)
      }

    default:
      throw new Error(`Unsupported uniform type ${type}`)
  }
}

function throwIncorrectLengthError(glslType: string, expectedLength: number, actualLength: number) {
  throw new Error(`Expected an array of length ${expectedLength} to set a ${glslType} uniform. Got ${actualLength}.`)
}
