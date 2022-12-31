import { GlslVarsInfo } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'

export type UniformSetterArgs = {
  float: [n: number]
  bool: [bool: boolean]
  int: [n: number]
  uint: [n: number]
  vec2: [x: number, y: number]
  vec3: [x: number, y: number, z: number]
  vec4: [x: number, y: number, z: number, w: number]
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

    default:
      throw new Error(`Unsupported uniform type ${type}`)
  }
}
