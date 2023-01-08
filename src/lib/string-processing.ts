import { GlslVarQualifier, GlslVarType } from './glsl-types'
import { RemoveComments } from './utility-types'

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

/** Parse and returns the uniform or attribute declarations from `src`. */
export function parseDeclarations<TQualifier extends GlslVarQualifier>(
  qualifier: TQualifier,
  src: string,
): {
  qualifier: TQualifier
  type: GlslVarType
  identifier: string
}[] {
  const declarationRegex =
    qualifier === 'attribute' //
      ? /(?:attribute)\s+\w+\s+\w+\s*;/gm
      : /(?:uniform)\s+\w+\s+\w+\s*;/gm

  const declarations = src.match(declarationRegex) ?? []

  return declarations.map((declaration) => {
    const tokens = declaration.split(/\s+/gm).map((s) => s.trim()) as [TQualifier, GlslVarType, string]

    return {
      qualifier,
      type: tokens[1],
      identifier: tokens[2].replace(/;$/, ''),
    }
  })
}
