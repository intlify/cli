import { promises as fs } from 'fs'
import path from 'pathe'
import chalk from 'chalk'
import createDebug from 'debug'
import { t } from '../i18n'
import { globAsync } from '../utils'
import {
  annotate,
  AnnotateWarningCodes,
  isSFCParserError,
  SFCAnnotateError
} from '../api/annotate'

import type { Arguments, Argv } from 'yargs'
import type { SFCBlock } from '@vue/compiler-sfc'

const debug = createDebug('@intlify/cli:annotate')

export type AnnotateMode = 'custom-block'

type AnnotateOptions = {
  source: string
  type?: string
  force?: boolean
  attrs?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

type AnnoateStatus = 'fine' | 'warn' | 'error'

export default function defineCommand() {
  const command = 'annotate'
  const aliases = 'at'
  const describe = t('annotate the attributes')

  const builder = (args: Argv): Argv<AnnotateOptions> => {
    return args
      .option('source', {
        type: 'string',
        alias: 's',
        describe: t('the source path'),
        demandOption: true
      })
      .option('type', {
        type: 'string',
        alias: 't',
        describe: t('the annotation type')
      })
      .option('force', {
        type: 'boolean',
        alias: 'f',
        describe: t('forced applying of attributes')
      })
      .option('attrs', {
        type: 'array',
        alias: 'a',
        describe: t('the attributes to annotate')
      })
  }

  const handler = async (args: Arguments<AnnotateOptions>): Promise<void> => {
    const ret = false
    const { source, type, force, attrs } = args as AnnotateOptions
    console.log('anntate args:', source, type, force, attrs)

    if ((type as AnnotateMode) !== 'custom-block') {
      console.log(
        chalk.bold.yellow(
          t(`'--type' is not supported except for 'custom-block'`)
        )
      )
      return
    }

    let counter = 0
    let fineCounter = 0
    let warnCounter = 0
    let errorCounter = 0

    let status: AnnoateStatus = 'fine'
    const onWarn = warnHnadler(() => (status = 'warn'))

    const files = await globAsync(source)
    for (const file of files) {
      const parsed = path.parse(file)
      if (parsed.ext !== '.vue') {
        continue
      }

      const data = await fs.readFile(file, 'utf8')

      let annotated: null | string = null
      try {
        status = 'fine'
        annotated = annotate(data, file, {
          type: 'i18n',
          force,
          ...attrs,
          onWarn
        })
        if (status === 'fine') {
          console.log(chalk.green(`annotate: ${file}`))
          await fs.writeFile(file, annotated, 'utf8')
          fineCounter++
        } else if (status === 'warn') {
          if (force) {
            console.log(chalk.bold.yellow(`annotate (force): ${file}`))
            await fs.writeFile(file, annotated, 'utf8')
          } else {
            console.log(chalk.yellow(`annotate: ${file}`))
          }
          warnCounter++
        }
      } catch (e: unknown) {
        status = 'error'
        errorCounter++
        if (isSFCParserError(e)) {
          console.error(chalk.bold.red(e.message))
          e.erorrs.forEach(err =>
            console.error(chalk.bold.red(`  ${err.message}`))
          )
        } else if (e instanceof SFCAnnotateError) {
          console.error(chalk.bold.red(e.message))
        } else {
          throw e
        }
      }
      counter++
    }

    console.log('')
    console.log(
      `${chalk.bold.white(
        t('{count} annotateable files ', { count: counter })
      )} (${chalk.bold.green(
        t('{count} success', { count: fineCounter })
      )}, ${chalk.bold.yellow(
        t('{count} warnings', { count: warnCounter })
      )}, ${chalk.bold.red(t('{count} errors', { count: errorCounter }))})`
    )

    debug('annotate: ', ret)
  }

  return {
    command,
    aliases,
    describe,
    builder,
    handler
  }
}

function warnHnadler(cb: () => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (code: number, args: Record<string, any>, block: SFCBlock): void => {
    debug(`annotate warning: block => ${JSON.stringify(block)}`)
    switch (code) {
      case AnnotateWarningCodes.NOT_SUPPORTED_TYPE:
        console.log(
          chalk.yellow(
            t(`Unsupported '{type}' block content type: {actual}`, args)
          )
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_ATTR_AND_CONTENT:
        console.log(
          chalk.yellow(
            t(
              "Detected lang mismatch in `lang` attr ('{lang}') and block content ('{content}')",
              args
            )
          )
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_OPTION_AND_CONTENT:
        console.log(
          chalk.yellow(
            t(
              "Detected lang mismatch in `lang` option ('{lang}') and block content ('{content}')",
              args
            )
          )
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_SRC_AND_CONTENT:
        console.log(
          chalk.yellow(
            t(
              "Detected lang mismatch in block `src` ('{src}') and block content ('{content}')",
              args
            )
          )
        )
      default:
        debug(`annotate warning: ${code}`)
        cb()
        break
    }
  }
}
