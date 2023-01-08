import 'webgl-mock';

export const gl = new HTMLCanvasElement().getContext(
  "webgl",
) as WebGL2RenderingContext

// missing in webgl-mock
gl.uniform1ui = () => undefined
gl.uniform1uiv = () => undefined

gl.getError = () => 0
