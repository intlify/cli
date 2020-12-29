import path from 'path'
import { CompileErrorCodes, compile } from '../src/api'

afterEach(() => {
  jest.clearAllMocks()
})

describe('compile', () => {
  test('json', async () => {
    const onCompile = jest.fn()
    const onError = jest.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.json',
      path.resolve(__dirname, './__generated__/compile/json'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toEqual(true)
    expect(onCompile).toHaveBeenCalledTimes(3)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('yaml', async () => {
    const onCompile = jest.fn()
    const onError = jest.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.yaml',
      path.resolve(__dirname, './__generated__/compile/yaml'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toEqual(true)
    expect(onCompile).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('json5', async () => {
    const onCompile = jest.fn()
    const onError = jest.fn()
    const ret = await compile(
      './test/fixtures/codegen/**.json5',
      path.resolve(__dirname, './__generated__/compile/json5'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toEqual(true)
    expect(onCompile).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('other format', async () => {
    const onCompile = jest.fn()
    const onError = jest.fn()
    const ret = await compile(
      './test/fixtures/**.txt',
      path.resolve(__dirname, './__generated__/compile/other'),
      {
        onCompile,
        onError
      }
    )
    expect(ret).toEqual(false)
    expect(onCompile).toHaveBeenCalledTimes(0)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toEqual(
      CompileErrorCodes.NOT_SUPPORTED_FORMAT
    )
  })
})
