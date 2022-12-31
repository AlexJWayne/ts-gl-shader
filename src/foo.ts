import { Parse } from 'ts-glsl';

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 normal;
  
  uniform float value;
  uniform vec2 vec2Value;
  uniform mat4 mat4Value;

  varying vec2 uv;

  void main() {
      gl_Position = vec4(position, 1.0);
      uv = position.xy;
  }
`
const frag = /* glsl */ `
  uniform vec4 value4;
  varying vec2 uv;
  void main() {
      gl_Position = vec4(position, 1.0);
      uv = position.xy;
  }
`

/** Maps uniform types the their setter arguments. */
type ArgsForType = {
  float: [n: number]
  vec2: [x: number, y: number]
  vec3: [x: number, y: number, z: number]
  vec4: [x: number, y: number, z: number, w: number]
}

type Qualifier = "attribute" | "uniform"

/** Returns the settable declarations from a parsed AST for a specific qualifier. */
type SettableVariableDeclarations<
  TSrc extends unknown[],
  TQualifier extends Qualifier = Qualifier,
> = {
  [K in keyof TSrc as TSrc[K] extends {
    typeQualifier: TQualifier
    identifier: infer TIdentifier extends string
  }
    ? TIdentifier
    : never]: TSrc[K] extends {
    typeSpecifier: infer TType extends keyof ArgsForType
  }
    ? TType
    : never
}

// test T1
type T1 = SettableVariableDeclarations<
  Parse<typeof vertex>["body"],
  "attribute"
>

/** The function that sets the value of a uniform. */
type UniformSetter<
  TDeclarations extends SettableVariableDeclarations<unknown[], "uniform">,
  K extends keyof TDeclarations,
> = (
  ...values: TDeclarations[K] extends keyof ArgsForType
    ? ArgsForType[TDeclarations[K]]
    : [never]
) => void

/** The function that sets the value of an attribute. */
type AttributeSetter = (buffer: WebGLBuffer) => void

/** Maps the settable declarations to their setter functions. */
type Settables<
  TQualifier extends Qualifier,
  TDeclarations extends SettableVariableDeclarations<unknown[], TQualifier>,
> = {
  [K in keyof TDeclarations]: {
    set: TQualifier extends "uniform"
      ? UniformSetter<TDeclarations, K>
      : AttributeSetter
  }
}

// test T2
type T2 = Resolve<
  Settables<
    "uniform",
    SettableVariableDeclarations<Parse<typeof vertex>["body"], "uniform">
  >
>

/** Copies the structure of T, but resolves all named types to the their verbose form. */
export type Resolve<T> = //
  T extends (...args: infer TArgs) => infer TReturn
    ? (...args: Resolve<TArgs>) => Resolve<TReturn>
    : T extends object
    ? T extends infer TObject
      ? { [K in keyof TObject]: Resolve<TObject[K]> }
      : never
    : T

/** Type entry point that takes both shader sources as string literals and returns the full shader object. */
type ShaderObject<TVertSrc extends string, TFragSrc extends string> = Resolve<{
  uniforms: Settables<
    "uniform",
    SettableVariableDeclarations<
      Parse<`${TVertSrc}\n${TFragSrc}`>["body"],
      "uniform"
    >
  >
  attributes: Settables<
    "attribute",
    SettableVariableDeclarations<
      Parse<`${TVertSrc}\n${TFragSrc}`>["body"],
      "attribute"
    >
  >
}>

declare const shaderObject: ShaderObject<typeof vertex, typeof frag>
shaderObject.uniforms.vec2Value.set(1, 2)
shaderObject.uniforms.value4.set(1, 2, 3, 4)
shaderObject.attributes.position.set(new WebGLBuffer())
