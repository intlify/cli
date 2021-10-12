import path from 'pathe'
import createDebug from 'debug'
import { t } from '../i18n'

import type { Arguments, Argv } from 'yargs'

const debug = createDebug('@intlify/cli:annotate')
const dirname = path.dirname(new URL(import.meta.url).pathname)

type AnnocateMode = 'custom-block'

type AnnotateOptions = {
  target: string
  mode: string
  attrs: Record<string, any>
}

export default function deineCommand() {
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
      .option('mode', {
        type: 'string',
        alias: 'm',
        default: 'custom-block',
        describe: t('the annotation mode')
      })
      .option('attrs', {
        alias: 'a',
        default: {},
        describe: t('the attributes to annotate')
      })
  }

  const handler = async (args: Arguments<AnnotateOptions>): Promise<void> => {
    const ret = false
    const { target, mode, attrs } = args
    console.log('anntate args', target, mode, attrs)
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
