/** Copies the structure of T, but resolves all named types to the their verbose form. */
export type Expand<T> = //
  T extends Iterable<number> // Don't expand number arrays
    ? T
    : WebGLBuffer extends T // Don't expand `WebGLBuffer`
    ? T
    : // Do expand these.
    T extends (...args: infer TArgs) => infer TReturn // expand function types, recurisvely
    ? (...args: Expand<TArgs>) => Expand<TReturn>
    : T extends object // expand object types, recursively
    ? T extends infer TObject
      ? { [K in keyof TObject]: Expand<TObject[K]> }
      : never
    : T

/** Removes block and inline comments. */
export type RemoveComments<T extends string> = T extends `${infer Before}//${string}\n${infer After}`
  ? `${Before}${RemoveComments<After>}\n`
  : T extends `${infer Before}/*${string}*/${infer After}`
  ? `${Before}${RemoveComments<After>}`
  : T

type TrimStart<T extends string> = T extends ` ${infer After}` ? TrimStart<After> : T
type TrimEnd<T extends string> = T extends `${infer Before} ` ? TrimEnd<Before> : T
type Trim<T extends string> = TrimEnd<TrimStart<T>>

/** Return a tuple of string types from splitting T by TSeparator. */
type Split<T, TSeparator extends string> = T extends `${infer Head}${TSeparator}${infer Tail}`
  ? [Head, ...Split<Tail, TSeparator>]
  : [T]

/** Replace TFind with TReplace in T. */
type Replace<
  T extends string,
  TFind extends string,
  TReplace extends string,
  TProcessed extends string = '',
> = T extends `${infer TPre}${TFind}${infer TPost}`
  ? Replace<TPost, TFind, TReplace, `${TProcessed}${TPre}${TReplace}`>
  : `${TProcessed}${T}`

/** Replace non space white space with spaces. */
type UnifyWhiteSpace<T extends string> = Replace<Replace<T, '\t', ' '>, '\n', ' '>

/** Collapses white space in a string to a single space. This makes it MUCH easier to parse. */
type CollapseWhitespace<T extends string> = //
  T extends `${infer TBefore}  ${infer After}` //
    ? CollapseWhitespace<`${TBefore} ${After}`>
    : T

/**
 * Sanitize source code for easy parsing.
 * - Trim whitespace off the ends.
 * - Collapse all consecutive whitespace to a single space character.
 */
export type Clean<T extends string> = CollapseWhitespace<Trim<UnifyWhiteSpace<T>>>

/** Returns a tuple of the whitespace separated tokens in a string. */
export type ParseTokens<T extends string> = Split<Clean<T>, ' '>
