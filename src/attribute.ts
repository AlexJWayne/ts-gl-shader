import { GlslVarsInfo } from './lib/glsl-types'
import { handleGlError } from './lib/handle-gl-error'

export type AttributeType = 'float' | `vec${2 | 3 | 4}`

/** Type of the `attributes` property of the shader object. */
export type ShaderAttributes<T extends GlslVarsInfo<string, 'attribute'>> = {
  [K in keyof T & string]: T[K] extends AttributeType //
    ? ShaderAttribute<T[K]>
    : never
}

/** Type of one attribute. */
export type ShaderAttribute<Type extends AttributeType> = {
  type: Type
  set(buffer: WebGLBuffer): void
}

export function createAttributes<
  ShaderSrc extends string,
  Return = ShaderAttributes<GlslVarsInfo<ShaderSrc, 'attribute'>>,
>(gl: WebGL2RenderingContext, program: WebGLProgram, shaderSrc: ShaderSrc): Return {
  const attributeDeclarations = shaderSrc.match(/(?:attribute) \w+ \w+;/g)
  if (!attributeDeclarations) return {} as Return

  return attributeDeclarations.reduce((attributes, attributeDeclaration) => {
    const tokens = attributeDeclaration.split(' ') as ['attribute', AttributeType, string]
    const type = tokens[1]
    const name = tokens[2].replace(/;$/, '') as keyof Return & string
    const attributeSize = Number(type.match(/([234])$/)?.[1]) || 1

    const location = gl.getAttribLocation(program, name)
    handleGlError(gl, `ShaderProgramObject gl.getAttribLocation() ${name}`)

    attributes[name] = {
      type,
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