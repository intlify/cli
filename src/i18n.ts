import path from 'path'
import { promises as fs } from 'fs'
import { isString } from '@intlify/shared'
import { createCoreContext, translate } from '@intlify/core'
import { debug as Debug } from 'debug'
import i18nResourceSchema from '../locales/en.json'

import type {
  Locale,
  LocaleMessages,
  LocaleMessageDictionary,
  CoreContext
} from '@intlify/core'

const debug = Debug('@intlify/cli:i18n')
const DEFAULT_LOCALE = 'en-US'

let resources: LocaleMessages | null = null
let context: CoreContext<unknown, unknown, unknown, string> | null = null

async function loadI18nResources(): Promise<LocaleMessages> {
  const dirents = await fs.readdir(path.resolve(__dirname, '../../locales'), {
    withFileTypes: true
  })
  return dirents.reduce(async (acc, dir) => {
    if (dir.isFile()) {
      const data = await fs.readFile(
        path.resolve(__dirname, '../../locales', dir.name),
        { encoding: 'utf-8' }
      )
      const { name } = path.parse(dir.name)
      debug('load i18n resource', name, data)
      const messages = await acc
      messages[name] = JSON.parse(data) as LocaleMessageDictionary
    }
    return acc
  }, Promise.resolve({} as LocaleMessages))
}

export function getLocale(env?: Record<string, unknown>): Locale {
  env = env || process.env
  const raw =
    ((env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE) as string) ||
    DEFAULT_LOCALE
  debug('getLocale', raw)
  return raw.replace(/\.UTF\-8/g, '').replace(/_/g, '-')
}

export function t<Key extends keyof typeof i18nResourceSchema>(
  key: Key,
  ...args: unknown[]
): string {
  if (context == null) {
    console.error(
      'cannot initialize CoreContext with @intlify/core createCoreContext'
    )
    return key
  }
  const ret = translate(context, key, ...args)
  return isString(ret) ? ret : key
}

export async function initI18n() {
  try {
    resources = await loadI18nResources()
    context = createCoreContext({
      locale: getLocale(),
      fallbackLocale: DEFAULT_LOCALE,
      fallbackWarn: false,
      missingWarn: false,
      warnHtmlMessage: false,
      fallbackFormat: true,
      messages: resources
    })
  } catch (e) {
    debug('load i18n resource errors', e.message)
    throw e
  }
}
