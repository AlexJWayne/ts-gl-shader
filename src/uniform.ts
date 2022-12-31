import type { GlslVarsInfo } from './shader-program'

export type UniformSetterInput = {
  float: {
    values: [n: number]
    array: Float32Array | Float64Array
  }
  bool: {
    values: [bool: boolean]
    array: Uint8Array
  }
  int: {
    values: [n: number]
    array: Int8Array | Int16Array | Int32Array
  }
  uint: {
    values: [n: number]
    array: Uint8Array | Uint16Array | Uint32Array
  }
  vec2: {
    values: [x: number, y: number]
    array: Float32Array | Float64Array
  }
  vec3: {
    values: [x: number, y: number, z: number]
    array: Float32Array | Float64Array
  }
  vec4: {
    values: [x: number, y: number, z: number, w: number]
    array: Float32Array | Float64Array
  }
  // TODO: matrix types?
}

/** Type of the `uniforms` property of the shader object. */
export type ShaderUniforms<T extends GlslVarsInfo<string, 'uniform'>> = {
  [K in keyof T & string]: T[K] extends keyof UniformSetterInput //
    ? ShaderUniform<T[K]>
    : never
}

/** Type of one uniform. */
export type ShaderUniform<Type extends keyof UniformSetterInput> = {
  type: Type
  location: WebGLUniformLocation
  set(...values: UniformSetterInput[Type]['values']): void
  set(values: UniformSetterInput[Type]['array'], srcOffset?: number, srcLength?: number): void
}

/** Type of the arguments of the uniform setter for a single type. */
type UniformSetterArgs<T extends keyof UniformSetterInput> =
  | UniformSetterInput[T]['values']
  | [typeArray: UniformSetterInput[T]['array'], srcOffset?: number, srcLength?: number]

/** Cast the arguments tuple to the correct type. */
function hasBinaryArray<T extends unknown[]>(values: T): values is Exclude<T, [number | boolean, ...unknown[]]> {
  return ArrayBuffer.isView(values[0])
}

/** Creates a uniform object with a type specific `set` function. */
export function createUniformSetter<T extends keyof UniformSetterInput>(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  type: T,
) {
  if (location === null) return () => undefined

  switch (type) {
    case 'float':
      return (...values: UniformSetterArgs<'float'>) =>
        hasBinaryArray(values) ? gl.uniform1fv(location, ...values) : gl.uniform1f(location, ...values)

    case 'int':
      return (...values: UniformSetterArgs<'int'>) =>
        hasBinaryArray(values) ? gl.uniform1iv(location, ...values) : gl.uniform1i(location, ...values)

    case 'uint':
      return (...values: UniformSetterArgs<'uint'>) =>
        hasBinaryArray(values) ? gl.uniform1uiv(location, ...values) : gl.uniform1ui(location, ...values)

    case 'bool':
      return (...values: UniformSetterArgs<'bool'>) =>
        hasBinaryArray(values) ? gl.uniform1uiv(location, ...values) : gl.uniform1ui(location, values[0] ? 1 : 0)

    case 'vec2':
      return (...values: UniformSetterArgs<'vec2'>) =>
        hasBinaryArray(values) ? gl.uniform2fv(location, ...values) : gl.uniform2f(location, ...values)

    case 'vec3':
      return (...values: UniformSetterArgs<'vec3'>) =>
        hasBinaryArray(values) ? gl.uniform3fv(location, ...values) : gl.uniform3f(location, ...values)

    case 'vec4':
      return (...values: UniformSetterArgs<'vec4'>) =>
        hasBinaryArray(values) ? gl.uniform4fv(location, ...values) : gl.uniform4f(location, ...values)

    default:
      throw new Error(`Unsupported uniform type ${type}`)
  }
}
