import { describe, expectTypeOf } from 'vitest'

import { testUniform } from './helpers/test-uniform'

describe('createShaderProgram()', () => {
  describe('uniforms', () => {
    describe('structs', () => {
      testUniform(
        `
          struct Light { float intensity; };
          uniform Light light;
        `,
        'light.intensity',
        {
          varType: 'float',
          set: [
            {
              glSetter: 'uniform1f',
              args: [1],
              testModeValues: 1,
            },
          ],
        },
        (shaderProgram) => {
          expectTypeOf(shaderProgram.uniforms.light.intensity).toEqualTypeOf<{
            type: 'float'
            location: WebGLUniformLocation
            set: (n: number) => void
            value: never
          }>()
        },
      )
    })
  })
})
