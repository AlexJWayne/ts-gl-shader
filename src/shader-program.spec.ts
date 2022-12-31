import { describe, expect, it, vi } from 'vitest';

import { createShaderProgram, type GlslVarsInfo } from './shader-program';
import { gl } from './spec/mock-webgl-context';

describe("createShaderProgram()", () => {
  const vertSrc = /* glsl */ `
    precision mediump float;

    attribute vec2 aVert2;
    attribute vec3 aVert3;
    attribute vec4 aVert4;
    
    uniform vec2 uVec2;
    uniform vec3 uVec3;
    uniform vec4 uVec4;

    uniform float uVal;
    uniform bool uBool;

    void main() {
      gl_Position = vec4(aVert3, 1.0);
    }
  `

  const fragSrc = /* glsl */ `
    precision mediump float;

    uniform vec2 uVec2;
    uniform int uInt; // only in the fragment shader
    uniform uint uUnsignedInt;

    void main() {
      gl_FragColor = vec4(1.0);
    }
  `

  describe("uniforms", () => {
    function testUniformSetter(
      type: string,
      uniformName: keyof GlslVarsInfo<
        `${typeof fragSrc}${typeof vertSrc}`,
        "uniform"
      >,
      glUniformSetter: Extract<
        keyof WebGL2RenderingContext,
        `uniform${string}`
      >,
      values: unknown[],
      expected = values,
    ) {
      it(`sets ${type} with ${glUniformSetter}`, () => {
        const shaderProgram = createShaderProgram(gl, { vertSrc, fragSrc })
        vi.spyOn(gl, glUniformSetter)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uniform = shaderProgram.uniforms[uniformName] as any
        uniform.set(...values)

        expect(gl[glUniformSetter]).toHaveBeenCalledWith(
          uniform.location,
          ...expected,
        )
      })
    }

    testUniformSetter("float", "uVal", "uniform1f", [1])
    testUniformSetter("float", "uVal", "uniform1fv", [
      new Float32Array(1),
      0,
      1,
    ])

    testUniformSetter("int", "uInt", "uniform1i", [1])
    testUniformSetter("int", "uInt", "uniform1iv", [new Int32Array(1), 0, 1])

    testUniformSetter("uint", "uUnsignedInt", "uniform1ui", [1])
    testUniformSetter("uint", "uUnsignedInt", "uniform1uiv", [
      new Uint32Array(1),
      0,
      1,
    ])

    testUniformSetter("bool", "uBool", "uniform1ui", [true], [1])
    testUniformSetter("bool", "uBool", "uniform1uiv", [new Int32Array(1), 0, 1])

    testUniformSetter("vec2", "uVec2", "uniform2f", [1, 2])
    testUniformSetter("vec2", "uVec2", "uniform2fv", [
      new Float32Array(2),
      0,
      2,
    ])

    testUniformSetter("vec3", "uVec3", "uniform3f", [1, 2, 3])
    testUniformSetter("vec3", "uVec3", "uniform3fv", [
      new Float32Array(3),
      0,
      3,
    ])

    testUniformSetter("vec4", "uVec4", "uniform4f", [1, 2, 3, 4])
    testUniformSetter("vec4", "uVec4", "uniform4fv", [
      new Float32Array(4),
      0,
      4,
    ])
  })

  describe("attributes", () => {
    function testAttributeSetter(
      type: string,
      attributeName: keyof GlslVarsInfo<
        `${typeof fragSrc}${typeof vertSrc}`,
        "attribute"
      >,
      buffer: WebGLBuffer,
      size: number,
    ) {
      it(`sets ${type} with a BufferObject`, () => {
        const shaderProgram = createShaderProgram(gl, { vertSrc, fragSrc })

        vi.spyOn(gl, "bindBuffer")
        vi.spyOn(gl, "vertexAttribPointer")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attribute = shaderProgram.attributes[attributeName] as any
        attribute.set(buffer)

        expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, buffer)
        expect(gl.vertexAttribPointer).toHaveBeenCalledWith(
          shaderProgram.attributes[attributeName].location,
          size,
          gl.FLOAT,
          false,
          0,
          0,
        )
      })
    }

    testAttributeSetter("vec2", "aVert2", gl.createBuffer()!, 2)
    testAttributeSetter("vec3", "aVert3", gl.createBuffer()!, 3)
    testAttributeSetter("vec4", "aVert4", gl.createBuffer()!, 4)
  })
})
