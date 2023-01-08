/** Returns the arguments of a uniform setter as something suitable for use in a test name. */
export function describeArgs(args: unknown[]) {
  return args
    .map((arg: any) => {
      if (Array.isArray(arg)) return `[${arg.map((n) => typeof n).join(',')}]`
      if (typeof arg === 'object') {
        if ('length' in arg) return `${arg.constructor.name}[${arg.length}]`
        return arg.constructor.name
      }
      if (typeof arg === 'boolean') return arg
      return typeof arg
    })
    .join(', ')
}
