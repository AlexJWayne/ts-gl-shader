import { ParseTokens, RemoveComments } from './utility-types'

export type GlslVarQualifier = 'uniform' | 'attribute'

/** All supported GLSL var types. */
export type GlslVarType =
  | 'bool' //
  | 'int'
  | 'uint'
  | 'float'
  | `vec${2 | 3 | 4}`
  | `mat${2 | 3 | 4}`
// | 'double'
// | `${'' | 'u' | 'i' | 'b'}vec${2 | 3 | 4}`
// | `${'' | 'u' | 'i'}sampler${1 | 2 | 3}D`

/** Returns an object type with every uniform or attribute. */
export type GlslVarsInfo<
  TSrc extends string,
  TQualifier extends GlslVarQualifier,
> = RemoveComments<TSrc> extends `${string}${TQualifier}${infer TDeclaration};${infer TRest}`
  ? ParseTokens<TDeclaration> extends [infer TVarType extends GlslVarType, infer TIdenitifier extends string]
    ? { [name in TIdenitifier]: { type: TVarType } } & GlslVarsInfo<TRest, TQualifier>
    : {}
  : {}
