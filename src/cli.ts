import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { initI18n, t } from './i18n'
import { compile, annotate } from './commands'
/**
 * CLI entrypoint
 */
;(async () => {
  await initI18n()
  yargs(hideBin(process.argv))
    .scriptName('intlify')
    .usage(t('Usage: $0 <command> [options]'))
    .command(compile)
    .command(annotate)
    .demandCommand()
    .help()
    .version().argv

  process.on('uncaughtException', err => {
    console.error(`uncaught exception: ${err}\n`)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, p) => {
    console.error('unhandled rejection at:', p, 'reason:', reason)
    process.exit(1)
  })
})()
