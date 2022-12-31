const ERRORS: Record<number, string> = {
  0x0500: 'INVALID_ENUM',
  0x0501: 'INVALID_VALUE',
  0x0502: 'INVALID_OPERATION',
  0x0503: 'STACK_OVERFLOW',
  0x0504: 'STACK_UNDERFLOW',
  0x0505: 'OUT_OF_MEMORY',
  0x0506: 'INVALID_FRAMEBUFFER_OPERATION',
  0x0507: 'CONTEXT_LOST',
}

export function handleGlError(gl: WebGL2RenderingContext, name?: string) {
  const glError = gl.getError()
  if (glError) {
    const terms = ['WebGL Error:', name, glError, ERRORS[glError]].filter((term) => term).join(' ')
    console.error(terms)
  }
}
