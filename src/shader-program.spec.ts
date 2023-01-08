import { describe, expect, it, vi } from 'vitest'

import { createShaderProgram, ShaderProgram } from './shader-program'
import { gl } from './spec/mock-webgl-context'

//** Reteurns the arguments of a uniform setter as something suitable for use in a test name. */
function describeArgs(args: unknown[]) {
  return args
    .map((arg: any) => {
      if (Array.isArray(arg)) return `[${arg.map((n) => typeof n).join(',')}]`
      if (typeof arg === 'object') {
        if ('length' in arg) return `${arg.constructor.name}[${arg.length}]`
        return arg.constructor.name
      }
      if (typeof arg === 'boolean') return arg
      return typeof arg
    })
    .join(', ')
}

/** Test a shader attribute property against the expectation in `expected`. */
function testAttribute<
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

/** Test a shader uniform property against the expectation in `expected`. */
function testUniform<
  TSrc extends string,
  TIdentifier extends keyof TShaderProgram['uniforms'] & string,
  TShaderProgram extends ShaderProgram<string, string> = ShaderProgram<TSrc, TSrc>,
>(
  src: TSrc,
  identifier: TIdentifier,
  expected: {
    /** The glsl var type as written in the source code. */
    varType: string

    /** The gl function that is called to set the uniform by individual values. */
    set?: {
      glSetter: Extract<keyof typeof gl, `uniform${string}`>
      args: any[]
      expectedValues?: any[]
    }[]

    /** The gl function that is called to set the uniform by an array of values. */
    setArray?: {
      glSetter: Extract<keyof typeof gl, `uniform${string}`>
      args: any[]
      expectedValues?: any[]
      throws?: string
    }[]
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
      for (const { glSetter, args, expectedValues } of expected.set) {
        it(`has a \`set(${describeArgs(args)})\` method which calls gl.${glSetter}()`, () => {
          const shaderProgram = createShaderProgram(gl, src, src)
          vi.spyOn(gl, glSetter)
          const uniform = getUniform(shaderProgram)
          uniform.set(...args)
          expect(gl[glSetter]).toHaveBeenCalledWith(uniform.location, ...(expectedValues ?? args))
        })
      }
    }

    if (expected.setArray) {
      for (const { glSetter, args, expectedValues, throws } of expected.setArray) {
        if (throws) {
          it(`has a \`setArray()\` method which throws when passed ${describeArgs(args)}`, () => {
            const shaderProgram = createShaderProgram(gl, src, src)
            const uniform = getUniform(shaderProgram)
            expect(() => uniform.setArray(...args)).toThrow(throws)
          })
        } else {
          it(`has a \`setArray()\` method which calls gl.${glSetter}()`, () => {
            const shaderProgram = createShaderProgram(gl, src, src)
            vi.spyOn(gl, glSetter)
            const uniform = getUniform(shaderProgram)
            uniform.setArray(...args)
            expect(gl[glSetter]).toHaveBeenCalledWith(uniform.location, ...(expectedValues ?? args))
          })
        }
      }
    }

    additionalTests?.(createShaderProgram(gl, src, src) as any)
  })

  return {
    /** Provide a generic type parameter here to expect the uniform object to extend this type. */
    expectType<T extends TShaderProgram['uniforms'][TIdentifier]>() {},
  }
}

