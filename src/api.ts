import path from 'path'
import { promises as fs } from 'fs'
import { debug as Debug } from 'debug'
import { isString } from '@intlify/shared'
import { generateJSON, generateYAML } from './generator/index'
import { globAsync } from './utils'

import type { DevEnv } from './generator/index'

const SUPPORTED_FORMAT = ['.json', '.json5', '.yaml', '.yml']
const debug = Debug('@intlify/cli:api')

/**
 * Compile Error Codes
 *
 * @remarks
 * The error codes of {@link compile} function
 *
 * @public
 */
export const enum CompileErrorCodes {
  /**
   * Not supported format
   */
  NOT_SUPPORTED_FORMAT = 1,
  /**
   * Internal compile warning
   */
  INTERNAL_COMPILE_WARNING,
  /**
   * Internal compile error
   */
  INTERNAL_COMPILE_ERROR
}

/**
 * Compile Options
 *
 * @remarks
 * This optioins is used at {@link compile} function
 *
 * @public
 */
export interface CompileOptions {
  /**
   * Compile Error handler
   */
  onError?: (code: number, source: string, output: string, msg?: string) => void
  /**
   * Compile handler
   */
  onCompile?: (source: string, output: string) => void
  /**
   * Compile mode
   *
   * @remarks
   * The mode of code generation. Default `production` for optimization. If `development`, code generated with meta information from i18n resources.
   */
  mode?: DevEnv
}

const COMPILE_MODE = ['production', 'development'] as const

/**
 * Compile i18n resources
 *
 * @param source - the i18n resource source path, you can use glob pattern
 * @param output - the compiled i18n resource output path
 * @param options - {@link CompileOptions}
 *
 * @remarks
 * This functoin is **asyncronous** function. If you want to get about error details, use the handler of {@link CompileOptions} and {@link CompileErrorCodes}
 *
 * @returns `true` when all i18n resource successfuly compile, not `false`
 *
 * @public
 */
export async function compile(
  source: string,
  output: string,
  options: CompileOptions = {}
): Promise<boolean> {
  let ret = true

  const targets = await globAsync(source)
  debug('compile: targets', targets)

  for (const target of targets) {
    const parsed = path.parse(target)
    debug('parsed', parsed)
    if (!parsed.ext) {
      continue
    }
    const filename = `${parsed.name}.js`
    const generatePath = path.resolve(output, filename)
    if (!SUPPORTED_FORMAT.includes(parsed.ext)) {
      options.onError &&
        options.onError(
          CompileErrorCodes.NOT_SUPPORTED_FORMAT,
          target,
          generatePath
        )
      ret = false
      continue
    }
    const source = await fs.readFile(target, { encoding: 'utf-8' })
    const generate = /\.json?5/.test(parsed.ext) ? generateJSON : generateYAML
    const env: DevEnv =
      isString(options.mode) && COMPILE_MODE.includes(options.mode)
        ? options.mode
        : 'production'
    debug('env', env)
    let occuredError = false
    const { code } = generate(source, {
      type: 'plain',
      filename: target,
      env,
      onError: (msg: string): void => {
        occuredError = true
        options.onError &&
          options.onError(
            CompileErrorCodes.INTERNAL_COMPILE_ERROR,
            target,
            generatePath,
            msg
          )
        ret = false
      },
      onWarn: (msg: string): void => {
        options.onError &&
          options.onError(
            CompileErrorCodes.INTERNAL_COMPILE_WARNING,
            target,
            generatePath,
            msg
          )
        ret = false
      }
    })
    if (!occuredError) {
      await writeGenerateCode(output, filename, code)
      options.onCompile && options.onCompile(target, generatePath)
    }
  }

  return ret
}

export async function writeGenerateCode(
  target: string,
  filename: string,
  code: string
): Promise<string> {
  await fs.mkdir(target, { recursive: true })
  const generatePath = path.resolve(target, filename)
  await fs.writeFile(generatePath, code)
  return generatePath
}
