# ts-gl-shader

> _Strongly typed no boilerplate WebGL shaders._

<img width="698" alt="image" src="https://user-images.githubusercontent.com/482/210217998-46cf79ad-f7ae-497b-a4e1-b8ebd3fc5d4b.png">

This library will parse your GLSL shaders at the type level and provide an easy to use object for WebGL rendering.

## Work in Progress

This library is current a work in progress. Still to come for 1.0:

- [x] Setting matrix uniforms.
- [ ] Setting uniforms from typed arrays.
- [ ] Ability to monitor set values for tests.
- [x] A 3D example.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Examples](#examples)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [`createShaderProgram()`](#createshaderprogram)
  - [`shaderProgram.use()`](#shaderprogramuse)
  - [`shaderProgram.attributes`](#shaderprogramattributes)
  - [`shaderProgram.uniforms`](#shaderprogramuniforms)

## Features

- Compiles and creates shader programs from vertex and fragment string literals.
- Provides type safety for setting uniforms and attrubutes.
- Caches shader locations on creation for you.
- _FAST!_ Alomst zero overhead from calling the native APIs and allocates no objects or arrays when seting and rendering.

## Installation

Install the library as a production depedency.

```
npm install ts-gl-shader
```

And then import the `createShaderProgram` function.

```typescript
import { createShaderProgram } from 'ts-gl-shader'
```

## Examples

- **Hello World**: [ [code](https://github.com/AlexJWayne/ts-gl-shader/blob/main/examples/hello-world/hello-world.ts) | [view](https://alexjwayne.github.io/ts-gl-shader/hello-world/) ] Render a simple fullscreen shader.
- **Spinning Cube**: [ [code](https://github.com/AlexJWayne/ts-gl-shader/blob/main/examples/hello-world-3d/hello-world-3d.ts) | [view](https://alexjwayne.github.io/ts-gl-shader/hello-world-3d/) ] Render a cube that spins in the viewport

## Usage

First create a file for your shader.

```typescript
// my-shader.ts
import { createShaderProgram } from 'ts-gl-shader'

const vertSrc = /* glsl */ `
  precision mediump float;

  attribute vec2 aVert2;
  attribute vec3 aVert3;
  attribute vec4 aVert4;
  
  uniform vec2 uVec2;
  uniform vec3 uVec3;
  uniform vec4 uVec4;

  uniform float uFloat;
  uniform bool uBool;

  varying vec2 vUV;

  void main() {
    vUV = aVec2;
    gl_Position = vec4(aVert3, 1.0);
  }
` as const

const fragSrc = /* glsl */ `
  precision mediump float;

  uniform int uInt; 
  uniform uint uUnsignedInt;
  uniform vec2 uVec2; 

  varying vec2 vUV;

  void main() {
    gl_FragColor = vec4(vUV, 0.0, 1.0);
  }
` as const

export function createMyShader(gl: WebGL2RenderingContext) {
  return createShaderProgram(gl, { vertSrc, fragSrc })
}
```

Then use and render that shader.

```typescript
// index.ts

import { createMyShader } from './my-shader'

function startGame(gl: WebGL2RenderingContext) {
  const myShader = createMyShader(gl)

  // other setup...

  function render() {
    // Make this shader current, so it's uniforms and attributes can be set.
    myShader.use()

    myShader.attributes.aVert2.set(someBuffer2D)
    myShader.attributes.aVert3.set(someBuffer3D)
    myShader.attributes.aVert4.set(someBuffer4D)

    myShader.uniforms.uFloat.set(1)
    myShader.uniforms.uVec2.set(1, 2)
    myShader.uniforms.uVec3.set(1, 2, 3)
    myShader.uniforms.uVec4.set(1, 2, 3, 4)

    // @ts-expect-error Type safety in attributes
    myShader.attributes.noAttributeHere.set(someBuffer) // type error

    // @ts-expect-error Type safety in uniform properties
    myShader.uniforms.noUniformHere.set(1, 2, 3) // type error

    // @ts-expect-error Type safety in uniform values
    myShader.uniforms.uVec3.set(1) // type error, expected three values for a vec3

    // This library does not make any draw calls for you
    // But it's easy to do yourself.
    gl.drawArrays(gl.TRIANGLES, 0, triangleCount)

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}
```

# API Reference

## `createShaderProgram()`

```typescript
createShaderProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): ShaderProgram
```

Creates and returns a shader program that can be used for rendering.

**_NOTE:_** `vertSrc` and `fragSrc` must be string literals that contain the source code of the shader itself. Otherwise Typescript cannot see the settable properties in the shader. This means you must declare the shader in a typescript file `as const`. This will not work if the shader source code is typed as `string`.

```typescript
// example
const shader = createShaderProgram(gl, `vertex shader source`, `fragment shader source`)
```

## `shaderProgram.use()`

```typescript
shaderProgram.use(fn?: (shaderProgram: ShaderProgram)): void
```

Activates the shader program so that its attributes and uniforms may be set, and the shader may be rendered. This _must_ be called before setting any values or rendering.

```typescript
// example
shader.use()
// set attributes
// set uniforms
// render
```

The method optionally accepts a callback that provides the shader program `use()` was called on, which can reduce verbosity and provide a nice indent for the body of code that works with the shader.

```typescript
// example
deeply.nested.object.shader.use((shader) => {
  // set attributes
  // set uniforms
  // render
})
```

## `shaderProgram.attributes`

```typescript
shaderProgram
  .attributes[attributeNameHere]
    .set(buffer: WebGLBuffer): void
```

Sets a shader attribute to a `WebGLBuffer`. The `size` argument to WebGL that sets the number of values per vertex is set for you based on the data type of the attribute. For instance, a `vec3` will set a size of `3`.

```typescript
// example
shader.use()
shader.attributes.aVert.set(billboardBuffer)
```

## `shaderProgram.uniforms`

```typescript
shaderProgram
  .uniforms[uniformNameHere]
    .set(...values: UniformSetterArgs): void
```

Sets a shader uniform to a specific set of numeric values. The type of this setter function is derived from the type of the uniform in the shader. For instance, a `vec3` would accept three numbers as arguments.

```typescript
// example
shader.use()
shader.uniforms.uColor.set(1, 0, 1, 1) // magenta
```
