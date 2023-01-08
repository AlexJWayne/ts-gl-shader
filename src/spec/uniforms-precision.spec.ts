import { describe } from 'vitest'

import { testUniform } from './helpers/test-uniform'

describe('createShaderProgram()', () => {
  describe('uniforms', () => {
    describe('scalar', () => {
      testUniform('uniform lowp float uFloat;', 'uFloat', {
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

      testUniform('uniform mediump float uFloat;', 'uFloat', {
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

      testUniform('uniform highp float uFloat;', 'uFloat', {
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
    })
  })
})
