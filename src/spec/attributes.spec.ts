import { describe } from 'vitest'

import { testAttribute } from './helpers/test-attribute'

describe('createShaderProgram()', () => {
  describe('attributes', () => {
    testAttribute('attribute float aFloat;', 'aFloat', {
      varType: 'float',
      attributeSize: 1,
    }).expectType<{
      type: 'float'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec2 aVec2;', 'aVec2', {
      varType: 'vec2',
      attributeSize: 2,
    }).expectType<{
      type: 'vec2'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec3 aVec3;', 'aVec3', {
      varType: 'vec3',
      attributeSize: 3,
    }).expectType<{
      type: 'vec3'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()

    testAttribute('attribute vec4 aVec4;', 'aVec4', {
      varType: 'vec4',
      attributeSize: 4,
    }).expectType<{
      type: 'vec4'
      location: number
      set: (buffer: WebGLBuffer) => void
    }>()
  })
})