describe('createShaderProgram()', () => {
  describe('attributes', () => {
    testAttribute('attribute float aFloat;', 'aFloat', {
      varType: 'float',
      attributeSize: 1,
    }).expectType<{
      type: 'float'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec2 aVec2;', 'aVec2', {
      varType: 'vec2',
      attributeSize: 2,
    }).expectType<{
      type: 'vec2'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec3 aVec3;', 'aVec3', {
      varType: 'vec3',
      attributeSize: 3,
    }).expectType<{
      type: 'vec3'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec4 aVec4;', 'aVec4', {
      varType: 'vec4',
      attributeSize: 4,
    }).expectType<{
      type: 'vec4'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()
  })

  describe('uniforms', () => {
    describe('single values', () => {
      testUniform('uniform float uFloat;', 'uFloat', {
        varType: 'float',
        set: [{ glSetter: 'uniform1f', args: [1] }],
      }).expectType<{
        type: 'float'
        location: WebGLUniformLocation
        set: (n: number) => void
      }>()

      testUniform('uniform int uInt;', 'uInt', {
        varType: 'int',
        set: [{ glSetter: 'uniform1i', args: [1] }],
      }).expectType<{
        type: 'int'
        location: WebGLUniformLocation
        set: (n: number) => void
      }>()

      testUniform('uniform uint uUint;', 'uUint', {
        varType: 'uint',
        set: [{ glSetter: 'uniform1ui', args: [1] }],
      }).expectType<{
        type: 'uint'
        location: WebGLUniformLocation
        set: (n: number) => void
      }>()

      testUniform('uniform bool uBool;', 'uBool', {
        varType: 'bool',
        set: [
          { glSetter: 'uniform1ui', args: [false], expectedValues: [0] },
          { glSetter: 'uniform1ui', args: [true], expectedValues: [1] },
        ],
      }).expectType<{
        type: 'bool'
        location: WebGLUniformLocation
        set: (b: boolean) => void
      }>()
    })

    describe('vectors', () => {
      testUniform('uniform vec2 uVec2;', 'uVec2', {
        varType: 'vec2',
        set: [{ glSetter: 'uniform2f', args: [1, 2] }],
        setArray: [
          {
            glSetter: 'uniform2fv',
            args: [[1, 2]],
          },
          {
            glSetter: 'uniform2fv',
            args: [new Float32Array([1, 2, 3])],
            throws: 'Expected an array of length 2 for "uniform vec2 uVec2;". Got 3.',
          },
        ],
      }).expectType<{
        type: 'vec2'
        location: WebGLUniformLocation
        set: (x: number, y: number) => void
        setArray: (array: [number, number] | Float32Array | Float64Array) => void
      }>()

      testUniform('uniform vec3 uVec3;', 'uVec3', {
        varType: 'vec3',
        set: [{ glSetter: 'uniform3f', args: [1, 2, 3] }],
        setArray: [
          {
            glSetter: 'uniform3fv',
            args: [[1, 2, 3]],
          },
          {
            glSetter: 'uniform3fv',
            args: [new Float32Array([1, 2, 3, 4])],
            throws: 'Expected an array of length 3 for "uniform vec3 uVec3;". Got 4.',
          },
        ],
      }).expectType<{
        type: 'vec3'
        location: WebGLUniformLocation
        set: (x: number, y: number, z: number) => void
        setArray: (array: [number, number, number] | Float32Array | Float64Array) => void
      }>()

      testUniform('uniform vec4 uVec4;', 'uVec4', {
        varType: 'vec4',
        set: [{ glSetter: 'uniform4f', args: [1, 2, 3, 4] }],
        setArray: [
          {
            glSetter: 'uniform4fv',
            args: [[1, 2, 3, 4]],
          },
          {
            glSetter: 'uniform4fv',
            args: [new Float32Array([1, 2, 3, 4, 5])],
            throws: 'Expected an array of length 4 for "uniform vec4 uVec4;". Got 5.',
          },
        ],
      }).expectType<{
        type: 'vec4'
        location: WebGLUniformLocation
        set: (x: number, y: number, z: number, w: number) => void
        setArray: (array: [number, number, number, number] | Float32Array | Float64Array) => void
      }>()
    })

    describe('matrices', () => {
      testUniform('uniform mat2 uMat2;', 'uMat2', {
        varType: 'mat2',
        setArray: [
          {
            glSetter: 'uniformMatrix2fv',
            args: [[1, 2, 3, 4]],
            expectedValues: [false, [1, 2, 3, 4]],
          },
          {
            glSetter: 'uniformMatrix2fv',
            args: [new Float32Array(4).fill(0)],
            expectedValues: [false, new Float32Array(4).fill(0)],
          },
          {
            glSetter: 'uniformMatrix2fv',
            args: [new Float64Array(4).fill(0)],
            expectedValues: [false, new Float64Array(4).fill(0)],
          },
          {
            glSetter: 'uniformMatrix2fv',
            args: [new Float32Array(3).fill(0)],
            throws: 'Expected an array of length 4 for "uniform mat2 uMat2;". Got 3.',
          },
        ],
      }).expectType<{
        type: 'mat2'
        location: WebGLUniformLocation
        setArray: (array: [number, number, number, number] | Float32Array | Float64Array) => void
      }>()

      testUniform('uniform mat3 uMat3;', 'uMat3', {
        varType: 'mat3',
        setArray: [
          {
            glSetter: 'uniformMatrix3fv',
            args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
            expectedValues: [false, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
          },
          {
            glSetter: 'uniformMatrix3fv',
            args: [new Float32Array(9).fill(0)],
            expectedValues: [false, new Float32Array(9).fill(0)],
          },
          {
            glSetter: 'uniformMatrix3fv',
            args: [new Float64Array(9).fill(0)],
            expectedValues: [false, new Float64Array(9).fill(0)],
          },
          {
            glSetter: 'uniformMatrix3fv',
            args: [new Float32Array(10).fill(0)],
            throws: 'Expected an array of length 9 for "uniform mat3 uMat3;". Got 10.',
          },
        ],
      }).expectType<{
        type: 'mat3'
        location: WebGLUniformLocation
        setArray: (
          array: [number, number, number, number, number, number, number, number, number] | Float32Array | Float64Array,
        ) => void
      }>()

      testUniform('uniform mat4 uMat4;', 'uMat4', {
        varType: 'mat4',
        setArray: [
          {
            glSetter: 'uniformMatrix4fv',
            args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
            expectedValues: [false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
          },
          {
            glSetter: 'uniformMatrix4fv',
            args: [new Float32Array(16).fill(0)],
            expectedValues: [false, new Float32Array(16).fill(0)],
          },
          {
            glSetter: 'uniformMatrix4fv',
            args: [new Float64Array(16).fill(0)],
            expectedValues: [false, new Float64Array(16).fill(0)],
          },
          {
            glSetter: 'uniformMatrix4fv',
            args: [new Float32Array(17).fill(0)],
            throws: 'Expected an array of length 16 for "uniform mat4 uMat4;". Got 17.',
          },
        ],
      }).expectType<{
        type: 'mat4'
        location: WebGLUniformLocation
        setArray: (
          array:
            | [
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
            | Float32Array
            | Float64Array,
        ) => void
      }>()
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

  describe('with comments', () => {
    const src = /* glsl */ `
    
      // attribute
      //   vec3\t
      //             aNope \t
      //      ;

      /* uniform\t
      vec2\t uNope1; */

      uniform float uFloat;
      /* uniform uint uNope2; */

      attribute vec3 aVec3;
      
      // Soft sorrow reaching
      // Painful hands stretching outward
      // Midnight stars beckon
      uniform vec2 uVec2;
    `

    const shaderProgram = createShaderProgram(gl, src, src)

    it('parses attributes', () => {
      expect(Object.keys(shaderProgram.attributes)).toEqual(['aVec3'])
      expect(shaderProgram.attributes.aVec3.location).toBeDefined()
      expect(shaderProgram.attributes.aVec3.type).toBe('vec3')
      expect(shaderProgram.attributes.aVec3.set).toBeTypeOf('function')
    })

    it('parses uniforms', () => {
      const uniformIdentifiers = Object.keys(shaderProgram.uniforms)
      expect(uniformIdentifiers).toHaveLength(2)
      expect(uniformIdentifiers).toContain('uVec2')
      expect(uniformIdentifiers).toContain('uFloat')

      expect(shaderProgram.uniforms.uFloat.location).toBeDefined()
      expect(shaderProgram.uniforms.uFloat.type).toBe('float')
      expect(shaderProgram.uniforms.uFloat.set).toBeTypeOf('function')

      expect(shaderProgram.uniforms.uVec2.location).toBeDefined()
      expect(shaderProgram.uniforms.uVec2.type).toBe('vec2')
      expect(shaderProgram.uniforms.uVec2.set).toBeTypeOf('function')
    })
  })

  // TODO: test types
})
