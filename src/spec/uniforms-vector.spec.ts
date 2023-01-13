import { describe, expectTypeOf } from 'vitest'

import { testUniform } from './helpers/test-uniform'

describe('createShaderProgram()', () => {
  describe('uniforms', () => {
    describe('vectors', () => {
      testUniform(
        'uniform vec2 uVec2;',
        'uVec2',
        {
          varType: 'vec2',
          set: [
            {
              glSetter: 'uniform2f',
              args: [1, 2],
              testModeValues: [1, 2],
            },
          ],
          setArray: [
            {
              glSetter: 'uniform2fv',
              args: [[1, 2]],
              testModeValues: [1, 2],
            },
            {
              glSetter: 'uniform2fv',
              args: [new Float32Array([1, 2])],
              testModeValues: [1, 2],
            },
            {
              glSetter: 'uniform2fv',
              args: [new Float32Array([1, 2, 3])],
              throws: 'Expected an array of length 2 for "uniform vec2 uVec2;". Got 3.',
            },
          ],
        },
        (shaderProgram) => {
          expectTypeOf(shaderProgram.uniforms.uVec2).toEqualTypeOf<{
            type: 'vec2'
            location: WebGLUniformLocation
            set: (x: number, y: number) => void
            setArray: (array: [number, number] | Float32Array | Float64Array) => void
            value: never
          }>()
        },
      )

      testUniform(
        'uniform vec3 uVec3;',
        'uVec3',
        {
          varType: 'vec3',
          set: [
            {
              glSetter: 'uniform3f',
              args: [1, 2, 3],
              testModeValues: [1, 2, 3],
            },
          ],
          setArray: [
            {
              glSetter: 'uniform3fv',
              args: [[1, 2, 3]],
              testModeValues: [1, 2, 3],
            },
            {
              glSetter: 'uniform3fv',
              args: [new Float32Array([1, 2, 3])],
              testModeValues: [1, 2, 3],
            },
            {
              glSetter: 'uniform3fv',
              args: [new Float32Array([1, 2, 3, 4])],
              throws: 'Expected an array of length 3 for "uniform vec3 uVec3;". Got 4.',
            },
          ],
        },
        (shaderProgram) => {
          expectTypeOf(shaderProgram.uniforms.uVec3).toEqualTypeOf<{
            type: 'vec3'
            location: WebGLUniformLocation
            set: (x: number, y: number, z: number) => void
            setArray: (array: [number, number, number] | Float32Array | Float64Array) => void
            value: never
          }>()
        },
      )

      testUniform(
        'uniform vec4 uVec4;',
        'uVec4',
        {
          varType: 'vec4',
          set: [
            {
              glSetter: 'uniform4f',
              args: [1, 2, 3, 4],
              testModeValues: [1, 2, 3, 4],
            },
          ],
          setArray: [
            {
              glSetter: 'uniform4fv',
              args: [[1, 2, 3, 4]],
              testModeValues: [1, 2, 3, 4],
            },
            {
              glSetter: 'uniform4fv',
              args: [new Float32Array([1, 2, 3, 4])],
              testModeValues: [1, 2, 3, 4],
            },
            {
              glSetter: 'uniform4fv',
              args: [new Float32Array([1, 2, 3, 4, 5])],
              throws: 'Expected an array of length 4 for "uniform vec4 uVec4;". Got 5.',
            },
          ],
        },
        (shaderProgram) => {
          expectTypeOf(shaderProgram.uniforms.uVec4).toEqualTypeOf<{
            type: 'vec4'
            location: WebGLUniformLocation
            set: (x: number, y: number, z: number, w: number) => void
            setArray: (array: [number, number, number, number] | Float32Array | Float64Array) => void
            value: never
          }>()
        },
      )
    })
  })
})
