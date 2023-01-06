import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { GlslVarsInfo } from './lib/glsl-types'
import { createShaderProgram, ShaderProgram } from './shader-program'
import { gl } from './spec/mock-webgl-context'

// TODO: atomize these tests which specific shaders for each.

describe('createShaderProgram()', () => {
  const vertSrc = /* glsl */ `
    precision mediump float;

    attribute vec2 aVert2;
    attribute vec3 aVert3;
    attribute vec4 aVert4;
    
    uniform
      vec2
        \t uVec2 ; // funky white space is fine.
    uniform vec3 uVec3;
    uniform vec4 uVec4;
    
    uniform mat2 uMat2;
    uniform mat3 uMat3;
    uniform mat4 uMat4;

    uniform float uFloat;
    uniform bool uBool;

    // uniform float uFloatArr[3];

    varying vec2 vUV;

    void main() {
      vUV = aVer2;
      gl_Position = vec4(aVert3, 1.0);
    }
  `

  const fragSrc = /* glsl */ `
    precision mediump float;

    // also in the vertex shader
    uniform vec2 uVec2; 

    // only in the fragment shader
    uniform int uInt; 
    uniform uint uUnsignedInt;

    varying vec2 vUV;

    void main() {
      gl_FragColor = vec4(vUV, 0.0, 1.0);
    }
  `

  type TestShader = ShaderProgram<typeof vertSrc, typeof fragSrc>

  describe('uniforms', () => {
    describe('types', () => {
      it('has a property for each uniform', () => {
        expectTypeOf<keyof TestShader['uniforms']>().toMatchTypeOf<
          | 'uVec2' //
          | 'uVec3'
          | 'uVec4'
          | 'uFloat'
          | 'uBool'
          | 'uInt'
          | 'uUnsignedInt'
          | 'uMat2'
          | 'uMat3'
          | 'uMat4'
          // | 'uFloatArr'
        >()
      })

      it('provides types for a single value uniform', () => {
        expectTypeOf<TestShader['uniforms']['uFloat']>().toMatchTypeOf<{
          type: 'float'
          set(n: number): void
          setArray?: undefined
        }>()
      })

      it('provides types for a vector uniform', () => {
        expectTypeOf<TestShader['uniforms']['uVec2']>().toMatchTypeOf<{
          type: 'vec2'
          set(x: number, y: number): void
          setArray(values: number[] | Float32Array | Float64Array): void
        }>()
      })

      it('provides types for a 2x2 matrix uniform array', () => {
        expectTypeOf<TestShader['uniforms']['uMat2']>().toMatchTypeOf<{
          type: 'mat2'
          set(values2x2: [number, number, number, number] | Float32Array): void
        }>()
      })

      it('provides types for a 3x3 matrix uniform array', () => {
        expectTypeOf<TestShader['uniforms']['uMat3']>().toMatchTypeOf<{
          type: 'mat3'
          set(values3x3: [number, number, number, number, number, number, number, number, number] | Float32Array): void
        }>()
      })

      it('provides types for a 4x4 matrix uniform array', () => {
        expectTypeOf<TestShader['uniforms']['uMat4']>().toMatchTypeOf<{
          type: 'mat4'
          set(
            values4x4:
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
              | Float32Array,
          ): void
        }>()
      })
    })

    describe('setters', () => {
      function testUniformSetter(
        type: string,
        uniformName: keyof GlslVarsInfo<`${typeof fragSrc}${typeof vertSrc}`, 'uniform'>,
        setterName: 'set' | 'setArray',
        glUniformSetter: Extract<keyof WebGL2RenderingContext, `uniform${string}`>,
        values: unknown[],
        expected = values,
      ) {
        it(`sets ${type} with ${glUniformSetter}`, () => {
          const location = { someUniformLocationId: 123 }
          vi.spyOn(gl, 'getUniformLocation').mockReturnValue(location)

          const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
          vi.spyOn(gl, glUniformSetter)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uniform = shaderProgram.uniforms[uniformName] as any
          const setter = uniform[setterName]
          setter(...values)

          expect(gl[glUniformSetter]).toHaveBeenCalledWith(location, ...expected)
        })
      }

      describe('single values', () => {
        describe('set with discrete arguments', () => {
          testUniformSetter('float', 'uFloat', 'set', 'uniform1f', [1])
          testUniformSetter('int', 'uInt', 'set', 'uniform1i', [1])
          testUniformSetter('uint', 'uUnsignedInt', 'set', 'uniform1ui', [1])
          testUniformSetter('bool', 'uBool', 'set', 'uniform1ui', [true], [1])
          testUniformSetter('vec2', 'uVec2', 'set', 'uniform2f', [1, 2])
          testUniformSetter('vec3', 'uVec3', 'set', 'uniform3f', [1, 2, 3])
          testUniformSetter('vec4', 'uVec4', 'set', 'uniform4f', [1, 2, 3, 4])
        })

        describe('set with number[]', () => {
          testUniformSetter('vec2', 'uVec2', 'setArray', 'uniform2fv', [[1, 2]])
          testUniformSetter('vec3', 'uVec3', 'setArray', 'uniform3fv', [[1, 2, 3]])
          testUniformSetter('vec4', 'uVec4', 'setArray', 'uniform4fv', [[1, 2, 3, 4]])

          describe('length validation', () => {
            it('throws if vec2 values have an incorrect length', () => {
              const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
              const uniform = shaderProgram.uniforms.uVec2
              expect(() => uniform.setArray(new Float32Array(3).fill(0))).toThrowError(
                'Expected an array of length 2 for "vec2 uniform uVec2". Got 3',
              )
            })

            it('throws if vec3 values have an incorrect length', () => {
              const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
              const uniform = shaderProgram.uniforms.uVec3
              expect(() => uniform.setArray(new Float32Array(2).fill(0))).toThrowError(
                'Expected an array of length 3 for "vec3 uniform uVec3". Got 2',
              )
            })

            it('throws if vec4 values have an incorrect length', () => {
              const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
              const uniform = shaderProgram.uniforms.uVec4
              expect(() => uniform.setArray(new Float32Array(3).fill(0))).toThrowError(
                'Expected an array of length 4 for "vec4 uniform uVec4". Got 3',
              )
            })
          })
        })
      })

      describe('matrices', () => {
        describe('set with number[]', () => {
          testUniformSetter(
            'mat2', //
            'uMat2',
            'set',
            'uniformMatrix2fv',
            [[1, 2, 3, 4]],
            [false, [1, 2, 3, 4]],
          )
          testUniformSetter(
            'mat3',
            'uMat3',
            'set',
            'uniformMatrix3fv',
            [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
            [false, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
          )
          testUniformSetter(
            'mat4',
            'uMat4',
            'set',
            'uniformMatrix4fv',
            [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
            [false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
          )
        })

        describe('set with typed arrays', () => {
          testUniformSetter(
            'mat2',
            'uMat2',
            'set',
            'uniformMatrix2fv',
            [new Float32Array(4).fill(0)],
            [false, new Float32Array(4).fill(0)],
          )

          testUniformSetter(
            'mat3',
            'uMat3',
            'set',
            'uniformMatrix3fv',
            [new Float32Array(9).fill(0)],
            [false, new Float32Array(9).fill(0)],
          )

          testUniformSetter(
            'mat4',
            'uMat4',
            'set',
            'uniformMatrix4fv',
            [new Float32Array(16).fill(0)],
            [false, new Float32Array(16).fill(0)],
          )
        })

        describe('length validation', () => {
          it('throws if a mat2 is set by a Float32Array of an incorrect length', () => {
            const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
            const uniform = shaderProgram.uniforms.uMat2
            expect(() => uniform.set(new Float32Array(3).fill(0))).toThrowError(
              'Expected an array of length 4 for "mat2 uniform uMat2". Got 3',
            )
          })

          it('throws if a mat3 is set by a Float32Array of an incorrect length', () => {
            const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
            const uniform = shaderProgram.uniforms.uMat3
            expect(() => uniform.set(new Float32Array(8).fill(0))).toThrowError(
              'Expected an array of length 9 for "mat3 uniform uMat3". Got 8',
            )
          })

          it('throws if a mat4 is set by a Float32Array of an incorrect length', () => {
            const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)
            const uniform = shaderProgram.uniforms.uMat4
            expect(() => uniform.set(new Float32Array(11).fill(0))).toThrowError(
              'Expected an array of length 16 for "mat4 uniform uMat4". Got 11',
            )
          })
        })
      })
    })
  })

  describe('attributes', () => {
    describe('types', () => {
      it('has a property for each attribute', () => {
        expectTypeOf<keyof TestShader['attributes']>().toMatchTypeOf<'aVert2' | 'aVert3' | 'aVert4'>()
      })

      it('provides types for an attribute', () => {
        expectTypeOf<TestShader['attributes']['aVert2']>().toMatchTypeOf<{
          type: 'vec2'
          set(buffer: WebGLBuffer): void
        }>()
      })
    })

    describe('setters', () => {
      function testAttributeSetter(
        type: string,
        attributeName: keyof GlslVarsInfo<`${typeof fragSrc}${typeof vertSrc}`, 'attribute'>,
        buffer: WebGLBuffer,
        size: number,
      ) {
        it(`sets ${type} with a buffer and size of ${size}`, () => {
          const location = 123
          vi.spyOn(gl, 'getAttribLocation').mockReturnValue(location)

          const shaderProgram = createShaderProgram(gl, vertSrc, fragSrc)

          vi.spyOn(gl, 'bindBuffer')
          vi.spyOn(gl, 'vertexAttribPointer')

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const attribute = shaderProgram.attributes[attributeName] as any
          attribute.set(buffer)

          expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, buffer)
          expect(gl.vertexAttribPointer).toHaveBeenCalledWith(location, size, gl.FLOAT, false, 0, 0)
        })
      }

      testAttributeSetter('vec2', 'aVert2', gl.createBuffer()!, 2)
      testAttributeSetter('vec3', 'aVert3', gl.createBuffer()!, 3)
      testAttributeSetter('vec4', 'aVert4', gl.createBuffer()!, 4)
    })
  })
})
