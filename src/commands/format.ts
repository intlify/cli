import { promises as fs } from 'fs'
import path from 'pathe'
import chalk from 'chalk'
import createDebug from 'debug'
import { t } from '../i18n'
import { getSourceFiles, hasDiff } from '../utils'
import {
  format,
  FormatLangNotFoundError,
  isSFCParserError,
  SFCAnnotateError
} from '../api'
import { defineFail, RequireError } from './fail'

import type { Arguments, Argv } from 'yargs'
import type { SFCBlock } from '@vue/compiler-sfc'

const debug = createDebug('@intlify/cli:format')

type FormatOptions = {
  source?: string
  type?: string
  dryRun?: boolean
}

export default function defineCommand() {
  const command = 'format'
  const aliases = 'ft'
  const describe = t('format for single-file components')

  const builder = (args: Argv): Argv<FormatOptions> => {
    return args
      .option('source', {
        type: 'string',
        alias: 's',
        describe: t('the source path')
      })
      .option('type', {
        type: 'string',
        alias: 't',
        describe: t('the format type')
      })
      .option('dryRun', {
        type: 'boolean',
        alias: 'd',
        describe: t('target files without formatting')
      })
      .fail(defineFail(RequireError))
  }

  const handler = async (args: Arguments<FormatOptions>): Promise<void> => {
    if (args.type == null) {
      args.type = 'custom-block'
    }

    const { source, type, dryRun } = args as FormatOptions
    debug('format args:', source, type, dryRun)

    if (type !== 'custom-block') {
      throw new RequireError(
        `'--type' is not supported except for 'custom-block'`
      )
    }

    if (source == null && args._.length === 1) {
      throw new RequireError(
        `if you don't specify some files at the end of the command, the '—-source' option is required`
      )
    }

    let counter = 0
    const files = await getSourceFiles({ source, files: args._ as string[] })
    for (const file of files) {
      const parsed = path.parse(file)
      if (parsed.ext !== '.vue') {
        continue
      }

      try {
        const data = await fs.readFile(file, 'utf8')
        if (!!dryRun) {
          const result = format(data, file)
        }
        console.log(chalk.bold.green(`format: ${file}`))
        counter++
      } catch (e: unknown) {
        if (e instanceof FormatLangNotFoundError) {
          // TODO:
        } else if (isSFCParserError(e)) {
          // TODO:
        } else {
          throw e
        }
      }
    }

    console.log('')
    console.log(chalk.bold.white(`${counter} files formatted`))
  }

  return {
    command,
    aliases,
    describe,
    builder,
    handler
  }
}
