import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { GlslVarsInfo } from './lib/glsl-types'
import { createShaderProgram, ShaderProgram } from './shader-program'
import { gl } from './spec/mock-webgl-context'

describe('createShaderProgram()', () => {
  const vertSrc = /* glsl */ `
    precision mediump float;

    attribute vec2 aVert2;
    attribute vec3 aVert3;
    attribute vec4 aVert4;
    
    uniform vec2 uVec2;
    uniform vec3 uVec3;
    uniform vec4 uVec4;

    uniform float uFloat;
    uniform bool uBool;

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
          'uVec2' | 'uVec3' | 'uVec4' | 'uFloat' | 'uBool' | 'uInt' | 'uUnsignedInt'
        >()
      })

      it('provides types for a uniform', () => {
        expectTypeOf<TestShader['uniforms']['uVec2']>().toMatchTypeOf<{
          type: 'vec2'
          set(x: number, y: number): void
        }>()
      })
    })

    describe('setters', () => {
      function testUniformSetter(
        type: string,
        uniformName: keyof GlslVarsInfo<`${typeof fragSrc}${typeof vertSrc}`, 'uniform'>,
        glUniformSetter: Extract<keyof WebGL2RenderingContext, `uniform${string}`>,
        values: unknown[],
        expected = values,
      ) {
        it(`sets ${type} with ${glUniformSetter}`, () => {
          const location = { someUniformLocationId: 123 }
          vi.spyOn(gl, 'getUniformLocation').mockReturnValue(location)

          const shaderProgram = createShaderProgram(gl, { vertSrc, fragSrc })
          vi.spyOn(gl, glUniformSetter)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uniform = shaderProgram.uniforms[uniformName] as any
          uniform.set(...values)

          expect(gl[glUniformSetter]).toHaveBeenCalledWith(location, ...expected)
        })
      }

      testUniformSetter('float', 'uFloat', 'uniform1f', [1])
      testUniformSetter('int', 'uInt', 'uniform1i', [1])
      testUniformSetter('uint', 'uUnsignedInt', 'uniform1ui', [1])
      testUniformSetter('bool', 'uBool', 'uniform1ui', [true], [1])
      testUniformSetter('vec2', 'uVec2', 'uniform2f', [1, 2])
      testUniformSetter('vec3', 'uVec3', 'uniform3f', [1, 2, 3])
      testUniformSetter('vec4', 'uVec4', 'uniform4f', [1, 2, 3, 4])
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

          const shaderProgram = createShaderProgram(gl, { vertSrc, fragSrc })

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
