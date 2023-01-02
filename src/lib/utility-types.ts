/** Copies the structure of T, but resolves all named types to the their verbose form. */
export type Resolve<T> = //
  T extends Iterable<number> // Don't expand number arrays
    ? T
    : WebGLBuffer extends T // Don't expand `WebGLBuffer`
    ? T
    : T extends (...args: infer TArgs) => infer TReturn // exand function types
    ? (...args: Resolve<TArgs>) => Resolve<TReturn>
    : T extends object // expand object types
    ? T extends infer TObject
      ? { [K in keyof TObject]: Resolve<TObject[K]> }
      : never
    : T

/** Removes block and inline comments. */
export type RemoveComments<T extends string> = T extends `${infer Before}//${string}\n${infer After}`
  ? `${Before}${RemoveComments<After>}\n`
  : T extends `${infer Before}/*${string}*/${infer After}`
  ? `${Before}${RemoveComments<After>}`
  : T
