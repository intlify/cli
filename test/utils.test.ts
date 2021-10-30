/// <reference path="./chai.shim.d.ts"/>

import { assert } from 'chai'
import { promises as fs } from 'fs'
import { dirname, resolve, relative, parse as pathParse } from 'pathe'
import { parse } from '@vue/compiler-sfc'
import {
  getSourceFiles,
  getSFCBlocks,
  getSFCContentInfo,
  getCustomBlockContenType,
  hasDiff
} from '../src/utils'
import { VUE_COMPONENT_FIXTURES } from './contents'

const __dirname = dirname(new URL(import.meta.url).pathname)
const EXPECTABLE_FILES = VUE_COMPONENT_FIXTURES.map(
  fixture => `fixtures/components/${fixture}`
)

describe('getSourceFiles', function () {
  it('source', async function () {
    const source = resolve(__dirname, './fixtures/**/*.vue')
    const files = await getSourceFiles({ source })
    assert.deepEqual(
      files.map(file => relative(__dirname, file)),
      EXPECTABLE_FILES
    )
  })

  it('files', async function () {
    const files = ['annotate', ...EXPECTABLE_FILES]
    const actual = await getSourceFiles({ files })
    assert.deepEqual(actual, files.splice(1))
  })

  it('filter', async function () {
    const source = resolve(__dirname, './fixtures/**/*.*')
    const files = await getSourceFiles({ source }, file => {
      const parsed = pathParse(file as string)
      return parsed.ext === '.vue'
    })
    assert.deepEqual(
      files.map(file => relative(__dirname, file)),
      EXPECTABLE_FILES
    )
  })
})

describe('getSFCBlocks', function () {
  it('basic', async function () {
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

  it('multi', async function () {
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

  it('external', async function () {
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

describe('getSFCContentInfo', function () {
  it('src', async function () {
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

  it('lang', async function () {
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

describe('getCustomBlockContenType', function () {
  it('json', function () {
    assert.equal(getCustomBlockContenType('{ "foo": 1 }'), 'json')
  })

  it('json5', function () {
    assert.equal(
      getCustomBlockContenType(`{
  foo: 1, buz: { "bar": "hello" } }
`),
      'json5'
    )
  })

  it('yaml', function () {
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

describe('hasDiff', function () {
  it('not equal', function () {
    assert.equal(hasDiff('foo', 'bar'), true)
  })

  it('equal', function () {
    assert.equal(hasDiff('foo', 'foo'), false)
  })
})
