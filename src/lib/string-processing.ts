import { GlslVarQualifier, GlslVarType } from './glsl-types'
import { RemoveComments } from './utility-types'

export type Declaration<TQualifier extends GlslVarQualifier | 'member'> = {
  qualifier: TQualifier
  type: GlslVarType
  identifier: string
}

export type Structs = Record<string, Declaration<'member'>[]>

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

/** Parse and return structs and their members from `src`. */
export function parseStructs(src: string): Structs {
  const structMatches = Array.from(src.matchAll(structRegex))

  return structMatches.reduce<Structs>((structs, struct) => {
    const [_, identifier, body] = struct
    const members = parseDeclarations('member', body)
    structs[identifier] = members
    return structs
  }, {})
}
