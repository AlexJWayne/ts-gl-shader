import {
  type AttributeType,
  createAttributeSetter,
  type ShaderAttributes,
} from './attribute';
import { handleGlError } from './handle-gl-error';
import {
  createUniformSetter,
  type ShaderUniforms,
  type UniformSetterInput,
} from './uniform';

export type GlslVarQualifier = "uniform" | "attribute"

export type GlslVarType =
  | "bool" //
  | "int"
  | "uint"
  | "float"
  | `vec${2 | 3 | 4}`
// | 'double'
// | `${'' | 'u' | 'i' | 'b'}vec${2 | 3 | 4}`
// | `mat${2 | 3 | 4}`
// | `${'' | 'u' | 'i'}sampler${1 | 2 | 3}D`

/** Removes block and inline comments. */
type RemoveComments<T extends string> =
  T extends `${infer Before}//${string}\n${infer After}`
    ? `${Before}${RemoveComments<After>}\n`
    : T extends `${infer Before}/*${string}*/${infer After}`
    ? `${Before}${RemoveComments<After>}`
    : T

/** Returns an object type with all  */
export type GlslVarsInfo<
  T extends string,
  Qualifier extends GlslVarQualifier,
> = RemoveComments<T> extends `${string}${Qualifier} ${infer VarType extends GlslVarType} ${infer Name};${infer Rest}`
  ? { [name in Name]: VarType } & GlslVarsInfo<Rest, Qualifier>
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {}

export type ShaderProgram<VertSrc extends string, FragSrc extends string> = {
  program: WebGLProgram
  attributes: ShaderAttributes<
    GlslVarsInfo<RemoveComments<`${VertSrc}\n${FragSrc}`>, "attribute">
  >
  uniforms: ShaderUniforms<
    GlslVarsInfo<RemoveComments<`${VertSrc}\n${FragSrc}`>, "uniform">
  >
  use(
    fn?: (program: Omit<ShaderProgram<VertSrc, FragSrc>, "use">) => void,
  ): void
}

export function createShaderProgram<
  VertSrc extends string,
  FragSrc extends string,
>(
  gl: WebGL2RenderingContext,
  { vertSrc, fragSrc }: { vertSrc: VertSrc; fragSrc: FragSrc },
): ShaderProgram<VertSrc, FragSrc> {
  const glProgram = createProgram(gl, vertSrc, fragSrc)

  const combinedSrc = combineShaderSource(vertSrc, fragSrc)
  const attributes = createAttributes(gl, glProgram, combinedSrc)
  const uniforms = createUniforms(gl, glProgram, combinedSrc)

  const shaderProgram = { program: glProgram, attributes, uniforms }
  return {
    ...shaderProgram,
    use: createUse(gl, shaderProgram, glProgram),
  }
}

/** Returns a function that prepares this shader program for rendering. */
function createUse<T extends Omit<ShaderProgram<string, string>, "use">>(
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
    .join("\n")
    .replace(/\/\*.*\*\//gms, "")
    .replace(/\/\/.*$/gm, "") as Return
}

/** Create a program from a vertex shader and a fragment shader source. */
function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram {
  // Create a shader program object to store the combined shader program.
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) throw new Error("Failed to create empty shader program.")

  // Attach a vertex shader.
  gl.attachShader(shaderProgram, createShader(gl, "VERTEX_SHADER", vertSrc))

  // Attach a fragment shader.
  gl.attachShader(shaderProgram, createShader(gl, "FRAGMENT_SHADER", fragSrc))

  // Link both the programs.
  gl.linkProgram(shaderProgram)
  handleGlError(gl, "ShaderProgramObject gl.linkProgram()")

  // Check for success and return the program.
  const success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)
  if (success) return shaderProgram

  // Report failure.
  const errorMessage = gl.getProgramInfoLog(shaderProgram)
  throw new Error(`Failed to link shader program\n${errorMessage}`)
}

/** Compile a shader and return a handle to it. */
function createShader(
  gl: WebGL2RenderingContext,
  type: "VERTEX_SHADER" | "FRAGMENT_SHADER",
  src: string,
): WebGLShader {
  // Create an empty shader object.
  const shader = gl.createShader(gl[type])
  if (!shader) throw new Error("Failed to create empty shader.")

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

function createUniforms<
  ShaderSrc extends string,
  Return extends ShaderUniforms<GlslVarsInfo<ShaderSrc, "uniform">>,
>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  shaderSrc: ShaderSrc,
): Return {
  const uniformDeclarations = shaderSrc.match(/(?:uniform) \w+ \w+;/g)
  if (!uniformDeclarations) return {} as Return

  return uniformDeclarations.reduce((uniforms, uniformDeclaration) => {
    const tokens = uniformDeclaration.split(" ") as [
      "uniform",
      keyof UniformSetterInput,
      string,
    ]
    const type = tokens[1]
    const name = tokens[2].replace(/;$/, "") as keyof Return & string

    uniforms[name] = createUniform(
      gl,
      program,
      type,
      name,
    ) as Return[typeof name]
    return uniforms
  }, {} as any)
}

function createUniform<GlslType extends keyof UniformSetterInput>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: GlslType,
  name: string,
) {
  const location = gl.getUniformLocation(program, name)
  handleGlError(gl, `ShaderProgramObject gl.getUniformLocation() ${name}`)

  return {
    location,
    type,
    set: createUniformSetter(gl, location, type),
  }
}

function createAttributes<
  ShaderSrc extends string,
  Return = ShaderAttributes<GlslVarsInfo<ShaderSrc, "attribute">>,
>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  shaderSrc: ShaderSrc,
): Return {
  const attributeDeclarations = shaderSrc.match(/(?:attribute) \w+ \w+;/g)
  if (!attributeDeclarations) return {} as Return

  return attributeDeclarations.reduce((attributes, attributeDeclaration) => {
    const tokens = attributeDeclaration.split(" ") as [
      "attribute",
      AttributeType,
      string,
    ]
    const type = tokens[1]
    const name = tokens[2].replace(/;$/, "") as keyof Return & string
    const attributeSize = Number(type.match(/([234])$/)?.[1]) || 1

    const location = gl.getAttribLocation(program, name)
    handleGlError(gl, `ShaderProgramObject gl.getAttribLocation() ${name}`)

    attributes[name] = {
      type,
      location,
      set: createAttributeSetter(gl, location, attributeSize),
    }

    return attributes
  }, {} as any)
}
