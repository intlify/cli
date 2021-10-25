/// <reference path="../chai.shim.d.ts"/>

import { assert, expect } from 'chai'
import { promises as fs } from 'fs'
import { dirname, resolve } from 'pathe'
import { format, FormatLangNotFoundError } from '../../src/api'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('format', () => {
  it('basic', async function () {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/BasicFormat.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const content = format(source, filepath)
    expect(content).to.matchSnapshot(this)
  })

  it('nested', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/HasNested.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = format(source, filepath)
    expect(content).matchSnapshot(this)
  })

  it('oneline', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Oneline.vue')
    const source = await fs.readFile(filepath, 'utf8')
    const content = format(source, filepath)
    expect(content).matchSnapshot(this)
  })

  it('multi', async function () {
    const filepath = resolve(
      __dirname,
      '../fixtures/components/MultiFormat.vue'
    )
    const source = await fs.readFile(filepath, 'utf8')
    const content = format(source, filepath)
    expect(content).matchSnapshot(this)
  })

  it('FormatLangNotFoundError', async function () {
    const filepath = resolve(__dirname, '../fixtures/components/Basic.vue')
    const source = await fs.readFile(filepath, 'utf8')
    assert.throw(() => {
      format(source, filepath)
    }, FormatLangNotFoundError)
  })
})
