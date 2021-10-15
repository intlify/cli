import { promises as fs } from 'fs'
import path from 'pathe'
import chalk from 'chalk'
import createDebug from 'debug'
import { t } from '../i18n'
import { globAsync, getCustomBlockContenType } from '../utils'
import { parse } from '@vue/compiler-sfc'

import type { Arguments, Argv } from 'yargs'

const debug = createDebug('@intlify/cli:annotate')
const dirname = path.dirname(new URL(import.meta.url).pathname)

export type AnnotateMode = 'custom-block'

type AnnotateOptions = {
  target: string
  type: string
  attrs: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function defineCommand() {
  const command = 'annotate'
  const aliases = 'at'
  const describe = t('annotate the attributes')

  const builder = (args: Argv): Argv<AnnotateOptions> => {
    return args
      .option('target', {
        type: 'string',
        alias: 't',
        describe: t('the target path'),
        demandOption: true
      })
      .option('type', {
        type: 'string',
        alias: 't',
        default: 'custom-block',
        describe: t('the annotation type')
      })
      .option('attrs', {
        alias: 'a',
        default: {},
        describe: t('the attributes to annotate')
      })
  }

  const handler = async (args: Arguments<AnnotateOptions>): Promise<void> => {
    const ret = false
    const { target, type, attrs } = args as AnnotateOptions
    console.log('anntate args', target, type, attrs)

    if ((type as AnnotateMode) !== 'custom-block') {
      console.log(
        chalk.bold.yellow(
          t(`'--type' is not supported except for 'custom-block'`)
        )
      )
      return
    }

    const targets = await globAsync(target)
    for (const target of targets) {
      const parsed = path.parse(target)
      if (parsed.ext !== '.vue') {
        continue
      }
      const data = await fs.readFile(target, 'utf8')
      const { errors, descriptor } = parse(data)
      if (errors.length) {
        console.log(
          chalk.bold.red(
            t(`there is a parse error in {filename}`, { filename: target })
          )
        )
        errors.forEach(error => {
          console.log(`  ${chalk.red(error.message)}`)
        })
        continue
      }
      descriptor.customBlocks.forEach(block => {
        if (block.type !== 'i18n') {
          return
        }
        const blockType = getCustomBlockContenType(block.content)
      })
    }

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
