import { describe, expect, it } from 'vitest'

import { parseDeclarations, parseStructs, removeComments } from '../lib/string-processing'

describe('string processing', () => {
  describe('removeComments', () => {
    it('removes block comments', () => {
      expect(removeComments('/* comment */')).toEqual('')
      expect(removeComments(`pre/* comment//*/mid/* more comment */post`)).toEqual('premidpost')
    })

    it('removes line comments', () => {
      expect(removeComments(`// hiding in plain sight`)).toEqual('')
      expect(removeComments('pre\n//mid\npost')).toEqual('pre\n\npost')
    })
  })

  describe('parseDeclarations', () => {
    it('parses a simple attribute', () => {
      expect(parseDeclarations('attribute', `attribute vec4 position;`)).toEqual([
        { qualifier: 'attribute', type: 'vec4', identifier: 'position' },
      ])
    })

    it('parses an attribute with precision', () => {
      expect(parseDeclarations('attribute', `attribute mediump vec4 position;`)).toEqual([
        { qualifier: 'attribute', type: 'vec4', identifier: 'position' },
      ])
    })

    it('parses a simple uniform', () => {
      expect(parseDeclarations('uniform', `uniform vec4 position;`)).toEqual([
        { qualifier: 'uniform', type: 'vec4', identifier: 'position' },
      ])
    })

    it('parses a uniform with precision', () => {
      expect(parseDeclarations('uniform', `uniform mediump vec4 position;`)).toEqual([
        { qualifier: 'uniform', type: 'vec4', identifier: 'position' },
      ])
    })
  })

  describe('parseStructs', () => {
    it('parses a simple struct', () => {
      expect(parseStructs(`struct Light { float intensity; };`)).toEqual({
        Light: [{ qualifier: 'member', type: 'float', identifier: 'intensity' }],
      })
    })

    it('parses a struct is precision', () => {
      expect(parseStructs(`struct Light { highp float intensity; };`)).toEqual({
        Light: [{ qualifier: 'member', type: 'float', identifier: 'intensity' }],
      })
    })
  })
})
