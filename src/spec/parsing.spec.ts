import { describe, expect, it } from 'vitest'

import { createShaderProgram } from '../shader-program'

import { gl } from './mock-webgl-context'

describe('createShaderProgram()', () => {
  describe('parsing', () => {
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
  })
})
