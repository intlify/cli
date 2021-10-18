import { promises as fs } from 'fs'
import path from 'pathe'
import chalk from 'chalk'
import createDebug from 'debug'
import { t } from '../i18n'
import { globAsync, hasDiff } from '../utils'
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
  details?: boolean
  attrs?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

type AnnoateStatus = 'none' | 'fine' | 'warn' | 'error'

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
      .option('details', {
        type: 'boolean',
        alias: 'd',
        describe: t('annotated result detail options')
      })
      .option('attrs', {
        type: 'array',
        alias: 'a',
        describe: t('the attributes to annotate')
      })
  }

  const handler = async (args: Arguments<AnnotateOptions>): Promise<void> => {
    const ret = false
    const { source, type, force, details, attrs } = args as AnnotateOptions
    debug('anntate args:', source, type, force, details, attrs)

    if ((type as AnnotateMode) !== 'custom-block') {
      console.log(
        chalk.bold.yellow(
          t(`'--type' is not supported except for 'custom-block'`)
        )
      )
      return
    }

    let counter = 0
    let passCounter = 0
    let fineCounter = 0
    let warnCounter = 0
    let forceCounter = 0
    let ignoreCounter = 0
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
        status = 'none'
        annotated = annotate(data, file, {
          type: 'i18n',
          force,
          attrs,
          onWarn
        })

        if (hasDiff(annotated, data)) {
          status = 'fine'
        }

        if (status === 'fine') {
          console.log(chalk.bold.green(`annotate: ${file}`))
          await fs.writeFile(file, annotated, 'utf8')
          fineCounter++
        } else if (status === 'none') {
          console.log(chalk.white(`pass annotate: ${file}`))
          passCounter++
        } else if (status === 'warn') {
          if (force) {
            console.log(chalk.bold.yellow(`force annotate: ${file}`))
            await fs.writeFile(file, annotated, 'utf8')
            forceCounter++
          } else {
            console.log(chalk.yellow(`ignore annotate: ${file}`))
            ignoreCounter++
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
      )}\n${chalk.bold.green(
        t('{count} annotates', { count: fineCounter })
      )}\n${
        details
          ? `${chalk.white(t('{count} pass', { count: passCounter }))}\n`
          : ''
      }${chalk.bold.yellow(t('{count} warnings', { count: warnCounter }))}\n${
        details
          ? `${chalk.yellow(t('{count} forces', { count: forceCounter }))}\n`
          : ''
      }${
        details
          ? `${chalk.yellow(t('{count} ignores', { count: ignoreCounter }))}\n`
          : ''
      }${chalk.bold.red(t('{count} errors', { count: errorCounter }))}`
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
