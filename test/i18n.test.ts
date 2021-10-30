import { assert } from 'chai'
import { getLocale } from '../src/i18n'

let ORG_ENV = {}

beforeEach(function () {
  ORG_ENV = process.env
  process.env = {}
})

afterEach(function () {
  process.env = ORG_ENV
})

describe('getLocale', function () {
  it('default', function () {
    assert.equal(getLocale(), 'en-US')
  })

  it('LC_ALL', function () {
    process.env['LC_ALL'] = 'ja_JP'
    assert.equal(getLocale(), 'ja-JP')
  })

  it('LC_MESSAGES', function () {
    process.env['LC_MESSAGES'] = 'ja_JP'
    assert.equal(getLocale(), 'ja-JP')
  })

  it('LANG', function () {
    process.env['LANG'] = 'ja_JP'
    assert.equal(getLocale(), 'ja-JP')
  })

  it('LANGUAGE', function () {
    process.env['LANGUAGE'] = 'ja_JP'
    assert.equal(getLocale(), 'ja-JP')
  })

  it('BCP-47', function () {
    process.env['LC_ALL'] = 'ja-JP'
    assert.equal(getLocale(), 'ja-JP')
  })
})
