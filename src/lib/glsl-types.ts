import { Clean, ParseTokens, RemoveComments } from './utility-types'

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

export type GlslPrecision = 'lowp' | 'mediump' | 'highp'

/** Returns an object type with every uniform or attribute. */
export type GlslVarsInfo<
  TSrc extends string,
  TQualifier extends GlslVarQualifier,
  TStructs extends Record<string, Record<string, { type: GlslVarType }>> = GlslStructsInfo<TSrc>,
> = RemoveComments<TSrc> extends `${string}${TQualifier}${infer TDeclaration};${infer TRest}`
  ? ParseTokens<TDeclaration> extends
      | [GlslPrecision, infer TVarType extends GlslVarType | keyof TStructs, infer TIdenitifier extends string]
      | [infer TVarType extends GlslVarType | keyof TStructs, infer TIdenitifier extends string]
    ? {
        [name in TIdenitifier]: TVarType extends keyof TStructs ? TStructs[TVarType] : { type: TVarType }
      } & GlslVarsInfo<TRest, TQualifier>
    : {}
  : {}

export type GlslStructsInfo<TSrc extends string> =
  RemoveComments<TSrc> extends `${string}struct${infer TIdentifier}{${infer TStructBody}};${infer TRest}`
    ? {
        [identifier in Clean<TIdentifier>]: GlslStructMembers<TStructBody>
      } & GlslStructsInfo<TRest>
    : {}

export type GlslStructMembers<TStructBody extends string> =
  Clean<TStructBody> extends `${infer TVarType} ${infer TIdentifier};${infer TRest}`
    ? {
        [identifier in Clean<TIdentifier>]: { type: TVarType }
      } & GlslStructMembers<TRest>
    : {}

type A = GlslStructsInfo<`
  struct Foo {
    float   a;
    vec4 b ;
  };
  uniform A a;
  struct Bar {
    mat4 m;
  };
`>

type B = GlslVarsInfo<
  `
  struct Foo {
    float a;
    vec4 b ;
  };
  struct Bar {
    mat4 m;
  };
  uniform Foo uFoo;
  uniform float uFloat;
  `,
  'uniform'
>
