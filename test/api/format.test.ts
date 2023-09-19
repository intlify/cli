import { assert, expect, describe, it } from 'vitest'
import { promises as fs } from 'fs'
import { dirname, resolve } from 'pathe'
import { format, FormatLangNotFoundError } from '../../src/api'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('format', function () {
  it('basic', async function () {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/BasicFormat.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const content = await format(source, filepath)
    expect(content).toMatchSnapshot()
  })

  it('nested', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/HasNested.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = await format(source, filepath)
    expect(content).toMatchSnapshot()
  })

  it('oneline', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Oneline.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = await format(source, filepath)
    expect(content).toMatchSnapshot()
  })

  it('multi', async function () {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/MultiFormat.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const content = await format(source, filepath)
    expect(content).toMatchSnapshot()
  })

  it('vue 2', async function () {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/FunctionalLangFill.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const content = await format(source, filepath, { vue: 2 })
    expect(content).toMatchSnapshot()
  })

  it('FormatLangNotFoundError', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    let err
    try {
      await format(source, filepath)
    } catch (e) {
      err = e
    }
    assert.instanceOf(err, FormatLangNotFoundError)
  })
})
