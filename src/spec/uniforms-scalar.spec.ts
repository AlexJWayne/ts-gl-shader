import { describe } from 'vitest'

import { testUniform } from './helpers/test-uniform'

describe('createShaderProgram()', () => {
  describe('uniforms', () => {
    describe('scalar', () => {
      testUniform('uniform float uFloat;', 'uFloat', {
        varType: 'float',
        set: [
          {
            glSetter: 'uniform1f',
            args: [1],
            testModeValues: 1,
          },
        ],
      }).expectType<{
        type: 'float'
        location: WebGLUniformLocation
        set: (n: number) => void
        value: never
      }>()

      testUniform('uniform int uInt;', 'uInt', {
        varType: 'int',
        set: [
          {
            glSetter: 'uniform1i',
            args: [1],
            testModeValues: 1,
          },
        ],
      }).expectType<{
        type: 'int'
        location: WebGLUniformLocation
        set: (n: number) => void
        value: never
      }>()

      testUniform('uniform uint uUint;', 'uUint', {
        varType: 'uint',
        set: [
          {
            glSetter: 'uniform1ui',
            args: [1],
            testModeValues: 1,
          },
        ],
      }).expectType<{
        type: 'uint'
        location: WebGLUniformLocation
        set: (n: number) => void
        value: never
      }>()

      testUniform('uniform bool uBool;', 'uBool', {
        varType: 'bool',
        set: [
          {
            glSetter: 'uniform1ui',
            args: [false],
            expectedArgs: [0],
            testModeValues: 0,
          },
          {
            glSetter: 'uniform1ui',
            args: [true],
            expectedArgs: [1],
            testModeValues: 1,
          },
        ],
      }).expectType<{
        type: 'bool'
        location: WebGLUniformLocation
        set: (b: boolean) => void
        value: never
      }>()
    })
  })
})
