import { GlslVarsInfo, GlslVarType } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'
import { parseDeclarations } from './lib/string-processing'
import { testMode } from './test-mode'

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
  [K in keyof T & string]: T[K] extends { type: keyof (UniformSetterArgs & UniformSetterArrayArgs) } //
    ? ShaderUniform<T[K]['type']>
    : never
}

/** Type of one uniform. */
export type ShaderUniform<TType extends keyof UniformSetterArgs | keyof UniformSetterArrayArgs> = {
  /** GLSL Variable type. */
  type: TType

  /** The WebGLUniformLocation used to set this uniform. */
  location: WebGLUniformLocation

  /**
   * This is only available in test mode, and will hold the most recently set value. It has a
   * type of `never` to ensure it is not used in production code for performance reasons.
   *
   * Test usage example:
   *
   *     // some-test.spec.ts
   *     beforeEach(() => {
   *       createShaderProgram.enableTestMode()
   *     })
   *
   *     afterEach(() => {
   *       createShaderProgram.disableTestMode()
   *     })
   *
   *     it('should set the uniform', () => {
   *       const shader = createShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc)
   *       shader.uniforms.someUniform.set(1, 2, 3)
   *       expect(shader.uniforms.someUniform.value).toEqual([1, 2, 3])
   *     })
   */
  value: never
} & (TType extends keyof UniformSetterArgs
  ? {
      /** Set this uniform with individual values. */
      set(...values: UniformSetterArgs[TType]): void
    }
  : {}) &
  (TType extends keyof UniformSetterArrayArgs
    ? {
        /** Set this uniform with an array of values. */
        setArray(values: TType extends keyof UniformSetterArrayArgs ? UniformSetterArrayArgs[TType] : never): void
      }
    : {})

export function createUniforms<ShaderSrc extends string>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  shaderSrc: ShaderSrc,
): ShaderUniforms<GlslVarsInfo<ShaderSrc, 'uniform'>> {
  const uniformDeclarations = parseDeclarations('uniform', shaderSrc)

  return uniformDeclarations.reduce((uniforms, declaration) => {
    const { type, identifier } = declaration
    uniforms[identifier] = createUniform(gl, program, type, identifier)
    return uniforms
  }, {} as any)
}

export function createUniform<TVarType extends GlslVarType>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: TVarType,
  identifier: string,
) {
  const location = gl.getUniformLocation(program, identifier)
  handleGlError(gl, `ShaderProgramObject gl.getUniformLocation() ${identifier}`)

  const didSet = testMode.current ? (value: any): void => (uniform.value = value) : undefined

  const uniform = {
    type,
    location,
    set: createUniformSetter(gl, location, type, didSet),
    setArray: createUniformArraySetter(gl, location, type, identifier, didSet),
    value: undefined as any,
  }

  return uniform
}

function createUniformSetter<T extends GlslVarType>(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  type: T,
  didSet: undefined | ((value: any) => void),
) {
  if (location === null) return () => undefined

  switch (type) {
    case 'float':
      return (n: number) => {
        gl.uniform1f(location, n)
        if (didSet) didSet(n)
      }

    case 'int':
      return (n: number) => {
        gl.uniform1i(location, n)
        if (didSet) didSet(n)
      }

    case 'uint':
      return (n: number) => {
        gl.uniform1ui(location, n)
        if (didSet) didSet(n)
      }

    case 'bool':
      return (boolean: boolean) => {
        gl.uniform1ui(location, boolean ? 1 : 0)
        if (didSet) didSet(boolean ? 1 : 0)
      }

    case 'vec2':
      return (x: number, y: number) => {
        gl.uniform2f(location, x, y)
        if (didSet) didSet([x, y])
      }

    case 'vec3':
      return (x: number, y: number, z: number) => {
        gl.uniform3f(location, x, y, z)
        if (didSet) didSet([x, y, z])
      }

    case 'vec4':
      return (x: number, y: number, z: number, w: number) => {
        gl.uniform4f(location, x, y, z, w)
        if (didSet) didSet([x, y, z, w])
      }
  }

  return null
}

function createUniformArraySetter<TVarType extends GlslVarType>(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  type: TVarType,
  identifier: string,
  didSet: undefined | ((value: any) => void),
) {
  if (location === null) return () => undefined

  switch (type) {
    case 'vec2':
      return (values: UniformSetterArrayArgs['vec2']) => {
        if (values.length !== 2) throwIncorrectLengthError('vec2', identifier, 2, values.length)
        gl.uniform2fv(location, values)
        if (didSet) didSet(values)
      }

    case 'vec3':
      return (values: UniformSetterArrayArgs['vec3']) => {
        if (values.length !== 3) throwIncorrectLengthError('vec3', identifier, 3, values.length)
        gl.uniform3fv(location, values)
        if (didSet) didSet(values)
      }

    case 'vec4':
      return (values: UniformSetterArrayArgs['vec4']) => {
        if (values.length !== 4) throwIncorrectLengthError('vec4', identifier, 4, values.length)
        gl.uniform4fv(location, values)
        if (didSet) didSet(values)
      }

    case 'mat2':
      return (values: UniformSetterArrayArgs['mat2']) => {
        if (values.length !== 4) throwIncorrectLengthError('mat2', identifier, 4, values.length)
        gl.uniformMatrix2fv(location, false, values)
        if (didSet) didSet(values)
      }

    case 'mat3':
      return (values: UniformSetterArrayArgs['mat3']) => {
        if (values.length !== 9) throwIncorrectLengthError('mat3', identifier, 9, values.length)
        gl.uniformMatrix3fv(location, false, values)
        if (didSet) didSet(values)
      }

    case 'mat4':
      return (values: UniformSetterArrayArgs['mat4']) => {
        if (values.length !== 16) throwIncorrectLengthError('mat4', identifier, 16, values.length)
        gl.uniformMatrix4fv(location, false, values)
        if (didSet) didSet(values)
      }
  }

  return null
}

function throwIncorrectLengthError(glslType: string, identifier: string, expectedLength: number, actualLength: number) {
  throw new Error(
    `Expected an array of length ${expectedLength} for "uniform ${glslType} ${identifier};". Got ${actualLength}.`,
  )
}
