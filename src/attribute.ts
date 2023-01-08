import { GlslVarsInfo } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'
import { parseDeclarations } from './lib/string-processing'

export type AttributeType = 'float' | `vec${2 | 3 | 4}`

/** Type of the `attributes` property of the shader object. */
export type ShaderAttributes<T extends GlslVarsInfo<string, 'attribute'>> = {
  [K in keyof T & string]: T[K] extends { type: AttributeType } //
    ? ShaderAttribute<T[K]['type']>
    : never
}

/** Type of one attribute. */
export type ShaderAttribute<Type extends AttributeType> = {
  type: Type
  location: number
  set(buffer: WebGLBuffer): void
}

export function createAttributes<ShaderSrc extends string>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  shaderSrc: ShaderSrc,
): ShaderAttributes<GlslVarsInfo<ShaderSrc, 'attribute'>> {
  const attributeDeclarations = parseDeclarations('attribute', shaderSrc)

  return attributeDeclarations.reduce((attributes, declaration) => {
    const { type, identifier } = declaration
    const attributeSize = Number(type.match(/([234])$/)?.[1]) || 1

    const location = gl.getAttribLocation(program, identifier)
    handleGlError(gl, `ShaderProgramObject gl.getAttribLocation() ${identifier}`)

    attributes[identifier] = {
      type,
      location,
      set: createAttributeSetter(gl, location, attributeSize),
    }
    return attributes
  }, {} as any)
}

function createAttributeSetter(gl: WebGL2RenderingContext, location: number, attributeSize: number) {
  return (buffer: WebGLBuffer) => {
    // Bind the buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    // Bind the attribute location.
    gl.enableVertexAttribArray(location)

    // Put the bound buffer in the bound location
    gl.vertexAttribPointer(location, attributeSize, gl.FLOAT, false, 0, 0)
  }
}
