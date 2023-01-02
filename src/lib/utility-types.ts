/** Copies the structure of T, but resolves all named types to the their verbose form. */
export type Resolve<T> = //
  T extends Iterable<number>
    ? Iterable<number>
    : T extends (...args: infer TArgs) => infer TReturn
    ? (...args: Resolve<TArgs>) => Resolve<TReturn>
    : T extends object
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
