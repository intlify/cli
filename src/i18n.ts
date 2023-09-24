import path from 'pathe'
import { promises as fs } from 'fs'
import { isString } from '@intlify/shared'
import { createCoreContext, translate } from '@intlify/core'
import { getNavigatorLanguage } from '@intlify/utils/node'
import createDebug from 'debug'
import i18nResourceSchema from '../locales/en.json'

import type {
  Locale,
  LocaleMessages,
  LocaleMessageDictionary,
  CoreContext
} from '@intlify/core'

type I18nReousrceSchema = typeof i18nResourceSchema

const dirname = path.dirname(new URL(import.meta.url).pathname)
const debug = createDebug('@intlify/cli:i18n')

const DEFAULT_LOCALE = 'en-US'

let resources: LocaleMessages<I18nReousrceSchema> | null = null
let context: CoreContext | null = null

async function loadI18nResources(): Promise<
  LocaleMessages<I18nReousrceSchema>
> {
  const dirents = await fs.readdir(path.resolve(dirname, '../locales'), {
    withFileTypes: true
  })
  return dirents.reduce(
    async (acc, dir) => {
      if (dir.isFile()) {
        const data = await fs.readFile(
          path.resolve(dirname, '../locales', dir.name),
          { encoding: 'utf-8' }
        )
        const { name } = path.parse(dir.name)
        debug('load i18n resource', name, data)
        const messages = await acc
        messages[name] = JSON.parse(
          data
        ) as LocaleMessageDictionary<I18nReousrceSchema>
      }
      return acc
    },
    Promise.resolve({} as LocaleMessages<I18nReousrceSchema>)
  )
}

export function getLocale(): Locale {
  return getNavigatorLanguage() || DEFAULT_LOCALE
}

export function t<Key extends keyof I18nReousrceSchema>(
  key: Key,
  ...args: unknown[]
): string {
  if (context == null) {
    console.error(
      'cannot initialize CoreContext with @intlify/core createCoreContext'
    )
    return key
  }
  const ret = Reflect.apply(translate, null, [context, key, ...args])
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
    debug('load i18n resource errors', (e as Error).message)
    throw e
  }
}
