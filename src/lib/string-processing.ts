import { RemoveComments } from './utility-types'

export function removeComments<T extends string>(src: T): RemoveComments<T> {
  return (
    src
      // block comments
      .replace(/\/\*.*?\*\//gms, '')

      // line comments
      .replace(/\/\/.*$/gm, '') as RemoveComments<T>
  )
}
