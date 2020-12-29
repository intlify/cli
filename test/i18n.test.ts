import { getLocale } from '../src/i18n'

let ORG_ENV = {}

beforeEach(() => {
  jest.resetModules()
  ORG_ENV = process.env
  process.env = {}
})

afterEach(() => {
  process.env = ORG_ENV
})

describe('getLocale', () => {
  test('default', () => {
    expect(getLocale()).toEqual('en-US')
  })

  test('LC_ALL', () => {
    process.env['LC_ALL'] = 'ja_JP'
    expect(getLocale()).toEqual('ja-JP')
  })

  test('LC_MESSAGES', () => {
    process.env['LC_MESSAGES'] = 'ja_JP'
    expect(getLocale()).toEqual('ja-JP')
  })

  test('LANG', () => {
    process.env['LANG'] = 'ja_JP'
    expect(getLocale()).toEqual('ja-JP')
  })

  test('LANGUAGE', () => {
    process.env['LANGUAGE'] = 'ja_JP'
    expect(getLocale()).toEqual('ja-JP')
  })

  test('BCP-47', () => {
    process.env['LC_ALL'] = 'ja-JP'
    expect(getLocale()).toEqual('ja-JP')
  })
})
