import { promises as fs } from 'fs'
import { green, white, yellow, red, yellowBright, bold } from 'colorette'
import createDebug from 'debug'
import { t } from '../i18n'
import { hasDiff } from '../utils'
import { checkType, checkSource, readIgnore, getSFCFiles } from './utils'
import {
  annotate,
  AnnotateWarningCodes,
  isSFCParserError,
  SFCAnnotateError
} from '../api'
import { defineFail, RequireError } from './fail'

import type { Arguments, Argv } from 'yargs'
import type { SFCBlock } from '@vue/compiler-sfc'

const debug = createDebug('@intlify/cli:annotate')

export type AnnotateMode = 'custom-block'

type AnnotateOptions = {
  source?: string
  type?: string
  force?: boolean
  details?: boolean
  attrs?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  vue?: number
  ignore?: string
  dryRun?: boolean
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
        describe: t('the source path')
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
        alias: 'V',
        describe: t('annotated result detail options')
      })
      .option('attrs', {
        type: 'array',
        alias: 'a',
        describe: t('the attributes to annotate')
      })
      .option('vue', {
        type: 'number',
        alias: 'v',
        describe: t('the vue template compiler version'),
        default: 3
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
        describe: t('target files without annotating')
      })
      .fail(defineFail(RequireError))
  }

  const handler = async (args: Arguments<AnnotateOptions>): Promise<void> => {
    args.type = args.type || 'custom-block'

    const { source, force, details, attrs, vue, ignore, dryRun } =
      args as AnnotateOptions
    debug('annotate args:', args)

    checkType(args.type)
    checkSource(args._.length, source)

    if (dryRun) {
      console.log()
      console.log(yellowBright(bold(`${t('dry run mode')}:`)))
      console.log()
    }

    let counter = 0
    let passCounter = 0
    let fineCounter = 0
    let warnCounter = 0
    let forceCounter = 0
    let ignoreCounter = 0
    let errorCounter = 0

    function printStats() {
      console.log('')
      console.log(
        white(bold(t('{count} annotateable files ', { count: counter })))
      )
      console.log(
        green(bold(t('{count} annotated files', { count: fineCounter })))
      )
      if (details) {
        console.log(
          white(bold(t('{count} passed files', { count: passCounter })))
        )
      }
      console.log(yellow(t('{count} warned files', { count: warnCounter })))
      if (details) {
        console.log(yellow(t('{count} forced files', { count: forceCounter })))
        console.log(
          yellow(t('{count} ignored files', { count: ignoreCounter }))
        )
      }
      console.log(red(t('{count} error files', { count: errorCounter })))
      console.log('')
    }

    let status: AnnoateStatus = 'fine'
    const onWarn = warnHnadler(() => (status = 'warn'))

    const cwd = process.cwd()
    const _ignore = await readIgnore(cwd, ignore)
    const files = await getSFCFiles({
      source,
      files: args._,
      cwd,
      ignore: _ignore
    })

    for (const file of files) {
      const data = await fs.readFile(file, 'utf8')

      let annotated: null | string = null
      try {
        status = 'none'
        annotated = await annotate(data, file, {
          type: 'i18n',
          force,
          attrs,
          vue,
          onWarn
        })

        if (hasDiff(annotated, data)) {
          status = 'fine'
        }

        if (status === 'fine') {
          fineCounter++
          console.log(green(`${file}: ${t('annotate')}`))
          if (!dryRun) {
            await fs.writeFile(file, annotated, 'utf8')
          }
        } else if (status === 'none') {
          passCounter++
          console.log(white(`${file}: ${t('pass annotate')}`))
        } else if (status === 'warn') {
          warnCounter++
          if (force) {
            forceCounter++
            console.log(yellow(`${file}: ${t('force annotate')}`))
            if (!dryRun) {
              await fs.writeFile(file, annotated, 'utf8')
            }
          } else {
            ignoreCounter++
            console.log(yellow(`${file}: ${t('ignore annotate')}`))
          }
        }
      } catch (e: unknown) {
        status = 'error'
        errorCounter++
        if (isSFCParserError(e)) {
          console.error(red(bold(`${e.message} at ${e.filepath}`)))
          e.erorrs.forEach(err => console.error(red(`  ${err.message}`)))
        } else if (e instanceof SFCAnnotateError) {
          console.error(
            red(`${e.filepath}: ${t(e.message as any)}`) // eslint-disable-line @typescript-eslint/no-explicit-any, @intlify/vue-i18n/no-dynamic-keys
          )
        } else {
          console.error(red((e as Error).message))
        }
        if (!dryRun) {
          throw e
        }
      }
      counter++
    }

    printStats()
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
          yellow(t(`Unsupported '{type}' block content type: {actual}`, args))
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_ATTR_AND_CONTENT:
        console.log(
          yellow(
            t(
              "Detected lang mismatch in `lang` attr ('{lang}') and block content ('{content}')",
              args
            )
          )
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_OPTION_AND_CONTENT:
        console.log(
          yellow(
            t(
              "Detected lang mismatch in `lang` option ('{lang}') and block content ('{content}')",
              args
            )
          )
        )
      case AnnotateWarningCodes.LANG_MISMATCH_IN_SRC_AND_CONTENT:
        console.log(
          yellow(
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
