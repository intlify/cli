import path from 'path'
import { promises as fs } from 'fs'
import chalk from 'chalk'
import { Arguments, Argv } from 'yargs'
import { generateJSON, generateYAML } from '../generator/index'
import { globAsync } from '../utils'

const SUPPORTED_FORMAT = ['.json', '.json5', '.yaml', '.yml']

type CompileOptions = {
  source: string
  output?: string
}

export const command = 'compile'
export const aliases = 'cp'
export const describe = 'compile the i18n resources'

export const builder = (args: Argv): Argv<CompileOptions> => {
  return args
    .option('source', {
      type: 'string',
      alias: 's',
      describe: 'the source i18n resource path',
      demandOption: true
    })
    .option('output', {
      type: 'string',
      alias: 'o',
      describe: 'the compiled i18n resource output path'
    })
}

export const handler = async (
  args: Arguments<CompileOptions>
): Promise<void> => {
  const output =
    args.output != null ? path.resolve(__dirname, args.output) : process.cwd()
  const targets = await globAsync(args.source)
  targets.forEach(async (target: string) => {
    const parsed = path.parse(target)
    if (!SUPPORTED_FORMAT.includes(parsed.ext)) {
      console.warn(
        chalk.yellow(
          `${target}: Ignore compilation due to not supported '${parsed.ext}'`
        )
      )
      return
    }
    const source = await fs.readFile(target, { encoding: 'utf-8' })
    const generate = /\.json?5/.test(parsed.ext) ? generateJSON : generateYAML
    const filename = `${parsed.name}.js`
    const generatePath = path.resolve(output, filename)
    let occuredError = false
    const { code } = generate(source, {
      type: 'plain',
      filename: target,
      env: 'production',
      onError: (msg: string): void => {
        occuredError = true
        console.log(
          chalk.green(`error compilation: ${target} -> ${generatePath}, ${msg}`)
        )
      },
      onWarn: (msg: string): void => {
        console.log(
          chalk.yellow(
            `warning compilation: ${target} -> ${generatePath}, ${msg}`
          )
        )
      }
    })
    if (!occuredError) {
      const filename = `${parsed.name}.js`
      await writeGenerateCode(output, filename, code)
      console.log(
        chalk.green(`success compilation: ${target} -> ${generatePath}`)
      )
    }
  })
}

async function writeGenerateCode(
  target: string,
  filename: string,
  code: string
): Promise<string> {
  await fs.mkdir(target, { recursive: true })
  const generatePath = path.resolve(target, filename)
  await fs.writeFile(generatePath, code)
  return generatePath
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
