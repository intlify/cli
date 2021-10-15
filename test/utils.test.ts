import { assert } from 'chai'
import sinon from 'sinon'
import fs from 'fs/promises'
import { dirname, resolve } from 'pathe'
import { parse } from '@vue/compiler-sfc'
import {
  getSFCBlocks,
  getSFCContentInfo,
  annotateSFCAttrs,
  getCustomBlockContenType,
  SFCAnnotateError
} from '../src/utils'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('getSFCBlocks', () => {
  it('basic', async () => {
    const data = await fs.readFile(
      resolve(__dirname, './fixtures/components/Basic.vue'),
      'utf8'
    )
    const { descriptor } = parse(data)
    const [template, script, style, i18n] = getSFCBlocks(descriptor)
    assert.equal(template.type, 'template')
    assert.equal(script.type, 'script')
    assert.equal(style.type, 'style')
    assert.equal(i18n.type, 'i18n')
  })

  it('multi', async () => {
    const data = await fs.readFile(
      resolve(__dirname, './fixtures/components/Multi.vue'),
      'utf8'
    )
    const { descriptor } = parse(data)
    const [template, i18n1, scriptSetup, i18n2, docs, style] =
      getSFCBlocks(descriptor)
    assert.equal(template.type, 'template')
    assert.equal(i18n1.type, 'i18n')
    assert.equal(scriptSetup.type, 'script')
    assert.equal(i18n2.type, 'i18n')
    assert.equal(docs.type, 'docs')
    assert.equal(style.type, 'style')
  })

  it('external', async () => {
    const data = await fs.readFile(
      resolve(__dirname, './fixtures/components/External.vue'),
      'utf8'
    )
    const { descriptor } = parse(data)
    const [template, script, i18n] = getSFCBlocks(descriptor)
    assert.equal(template.type, 'template')
    assert.equal(script.type, 'script')
    assert.equal(i18n.type, 'i18n')
  })
})

describe('getSFCContentInfo', () => {
  it('src', async () => {
    const filepath = resolve(__dirname, './fixtures/components/External.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const externalPath = resolve(__dirname, './fixtures/components/external.ts')
    const external = await fs.readFile(externalPath, 'utf8')
    const { descriptor } = parse(source)
    const [, script] = getSFCBlocks(descriptor)
    const { content, lang, contentPath } = getSFCContentInfo(script, filepath)
    assert.equal(content, external)
    assert.equal(lang, 'ts')
    assert.equal(contentPath, externalPath)
  })

  it('lang', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Exist.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const { descriptor } = parse(source)
    const [, i18n] = getSFCBlocks(descriptor)
    const { content, lang, contentPath } = getSFCContentInfo(i18n, filepath)
    assert.equal(content, i18n.content)
    assert.equal(lang, 'json')
    assert.equal(contentPath, filepath)
  })
})

describe('annotateSFCAttrs', () => {
  it('basic', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('basic', content)
    assert.match(content, /lang=\"json\"/)
  })

  it('exist lang', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Exist.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('exist lang', content)
    assert.match(content, /lang=\"json\"/)
  })

  it('no block', async () => {
    const filepath = resolve(__dirname, './fixtures/components/NoBlock.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('no block', content)
    assert.equal(content, source)
    assert.notMatch(content, /<i18n>/)
  })

  it('yaml', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Yaml.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('yaml', content)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('multiple', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Multi.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('multiple', content)
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('external', async () => {
    const filepath = resolve(__dirname, './fixtures/components/External.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath)
    console.log('external', content)
    assert.match(content, /src=\".\/ja.json\"/)
  })

  it('unknown', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Unknown.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotateSFCAttrs(source, filepath, {
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
      './fixtures/components/OptionLangContentMissmatch.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotateSFCAttrs(source, filepath, {
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
      './fixtures/components/LangContentMissmatch.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotateSFCAttrs(source, filepath, {
      type: 'i18n',
      onWarn
    })
    console.log('lang / content missmatch', content)
    assert.equal(onWarn.callCount, 1)
  })

  it('force', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Force.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotateSFCAttrs(source, filepath, {
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
    const filepath = resolve(__dirname, './fixtures/components/Attrs.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotateSFCAttrs(source, filepath, {
      type: 'i18n',
      attrs: { global: true, foo: '<bar>' }
    })
    console.log('atrrs', content)
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /global/)
    assert.match(content, /foo=\"&lt;bar&gt;\"/)
  })

  it('other type', async () => {
    const filepath = resolve(__dirname, './fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    assert.throws(() => {
      annotateSFCAttrs(source, filepath, { type: 'script' })
    }, SFCAnnotateError)
  })
})

describe('getCustomBlockContenType', () => {
  it('json', () => {
    assert.equal(getCustomBlockContenType('{ "foo": 1 }'), 'json')
  })

  it('json5', () => {
    assert.equal(
      getCustomBlockContenType(`{
  foo: 1, buz: { "bar": "hello" } }
`),
      'json5'
    )
  })

  it('yaml', () => {
    assert.equal(
      getCustomBlockContenType(`
foo:
  bar: 1
  buz: "hello"
`),
      'yaml'
    )
  })
})
