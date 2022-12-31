/* eslint-disable no-console */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { gl } from '../spec/mock-webgl-context';

import { handleGlError } from './handle-gl-error';

describe("handleGlError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue()
  })

  describe("when there is no error", () => {
    beforeEach(() => {
      handleGlError(gl)
    })

    it("does nothing", () => {
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe("when there is an error", () => {
    beforeEach(() => {
      vi.spyOn(gl, "getError").mockReturnValue(0x0501)
      handleGlError(gl)
    })

    it("console logs the error", () => {
      expect(console.error).toHaveBeenCalledWith(
        "WebGL Error: 1281 INVALID_VALUE",
      )
    })
  })

  describe("when there is an error and a name", () => {
    beforeEach(() => {
      vi.spyOn(gl, "getError").mockReturnValue(0x0501)
      handleGlError(gl, "rendering my thing")
    })

    it("console logs the error", () => {
      expect(console.error).toHaveBeenCalledWith(
        "WebGL Error: rendering my thing 1281 INVALID_VALUE",
      )
    })
  })
})
