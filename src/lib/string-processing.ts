import { GlslVarQualifier, GlslVarType } from './glsl-types'
import { RemoveComments } from './utility-types'

type Declaration<TQualifier extends GlslVarQualifier | 'member'> = {
  qualifier: TQualifier
  type: GlslVarType
  identifier: string
}

type Struct = {
  identifier: string
  members: Declaration<'member'>[]
}

/** Removes all blocks comment and line comments from a source code string. */
export function removeComments<T extends string>(src: T): RemoveComments<T> {
  return (
    src
      // block comments
      .replace(/\/\*.*?\*\//gms, '')

      // line comments
      .replace(/\/\/.*$/gm, '') as RemoveComments<T>
  )
}

const declarationRegexes = {
  attribute: /(?:attribute)(?:\s+(?:lowp|mediump|highp))?\s+(\w+)\s+(\w+)\s*;/gm,
  uniform: /(?:uniform)(?:\s+(?:lowp|mediump|highp))?\s+(\w+)\s+(\w+)\s*;/gm,
  member: /(?:(?:lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*;/gm,
}

const structRegex = /struct\s+(\w+)\s*{(.*?)}/gm

/** Parse and returns the uniform or attribute declarations from `src`. */
export function parseDeclarations(qualifier: 'member', src: string): Declaration<'member'>[]
export function parseDeclarations(qualifier: 'attribute', src: string): Declaration<'attribute'>[]
export function parseDeclarations(qualifier: 'uniform', src: string): Declaration<'uniform'>[]
export function parseDeclarations(
  qualifier: GlslVarQualifier | 'member',
  src: string,
): Declaration<GlslVarQualifier | 'member'>[] {
  const declarationMatches = Array.from(src.matchAll(declarationRegexes[qualifier]))

  const declarations = declarationMatches.map((declaration) => {
    const type = declaration[1] as GlslVarType
    const identifier = declaration[2].replace(/;$/, '')
    return { qualifier, type, identifier }
  })

  return declarations
}

export function parseStructs(src: string): Struct[] {
  const structMatches = Array.from(src.matchAll(structRegex))

  const structs = structMatches.map((struct) => {
    const [_, identifier, body] = struct
    const members = parseDeclarations('member', body)
    return { identifier, members }
  })

  return structs
}
