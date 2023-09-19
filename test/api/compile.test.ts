import { expect, describe, it, vi } from 'vitest'
import path from 'pathe'
import { CompileErrorCodes, compile } from '../../src/api'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

describe('compile', function () {
  it('json', async function () {
    const onCompile = vi.fn()
    const onError = vi.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.json',
      path.resolve(__dirname, '../__generated__/compile/json'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toBe(true)
    expect(onCompile).toHaveBeenCalledTimes(3)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  it('yaml', async function () {
    const onCompile = vi.fn()
    const onError = vi.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.yaml',
      path.resolve(__dirname, '../__generated__/compile/yaml'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toBe(true)
    expect(onCompile).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  it('json5', async function () {
    const onCompile = vi.fn()
    const onError = vi.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.json5',
      path.resolve(__dirname, '../__generated__/compile/json5'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toBe(true)
    expect(onCompile).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  it('other format', async function () {
    const onCompile = vi.fn()
    const onError = vi.fn()
    const ret = await compile(
      './test/fixtures/**.txt',
      path.resolve(__dirname, '../__generated__/compile/other'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toBe(false)
    expect(onCompile).toHaveBeenCalledTimes(0)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBe(
      CompileErrorCodes.NOT_SUPPORTED_FORMAT
    )
  })
})
