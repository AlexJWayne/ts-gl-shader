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
}

export type UniformSetterArrayArgs = {
  vec2: UniformSetterArgs['vec2'] | Float32Array | Float64Array
  vec3: UniformSetterArgs['vec3'] | Float32Array | Float64Array
  vec4: UniformSetterArgs['vec4'] | Float32Array | Float64Array

  mat2: Mat2v | Float32Array | Float64Array
  mat3: Mat3v | Float32Array | Float64Array
  mat4: Mat4v | Float32Array | Float64Array
}

/** Type of the `uniforms` property of the shader object. */
export type ShaderUniforms<T extends GlslVarsInfo<string, 'uniform'>> = {
  [K in keyof T & string]: T[K] extends { type: keyof UniformSetterArgs } //
    ? ShaderUniform<T[K]['type']>
    : never
}

/** Type of one uniform. */
export type ShaderUniform<TType extends keyof UniformSetterArgs | keyof UniformSetterArrayArgs> = {
  type: TType
  location: WebGLUniformLocation
} & (TType extends keyof UniformSetterArgs
  ? {
      set(...values: UniformSetterArgs[TType]): void
    }
  : {}) &
  (TType extends keyof UniformSetterArrayArgs
    ? {
        setArray(values: TType extends keyof UniformSetterArrayArgs ? UniformSetterArrayArgs[TType] : never): void
      }
    : {})

export function createUniforms<
  ShaderSrc extends string,
  Return extends ShaderUniforms<GlslVarsInfo<ShaderSrc, 'uniform'>>,
>(gl: WebGL2RenderingContext, program: WebGLProgram, shaderSrc: ShaderSrc): Return {
  const uniformDeclarations = shaderSrc.match(/(?:uniform)\s+\w+\s+\w+\s*;/gm)
  if (!uniformDeclarations) return {} as Return

  return uniformDeclarations.reduce((uniforms, uniformDeclaration) => {
    const tokens = uniformDeclaration.split(/\s+/gm).map((s) => s.trim()) as [
      'uniform',
      keyof UniformSetterArgs,
      string,
    ]
    const type = tokens[1]
    const identifier = tokens[2].replace(/;$/, '')

    uniforms[identifier] = createUniform(gl, program, type, identifier) as any
    return uniforms
  }, {} as any)
}

export function createUniform<GlslType extends keyof UniformSetterArgs>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: GlslType,
  identifier: string,
) {
  const location = gl.getUniformLocation(program, identifier)
  handleGlError(gl, `ShaderProgramObject gl.getUniformLocation() ${identifier}`)

  return {
    type,
    location,
    set: createUniformSetter(gl, location, type),
    setArray: createUniformArraySetter(gl, location, type, identifier),
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
  }

  return null
}

function createUniformArraySetter<T extends keyof UniformSetterArgs>(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  type: T,
  identifier: string,
) {
  if (location === null) return () => undefined

  switch (type) {
    case 'vec2':
      return (values: UniformSetterArrayArgs['vec2']) => {
        if (values.length !== 2) throwIncorrectLengthError('vec2', identifier, 2, values.length)
        gl.uniform2fv(location, values)
      }

    case 'vec3':
      return (values: UniformSetterArrayArgs['vec3']) => {
        if (values.length !== 3) throwIncorrectLengthError('vec3', identifier, 3, values.length)
        gl.uniform3fv(location, values)
      }

    case 'vec4':
      return (values: UniformSetterArrayArgs['vec4']) => {
        if (values.length !== 4) throwIncorrectLengthError('vec4', identifier, 4, values.length)
        gl.uniform4fv(location, values)
      }

    case 'mat2':
      return (values: UniformSetterArrayArgs['mat2']) => {
        if (values.length !== 4) throwIncorrectLengthError('mat2', identifier, 4, values.length)
        gl.uniformMatrix2fv(location, false, values)
      }

    case 'mat3':
      return (values: UniformSetterArrayArgs['mat3']) => {
        if (values.length !== 9) throwIncorrectLengthError('mat3', identifier, 9, values.length)
        gl.uniformMatrix3fv(location, false, values)
      }

    case 'mat4':
      return (values: UniformSetterArrayArgs['mat4']) => {
        if (values.length !== 16) throwIncorrectLengthError('mat4', identifier, 16, values.length)
        gl.uniformMatrix4fv(location, false, values)
      }
  }

  return null
}

function throwIncorrectLengthError(glslType: string, identifier: string, expectedLength: number, actualLength: number) {
  throw new Error(
    `Expected an array of length ${expectedLength} for "uniform ${glslType} ${identifier};". Got ${actualLength}.`,
  )
}
