import { describe, expect, it, vi } from 'vitest'

import { createShaderProgram, ShaderProgram } from './shader-program'
import { gl } from './spec/mock-webgl-context'

// TODO: atomize these tests which specific shaders for each.

function testAttribute<
  TSrc extends string,
  TShaderProgram extends ShaderProgram<string, string> = ShaderProgram<TSrc, TSrc>,
>(
  src: TSrc,
  identifier: keyof TShaderProgram['attributes'] & string,
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

    it(`has a set() method which uses an attribute size of ${expected.attributeSize}`, () => {
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
}

function testUniform<
  TSrc extends string,
  TShaderProgram extends ShaderProgram<string, string> = ShaderProgram<TSrc, TSrc>,
>(
  src: TSrc,
  identifier: keyof TShaderProgram['uniforms'] & string,
  expected: {
    /** The glsl var type as written in the source code. */
    varType: string

    /** The gl function that is called to set the uniform by individual values. */
    set?: [glSetterName: Extract<keyof typeof gl, `uniform${string}`>, values: any, expectedValues?: any]

    /** The gl function that is called to set the uniform by an array of values. */
    setArray?: [glSetterName: Extract<keyof typeof gl, `uniform${string}`>, values: any, expectedValues?: any]
  },
  additionalTests?: (shaderProgram: TShaderProgram) => void,
) {
  function getUniform(shaderProgram: ShaderProgram<string, string>): any {
    return shaderProgram.uniforms[identifier]
  }

  describe(`"uniform ${identifier} ${expected.varType}"`, () => {
    it('has a uniform location', () => {
      const aUniformLocation = { aUniformLocation: 123 }
      vi.spyOn(gl, 'getUniformLocation').mockReturnValue(aUniformLocation)
      const shaderProgram = createShaderProgram(gl, src, src)
      expect(getUniform(shaderProgram).location).toEqual(aUniformLocation)
    })

    it(`has a uniform type of ${expected.varType}`, () => {
      const shaderProgram = createShaderProgram(gl, src, src)
      expect(getUniform(shaderProgram).type).toEqual(expected.varType)
    })

    if (expected.set) {
      const [glSetterName, values, expectedValues] = expected.set

      it(`has a set() method which calls gl.${glSetterName}()`, () => {
        const shaderProgram = createShaderProgram(gl, src, src)
        vi.spyOn(gl, glSetterName)
        const uniform = getUniform(shaderProgram)
        uniform.set(...values)
        expect(gl[glSetterName]).toHaveBeenCalledWith(uniform.location, ...(expectedValues ?? values))
      })
    }

    if (expected.setArray) {
      const [glSetterName, values, expectedValues] = expected.setArray

      it(`has a setArray() method which calls gl.${glSetterName}()`, () => {
        const shaderProgram = createShaderProgram(gl, src, src)
        vi.spyOn(gl, glSetterName)
        const uniform = getUniform(shaderProgram)
        uniform.setArray(...values)
        expect(gl[glSetterName]).toHaveBeenCalledWith(uniform.location, ...(expectedValues ?? values))
      })
    }

    additionalTests?.(createShaderProgram(gl, src, src) as any)
  })
}

describe('createShaderProgram()', () => {
  describe('attributes', () => {
    testAttribute('attribute float aFloat;', 'aFloat', {
      varType: 'float',
      attributeSize: 1,
    })
    testAttribute('attribute vec2 aVec2;', 'aVec2', {
      varType: 'vec2',
      attributeSize: 2,
    })
    testAttribute('attribute vec3 aVec3;', 'aVec3', {
      varType: 'vec3',
      attributeSize: 3,
    })
    testAttribute('attribute vec4 aVec4;', 'aVec4', {
      varType: 'vec4',
      attributeSize: 4,
    })
  })

  describe('uniforms', () => {
    describe('single values', () => {
      testUniform('uniform float uFloat;', 'uFloat', {
        varType: 'float',
        set: ['uniform1f', [1]],
      })
      testUniform('uniform int uInt;', 'uInt', {
        varType: 'int',
        set: ['uniform1i', [1]],
      })
      testUniform('uniform uint uUint;', 'uUint', {
        varType: 'uint',
        set: ['uniform1ui', [1]],
      })
      testUniform('uniform bool uBool;', 'uBool', {
        varType: 'bool',
        set: ['uniform1ui', [true], [1]],
      })
    })

    describe('vectors', () => {
      testUniform(
        'uniform vec2 uVec2;',
        'uVec2',
        {
          varType: 'vec2',
          set: ['uniform2f', [1, 2]],
          setArray: ['uniform2fv', [[1, 2]]],
        },
        (shaderProgram) => {
          it('throws if setArray() is called with an array of a length that is not 2', () => {
            expect(() => shaderProgram.uniforms.uVec2.setArray(new Float32Array(3).fill(0))).toThrowError(
              'Expected an array of length 2 for "uniform vec2 uVec2;". Got 3.',
            )
          })
        },
      )

      testUniform(
        'uniform vec3 uVec3;',
        'uVec3',
        {
          varType: 'vec3',
          set: ['uniform3f', [1, 2, 3]],
          setArray: ['uniform3fv', [[1, 2, 3]]],
        },
        (shaderProgram) => {
          it('throws if setArray() is called with an array of a length that is not 3', () => {
            expect(() => shaderProgram.uniforms.uVec3.setArray(new Float32Array(6).fill(0))).toThrowError(
              'Expected an array of length 3 for "uniform vec3 uVec3;". Got 6.',
            )
          })
        },
      )
      testUniform(
        'uniform vec4 uVec4;',
        'uVec4',
        {
          varType: 'vec4',
          set: ['uniform4f', [1, 2, 3, 4]],
          setArray: ['uniform4fv', [[1, 2, 3, 4]]],
        },
        (shaderProgram) => {
          it('throws if setArray() is called with an array of a length that is not 4', () => {
            expect(() => shaderProgram.uniforms.uVec4.setArray(new Float32Array(3).fill(0))).toThrowError(
              'Expected an array of length 4 for "uniform vec4 uVec4;". Got 3.',
            )
          })
        },
      )
    })

    describe('matrices', () => {
      testUniform(
        'uniform mat2 uMat2;',
        'uMat2',
        {
          varType: 'mat2',
          set: ['uniformMatrix2fv', [[1, 2, 3, 4]], [false, [1, 2, 3, 4]]],
        },
        (shaderProgram) => {
          it('throws if set() is called with an array of a length that is not 4', () => {
            const uniform = shaderProgram.uniforms.uMat2
            expect(() => uniform.set(new Float32Array(3).fill(0))).toThrowError(
              'Expected an array of length 4 for "uniform mat2 uMat2;". Got 3.',
            )
          })
        },
      )

      testUniform(
        'uniform mat3 uMat3;',
        'uMat3',
        {
          varType: 'mat3',
          set: ['uniformMatrix3fv', [[1, 2, 3, 4, 5, 6, 7, 8, 9]], [false, [1, 2, 3, 4, 5, 6, 7, 8, 9]]],
        },
        (shaderProgram) => {
          it('throws if set() is called with an array of a length that is not 9', () => {
            const uniform = shaderProgram.uniforms.uMat3
            expect(() => uniform.set(new Float32Array(10).fill(0))).toThrowError(
              'Expected an array of length 9 for "uniform mat3 uMat3;". Got 10',
            )
          })
        },
      )

      testUniform(
        'uniform mat4 uMat4;',
        'uMat4',
        {
          varType: 'mat4',
          set: [
            'uniformMatrix4fv',
            [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
            [false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
          ],
        },
        (shaderProgram) => {
          it('throws if set() is called with an array of a length that is not 16', () => {
            const uniform = shaderProgram.uniforms.uMat4
            expect(() => uniform.set(new Float32Array(32).fill(0))).toThrowError(
              'Expected an array of length 16 for "uniform mat4 uMat4;". Got 32',
            )
          })
        },
      )
    })
  })

  describe('with complex whitespace', () => {
    const src = /* glsl */ `
    
      attribute
        vec3\t
                  aVec3 \t
            ;

      uniform\t
      vec2\t uVec2;
    `

    const shaderProgram = createShaderProgram(gl, src, src)

    it('parses attributes', () => {
      expect(shaderProgram.attributes.aVec3.location).toBeDefined()
      expect(shaderProgram.attributes.aVec3.type).toBe('vec3')
      expect(shaderProgram.attributes.aVec3.set).toBeTypeOf('function')
    })

    it('parses uniforms', () => {
      expect(shaderProgram.uniforms.uVec2.location).toBeDefined()
      expect(shaderProgram.uniforms.uVec2.type).toBe('vec2')
      expect(shaderProgram.uniforms.uVec2.set).toBeTypeOf('function')
    })
  })

  // TODO: test types
})
