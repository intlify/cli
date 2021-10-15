import { assert } from 'chai'
import sinon from 'sinon'
import path from 'pathe'
import { CompileErrorCodes, compile } from '../src/api'

const dirname = path.dirname(new URL(import.meta.url).pathname)

describe('compile', () => {
  it('json', async () => {
    const onCompile = sinon.spy()
    const onError = sinon.spy()
    const ret = await compile(
      './test/fixtures/codegen/**.json',
      path.resolve(dirname, './__generated__/compile/json'),
      {
        onCompile,
        onError
      }
    )
    assert.equal(ret, true)
    assert.equal(onCompile.callCount, 3)
    assert.equal(onError.callCount, 0)
  })

  it('yaml', async () => {
    const onCompile = sinon.spy()
    const onError = sinon.spy()
    const ret = await compile(
      './test/fixtures/codegen/**.yaml',
      path.resolve(dirname, './__generated__/compile/yaml'),
      {
        onCompile,
        onError
      }
    )
    assert.equal(ret, true)
    assert.equal(onCompile.callCount, 1)
    assert.equal(onError.callCount, 0)
  })

  it('json5', async () => {
    const onCompile = sinon.spy()
    const onError = sinon.spy()
    const ret = await compile(
      './test/fixtures/codegen/**.json5',
      path.resolve(dirname, './__generated__/compile/json5'),
      {
        onCompile,
        onError
      }
    )
    assert.equal(ret, true)
    assert.equal(onCompile.callCount, 1)
    assert.equal(onError.callCount, 0)
  })

  it('other format', async () => {
    const onCompile = sinon.spy()
    const onError = sinon.spy()
    const ret = await compile(
      './test/fixtures/**.txt',
      path.resolve(dirname, './__generated__/compile/other'),
      {
        onCompile,
        onError
      }
    )
    assert.equal(ret, false)
    assert.equal(onCompile.callCount, 0)
    assert.equal(onError.callCount, 1)
    assert.equal(
      onError.getCall(0).args[0],
      CompileErrorCodes.NOT_SUPPORTED_FORMAT
    )
  })
})
