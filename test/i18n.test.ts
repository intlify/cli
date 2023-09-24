import { afterEach, describe, test, vi, expect } from 'vitest'
import { getLocale } from '../src/i18n'

afterEach(() => {
  vi.resetAllMocks()
})

describe('getLocale', () => {
  test('default value', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({})
    expect(getLocale()).toBe('en-US')
  })

  test('basic', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({
      LC_ALL: 'en-GB',
      LC_MESSAGES: 'en-US',
      LANG: 'ja-JP',
      LANGUAGE: 'en'
    })
    expect(getLocale()).toBe('en-GB')
  })
})
