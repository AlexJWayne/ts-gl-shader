import { describe } from 'vitest'

import { testUniform } from './helpers/test-uniform'

describe('createShaderProgram()', () => {
  describe('uniforms', () => {
    describe('matrices', () => {
      testUniform('uniform mat2 uMat2;', 'uMat2', {
        varType: 'mat2',
        setArray: [
          {
            glSetter: 'uniformMatrix2fv',
            args: [[1, 2, 3, 4]],
            expectedValues: [false, [1, 2, 3, 4]],
            testModeValues: [1, 2, 3, 4],
          },
          {
            glSetter: 'uniformMatrix2fv',
            args: [new Float32Array(4).fill(0)],
            expectedValues: [false, new Float32Array(4).fill(0)],
            testModeValues: new Float32Array(4).fill(0),
          },
          {
            glSetter: 'uniformMatrix2fv',
            args: [new Float64Array(4).fill(0)],
            expectedValues: [false, new Float64Array(4).fill(0)],
            testModeValues: new Float64Array(4).fill(0),
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
        value: never
      }>()

      testUniform('uniform mat3 uMat3;', 'uMat3', {
        varType: 'mat3',
        setArray: [
          {
            glSetter: 'uniformMatrix3fv',
            args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
            expectedValues: [false, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
            testModeValues: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          },
          {
            glSetter: 'uniformMatrix3fv',
            args: [new Float32Array(9).fill(0)],
            expectedValues: [false, new Float32Array(9).fill(0)],
            testModeValues: new Float32Array(9).fill(0),
          },
          {
            glSetter: 'uniformMatrix3fv',
            args: [new Float64Array(9).fill(0)],
            expectedValues: [false, new Float64Array(9).fill(0)],
            testModeValues: new Float64Array(9).fill(0),
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
        value: never
      }>()

      testUniform('uniform mat4 uMat4;', 'uMat4', {
        varType: 'mat4',
        setArray: [
          {
            glSetter: 'uniformMatrix4fv',
            args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
            expectedValues: [false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
            testModeValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          },
          {
            glSetter: 'uniformMatrix4fv',
            args: [new Float32Array(16).fill(0)],
            expectedValues: [false, new Float32Array(16).fill(0)],
            testModeValues: new Float32Array(16).fill(0),
          },
          {
            glSetter: 'uniformMatrix4fv',
            args: [new Float64Array(16).fill(0)],
            expectedValues: [false, new Float64Array(16).fill(0)],
            testModeValues: new Float64Array(16).fill(0),
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
        value: never
      }>()
    })
  })
})
