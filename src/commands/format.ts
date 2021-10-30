import { promises as fs } from 'fs'
import {
  green,
  blue,
  red,
  whiteBright,
  greenBright,
  redBright,
  blueBright,
  yellowBright,
  bold
} from 'colorette'
import path from 'pathe'
import createDebug from 'debug'
import { t } from '../i18n'
import { getPrettierConfig, hasDiff } from '../utils'
import { checkType, checkSource, readIgnore, getSFCFiles } from './utils'
import { format, FormatLangNotFoundError, isSFCParserError } from '../api'
import { defineFail, RequireError } from './fail'

import type { Arguments, Argv } from 'yargs'
import type { Options as PrettierOptions } from 'prettier'

const debug = createDebug('@intlify/cli:format')

type FormatOptions = {
  source?: string
  type?: string
  prettier?: string
  ignore?: string
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
      .option('prettier', {
        type: 'string',
        alias: 'p',
        describe: t('the config file path of prettier')
      })
      .option('ignore', {
        type: 'string',
        alias: 'i',
        describe: t(
          'the ignore configuration path files passed at the end of the options or `--source` option'
        )
      })
      .option('dryRun', {
        type: 'boolean',
        alias: 'd',
        describe: t('target files without formatting')
      })
      .fail(defineFail(RequireError))
  }

  const handler = async (args: Arguments<FormatOptions>): Promise<void> => {
    args.type = args.type || 'custom-block'

    const { source, prettier, ignore, dryRun } = args as FormatOptions
    debug('format args:', args)

    checkType(args.type)
    checkSource(args._.length, source)

    const cwd = process.cwd()

    const prettierConfig = prettier
      ? await getPrettierConfig(path.resolve(cwd, prettier))
      : { filepath: '', config: {} }
    debug('prettier config', prettierConfig)

    if (dryRun) {
      console.log()
      console.log(yellowBright(bold(`${t('dry run mode')}:`)))
      console.log()
    }

    let formattedCounter = 0
    let noChangeCounter = 0
    let errorCounter = 0

    const _ignore = await readIgnore(cwd, ignore)
    const files = await getSFCFiles({
      source,
      files: args._,
      cwd,
      ignore: _ignore
    })
    for (const file of files) {
      try {
        const data = await fs.readFile(file, 'utf8')
        const formatted = format(data, file, {
          prettier: prettierConfig?.config as PrettierOptions
        })
        if (hasDiff(formatted, data)) {
          formattedCounter++
          console.log(green(`${file}: ${t('formatted')}`))
        } else {
          noChangeCounter++
          console.log(blue(`${file}: ${t('no change')}`))
        }
        if (!dryRun) {
          await fs.writeFile(file, formatted, 'utf8')
        }
      } catch (e: unknown) {
        errorCounter++
        if (e instanceof FormatLangNotFoundError) {
          console.error(
            red(`${e.filepath}: ${t(e.message as any)}`) // eslint-disable-line @typescript-eslint/no-explicit-any, @intlify/vue-i18n/no-dynamic-keys
          )
        } else if (isSFCParserError(e)) {
          console.error(red(`${e.message} at ${e.filepath}`))
          e.erorrs.forEach(err => console.error(red(`  ${err.message}`)))
        } else {
          console.error(red((e as Error).message))
        }

        if (!dryRun) {
          throw e
        }
      }
    }

    console.log('')
    console.log(
      whiteBright(bold(t('{count} formattable files', { count: files.length })))
    )
    console.log(
      greenBright(
        bold(t('{count} formatted files', { count: formattedCounter }))
      )
    )
    console.log(
      blueBright(bold(t('{count} no change files', { count: noChangeCounter })))
    )
    if (dryRun) {
      console.log(
        redBright(bold(t('{count} error files', { count: errorCounter })))
      )
    }
    console.log('')
  }

  return {
    command,
    aliases,
    describe,
    builder,
    handler
  }
}
