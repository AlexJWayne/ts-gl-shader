import { describe, expect, it, vi } from 'vitest'

import { createShaderProgram, ShaderProgram } from '../../shader-program'

import { gl } from './mock-webgl-context'

/** Test a shader attribute property against the expectation in `expected`. */
export function testAttribute<
  TSrc extends string,
  TIdentifier extends keyof TShaderProgram['attributes'] & string,
  TShaderProgram extends ShaderProgram<string, string> = ShaderProgram<TSrc, TSrc>,
>(
  src: TSrc,
  identifier: TIdentifier,
  expected: {
    /** The expected glsl var type as written in the source code. */
    varType: string

    /** The expected number of values set per vertex attribute. Must be 1, 2, 3, or 4. */
    attributeSize: 1 | 2 | 3 | 4
  },
) {
  function getAttribute(shaderProgram: ShaderProgram<string, string>): any {
    // @ts-ignore
    return shaderProgram.attributes[identifier]
  }

  describe(`"attribute ${identifier} ${expected.varType}"`, () => {
    it('has an attribute location', () => {
      const anAttributeLocation = 123
      vi.spyOn(gl, 'getAttribLocation').mockReturnValue(anAttributeLocation)
      const shaderProgram = createShaderProgram(gl, src, src)
      expect(getAttribute(shaderProgram).location).toEqual(anAttributeLocation)
    })

    it(`has an attribute type of ${expected.varType}`, () => {
      const shaderProgram = createShaderProgram(gl, src, src)
      expect(getAttribute(shaderProgram).type).toEqual(expected.varType)
    })

    it(`has a set(WebGLBuffer) method which uses an attribute size of ${expected.attributeSize}`, () => {
      vi.spyOn(gl, 'getAttribLocation').mockReturnValue(123)
      vi.spyOn(gl, 'bindBuffer')
      vi.spyOn(gl, 'enableVertexAttribArray')
      vi.spyOn(gl, 'vertexAttribPointer')
      const buffer = {} as WebGLBuffer

      const shaderProgram = createShaderProgram(gl, src, src)
      const attribute = getAttribute(shaderProgram)

      attribute.set(buffer)

      expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, buffer)
      expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(attribute.location)
      expect(gl.vertexAttribPointer).toHaveBeenCalledWith(123, expected.attributeSize, gl.FLOAT, false, 0, 0)
    })
  })

  return {
    /** Provide a generic type parameter here to expect the attribute object to extend this type. */
    expectType<T extends TShaderProgram['attributes'][TIdentifier]>() {},
  }
}
