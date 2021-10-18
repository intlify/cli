/// <reference path="../chai.shim.d.ts"/>

import { assert, expect } from 'chai'
import sinon from 'sinon'
import { promises as fs } from 'fs'
import { dirname, resolve } from 'pathe'
import { annotate, SFCAnnotateError } from '../../src/api'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('annotate', () => {
  it('basic', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).to.matchSnapshot(this)
    assert.match(content, /lang=\"json\"/)
  })

  it('exist lang', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Exist.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).matchSnapshot(this)
    assert.match(content, /lang=\"json\"/)
  })

  it('no block', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/NoBlock.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).matchSnapshot(this)
    assert.equal(content, source)
    assert.notMatch(content, /<i18n>/)
  })

  it('yaml', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Yaml.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).matchSnapshot(this)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('multiple', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Multi.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).matchSnapshot(this)
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /lang=\"yaml\"/)
  })

  it('external', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/External.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath)
    expect(content).matchSnapshot(this)
    assert.match(content, /src=\".\/ja.json\"/)
  })

  it('unknown', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Unknown.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      onWarn,
      attrs: {}
    })
    expect(content).matchSnapshot(this)
    assert.equal(onWarn.callCount, 1)
  })

  it('option lang / content lang missmatch', async function () {
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
    expect(content).matchSnapshot(this)
    assert.equal(onWarn.callCount, 1)
  })

  it('lang / content lang missmatch', async function () {
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
    expect(content).matchSnapshot(this)
    assert.equal(onWarn.callCount, 1)
  })

  it('force', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Force.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const onWarn = sinon.spy()
    const content = annotate(source, filepath, {
      type: 'i18n',
      force: true,
      onWarn,
      attrs: { lang: 'json' }
    })
    expect(content).matchSnapshot(this)
    assert.match(content, /lang=\"json\"/)
    assert.equal(onWarn.callCount, 1)
  })

  it('attrs', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Attrs.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = annotate(source, filepath, {
      type: 'i18n',
      attrs: { global: true, foo: '<bar>' }
    })
    assert.match(content, /lang=\"json5\"/)
    assert.match(content, /global/)
    assert.match(content, /foo=\"&lt;bar&gt;\"/)
  })

  it('other type', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    assert.throws(() => {
      annotate(source, filepath, { type: 'script' })
    }, SFCAnnotateError)
  })
})
