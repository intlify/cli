import { assert } from 'chai'
import sinon from 'sinon'
import { promises as fs } from 'fs'
import { dirname, resolve } from 'pathe'
import { annotate, SFCAnnotateError } from '../../src/api'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('annotate', () => {
  it('basic', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('basic', content)
    assert.match(content, /lang=\"json\"/)
  })

  it('exist lang', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Exist.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('exist lang', content)
    assert.match(content, /lang=\"json\"/)
  })

  it('no block', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/NoBlock.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('no block', content)
    assert.equal(content, source)
    assert.notMatch(content, /<i18n>/)
  })

  it('yaml', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Yaml.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('yaml', content)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('multiple', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Multi.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('multiple', content)
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('external', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/External.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    console.log('external', content)
    assert.match(content, /src=\".\/ja.json\"/)
  })

  it('unknown', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Unknown.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      onWarn,
      attrs: {}
    })
    console.log('unknwon', content)
    assert.equal(onWarn.callCount, 1)
  })

  it('option lang / content lang missmatch', async () => {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/OptionLangContentMissmatch.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      onWarn,
      attrs: { lang: 'json' }
    })
    console.log('option lang / content missmatch', content)
    assert.equal(onWarn.callCount, 1)
  })

  it('lang / content lang missmatch', async () => {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/LangContentMissmatch.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      onWarn
    })
    console.log('lang / content missmatch', content)
    assert.equal(onWarn.callCount, 1)
  })

  it('force', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Force.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      force: true,
      onWarn,
      attrs: { lang: 'json' }
    })
    console.log('force', content)
    assert.match(content, /lang=\"json\"/)
    assert.equal(onWarn.callCount, 1)
  })

  it('attrs', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Attrs.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath, {
      type: 'i18n',
      attrs: { global: true, foo: '<bar>' }
    })
    console.log('atrrs', content)
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /global/)
    assert.match(content, /foo=\"&lt;bar&gt;\"/)
  })

  it('other type', async () => {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    assert.throws(() => {
      annotate(source, filepath, { type: 'script' })
    }, SFCAnnotateError)
  })
})
