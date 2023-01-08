/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: '../dist/hello-world-3d',
    emptyOutDir: true,
  },
})
