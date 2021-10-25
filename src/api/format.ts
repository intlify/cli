import createDebug from 'debug'
import { format as pritterFormat } from 'prettier'
import { parse } from '@vue/compiler-sfc'
import { getSFCBlocks, getSFCContentInfo } from '../utils'
import { SFCParseError } from './utils'

import type { CompilerError } from '@vue/compiler-sfc'
import { Options } from 'prettier'

const debug = createDebug('@intlify/cli:api:format')

/**
 * Format options of {@link format} function
 *
 * @public
 */
export type FormatOptions = {
  /**
   * The prettier options
   *
   * @remarks
   * The options for formatting the content of `i18n` custom blocks with prettier
   * default as {@link DEFAULT_PRETTIER_OPTIONS}
   */
  prettier?: Options
}

/**
 * Fortmat lang fwnot found error
 *
 * @reamrks
 * The error that not specified `lang` attribute in `i18n` custom block
 *
 * @public
 */
export class FormatLangNotFoundError extends Error {
  /**
   * The filepath of the target file at formatting processing
   */
  filepath: string

  /**
   * Constructor
   *
   * @param message - The error message
   * @param filepath - The filepath of the target file at formatting processing
   */
  constructor(message: string, filepath: string) {
    super(message)
    this.name = 'FormatLangNotFoundError'
    this.filepath = filepath
  }
}

/**
 * The default prettier options for formatting the content of `i18n` custom blocks
 *
 * @public
 */
export const DEFAULT_PRETTIER_OPTIONS = {
  printWidth: 100,
  tabWidth: 2,
  jsonRecursiveSort: true,
  plugins: ['prettier-plugin-sort-json']
}

/**
 * Format the Vue SFC block
 *
 * @remarks
 * Currently, only i18n custom blocks supporting
 *
 * @param source - The source code of the Vue SFC
 * @param filepath - The file path of the Vue SFC
 * @param options - The {@link FormatOptions | options} of the format function
 * @returns The formatted source code of the Vue SFC
 *
 * @public
 */
export function format(
  source: string,
  filepath: string,
  options: FormatOptions = {
    prettier: {}
  }
): string {
  const prettierOptions = Object.assign(
    {},
    DEFAULT_PRETTIER_OPTIONS,
    options.prettier
  )

  const { descriptor, errors } = parse(source)
  if (errors.length) {
    debug('parse error', errors)
    const error = new SyntaxError(String('SFC parse error')) as SFCParseError
    error.erorrs = errors as CompilerError[]
    error.filepath = filepath
    throw error
  }

  const original = descriptor.source
  let offset = 0
  let contents = [] as string[]

  contents = getSFCBlocks(descriptor).reduce((contents, block) => {
    debug(`start: type=${block.type}, offset=${offset}`)
    if (block.type !== 'i18n') {
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }

    const { content, lang } = getSFCContentInfo(block, filepath)
    if (lang == null) {
      throw new FormatLangNotFoundError('`lang` attr not found', filepath)
    }

    const startLoc = block.loc.start
    debug(
      `${block.type} block loc.start: offset=${startLoc.offset}, column=${startLoc.column}`
    )
    const formatted = pritterFormat(
      content,
      Object.assign({}, prettierOptions, { parser: lang })
    )
    const blockContent = `\n${formatted}`
    debug(`content: ${blockContent}`)
    contents = contents.concat([
      original.slice(offset, startLoc.offset),
      blockContent
    ])
    offset = block.loc.end.offset

    return contents
  }, contents)

  contents = contents.concat(original.slice(offset, original.length))
  return contents.join('')
}
