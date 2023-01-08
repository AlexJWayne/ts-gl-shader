import { describe, expect, it, vi } from 'vitest'

import { createShaderProgram, ShaderProgram } from '../shader-program'

import { describeArgs } from './describe-args'
import { gl } from './mock-webgl-context'

/** Test a shader uniform property against the expectation in `expected`. */
export function testUniform<
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
      expectedArgs?: any[]
      testModeValues: any
    }[]

    /** The gl function that is called to set the uniform by an array of values. */
    setArray?: ({
      glSetter: Extract<keyof typeof gl, `uniform${string}`>
      args: any[]
      expectedValues?: any[]
    } & ({ testModeValues: any } | { throws: string }))[]
  },
  additionalTests?: (shaderProgram: TShaderProgram) => void,
) {
  function getUniform(shaderProgram: ShaderProgram<string, string>): any {
    return shaderProgram.uniforms[identifier]
  }

  describe(`"uniform ${identifier} ${expected.varType}"`, () => {
    describe('location', () => {
      it('is the uniform location', () => {
        const aUniformLocation = { aUniformLocation: 123 }
        vi.spyOn(gl, 'getUniformLocation').mockReturnValue(aUniformLocation)
        const shaderProgram = createShaderProgram(gl, src, src)
        expect(getUniform(shaderProgram).location).toEqual(aUniformLocation)
      })
    })

    describe('type', () => {
      it(`is ${expected.varType}`, () => {
        const shaderProgram = createShaderProgram(gl, src, src)
        expect(getUniform(shaderProgram).type).toEqual(expected.varType)
      })
    })

    if (expected.set) {
      describe('set()', () => {
        for (const { glSetter, args, expectedArgs, testModeValues } of expected.set!) {
          it(`when \`set(${describeArgs(args)})\` is invoked it calls \`gl.${glSetter}()\``, () => {
            const shaderProgram = createShaderProgram(gl, src, src)
            vi.spyOn(gl, glSetter)
            const uniform = getUniform(shaderProgram)
            uniform.set(...args)
            expect(gl[glSetter]).toHaveBeenCalledWith(uniform.location, ...(expectedArgs ?? args))
          })

          describe('test mode', () => {
            it('does not save values when not in test mode', () => {
              const shaderProgram = createShaderProgram(gl, src, src)
              const uniform = getUniform(shaderProgram)
              uniform.set(...args)
              expect(uniform.value).toBeUndefined()
            })

            it('saves the last set value when in test mode', () => {
              createShaderProgram.enableTestMode()

              const shaderProgram = createShaderProgram(gl, src, src)
              const uniform = getUniform(shaderProgram)
              uniform.set(...args)
              expect(uniform.value).toEqual(testModeValues)

              createShaderProgram.disableTestMode()
            })
          })
        }
      })
    }

    if (expected.setArray) {
      describe('setArray()', () => {
        for (const expectedOptions of expected.setArray!) {
          const { glSetter, args, expectedValues } = expectedOptions
          const throws = 'throws' in expectedOptions ? expectedOptions.throws : undefined
          const testModeValues = 'testModeValues' in expectedOptions ? expectedOptions.testModeValues : undefined

          describe(`called as \`setArray(${describeArgs(args)})\``, () => {
            if (throws) {
              it(`throws when passed ${describeArgs(args)}`, () => {
                const shaderProgram = createShaderProgram(gl, src, src)
                const uniform = getUniform(shaderProgram)
                expect(() => uniform.setArray(...args)).toThrow(throws)
              })
            } else {
              it(`calls \`gl.${glSetter}()\``, () => {
                const shaderProgram = createShaderProgram(gl, src, src)
                vi.spyOn(gl, glSetter)
                const uniform = getUniform(shaderProgram)
                uniform.setArray(...args)
                expect(gl[glSetter]).toHaveBeenCalledWith(uniform.location, ...(expectedValues ?? args))
              })

              describe('test mode', () => {
                it('does not save values when not in test mode', () => {
                  console.log(args)

                  const shaderProgram = createShaderProgram(gl, src, src)
                  const uniform = getUniform(shaderProgram)
                  uniform.setArray(...args)
                  expect(uniform.value).toBeUndefined()
                })

                it('saves the last set value when in test mode', () => {
                  createShaderProgram.enableTestMode()

                  const shaderProgram = createShaderProgram(gl, src, src)
                  const uniform = getUniform(shaderProgram)
                  uniform.setArray(...args)
                  expect(uniform.value).toEqual(testModeValues)

                  createShaderProgram.disableTestMode()
                })
              })
            }
          })
        }
      })
    }

    additionalTests?.(createShaderProgram(gl, src, src) as any)
  })

  return {
    /** Provide a generic type parameter here to expect the uniform object to extend this type. */
    expectType<T extends TShaderProgram['uniforms'][TIdentifier]>() {},
  }
}
