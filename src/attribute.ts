import type { GlslVarsInfo } from './shader-program'

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
  location: WebGLUniformLocation
  set(buffer: WebGLBuffer): void
}

export function createAttributeSetter(gl: WebGL2RenderingContext, location: number, attributeSize: number) {
  return (buffer: WebGLBuffer) => {
    // Bind the buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    // Bind the attribute location.
    gl.enableVertexAttribArray(location)

    // Put the bound buffer in the bound location
    gl.vertexAttribPointer(location, attributeSize, gl.FLOAT, false, 0, 0)
  }
}
