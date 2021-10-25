import createDebug from 'debug'
import { parse } from '@vue/compiler-sfc'
import {
  getSFCBlocks,
  getSFCContentInfo,
  getCustomBlockContenType,
  buildSFCBlockTag
} from '../utils'
import { SFCParseError } from './utils'

import type { SFCBlock, CompilerError } from '@vue/compiler-sfc'

const debug = createDebug('@intlify/cli:api:annotate')

/**
 * Annotate Warning Codes
 *
 * @remarks
 * The warning codes of {@link annotate} function
 *
 * @public
 */
export const enum AnnotateWarningCodes {
  /**
   * Not supported type
   */
  NOT_SUPPORTED_TYPE = 1,
  /**
   * Lang mismatch block `src` and block content
   */
  LANG_MISMATCH_IN_SRC_AND_CONTENT,
  /**
   * Lang mismatch option and block content
   */
  LANG_MISMATCH_IN_OPTION_AND_CONTENT,
  /**
   * Lang mismatch `lang` and block content
   */
  LANG_MISMATCH_IN_ATTR_AND_CONTENT
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Annotate options of {@link annotate} function
 *
 * @public
 */
export type AnnotateOptions = {
  /**
   * The type of the block
   *
   * @remarks
   * Only `i18n` type is supported, if you don't specify it. If any other type is specified, the function will raise the {@link SFCAnnotateError}.
   *
   * default as `i18n`
   */
  type?: string
  /**
   * Whether to force annotations
   *
   * @remarks
   * Force annotation of the attribute values of `attrs` option to the block tag. Even if the actual `lang` of the block content in the `lang` attribute is different, it will be enforced if this flag is turned on.
   * default as `false`
   */
  force?: boolean
  /**
   * The Attributes to be annotated on the block tag
   *
   * @remarks
   * default as `{}`
   */
  attrs?: Record<string, any>
  /**
   * The warning handler
   *
   * @remarks
   * Notify warnings generated by the annotate process
   */
  onWarn?: (code: number, args: Record<string, any>, block: SFCBlock) => void
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * The Annocation error
 *
 * @public
 */
export class SFCAnnotateError extends Error {
  /**
   * The filepath of the target file at annotate processing
   */
  filepath: string

  /**
   * Constructor
   *
   * @param message - The error message
   * @param filepath - The filepath of the target file at annotate processing
   */
  constructor(message: string, filepath: string) {
    super(message)
    this.name = 'SFCAnnotateError'
    this.filepath = filepath
  }
}

/* eslint-disable */
const NOOP_WARN = (
  code: number,
  args: Record<string, any>,
  block: SFCBlock
) => {}
/* eslint-enable */

/**
 * Annoate the Vue SFC block
 *
 * @param source - The source code of the Vue SFC
 * @param filepath - The file path of the Vue SFC
 * @param options - The {@link AnnotateOptions | options} of the annotate function
 * @returns The annotated source code of the Vue SFC
 *
 * @public
 */
export function annotate(
  source: string,
  filepath: string,
  options: AnnotateOptions = {}
): string {
  options.type = options.type || 'i18n'
  options.force = options.force || false
  options.attrs = options.attrs || {}
  options.onWarn = options.onWarn || NOOP_WARN

  const { descriptor, errors } = parse(source)
  if (errors.length) {
    debug('parse error', errors)
    const error = new SyntaxError(String('SFC parse error')) as SFCParseError
    error.erorrs = errors as CompilerError[]
    error.filepath = filepath
    throw error
  }

  // NOTE: currently support i18n only!
  if (options.type !== 'i18n') {
    throw new SFCAnnotateError('Not supported error', filepath)
  }

  const original = descriptor.source
  let offset = 0
  let diffset = 0
  let contents = [] as string[]

  contents = getSFCBlocks(descriptor).reduce((contents, block) => {
    debug(`start: type=${block.type}, offset=${offset}, diffset=${diffset}`)
    if (block.type !== options.type) {
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }

    const { content, lang } = getSFCContentInfo(block, filepath)
    const contentType = getCustomBlockContenType(content)
    debug('content info', block.lang, lang, contentType)
    if (contentType === 'unknwon') {
      options.onWarn!(
        AnnotateWarningCodes.NOT_SUPPORTED_TYPE,
        {
          type: block.type,
          actual: contentType
        },
        block
      )
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }

    if (block.src) {
      if (lang !== contentType) {
        options.onWarn!(
          AnnotateWarningCodes.LANG_MISMATCH_IN_SRC_AND_CONTENT,
          {
            src: lang,
            content: contentType
          },
          block
        )
      }
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }

    if (block.lang == null) {
      let lang = contentType as string
      if (options.attrs!.lang && options.attrs!.lang !== contentType) {
        options.onWarn!(
          AnnotateWarningCodes.LANG_MISMATCH_IN_OPTION_AND_CONTENT,
          {
            lang: options.attrs!.lang,
            content: lang
          },
          block
        )
        if (!options.force) {
          contents = contents.concat(
            original.slice(offset, block.loc.end.offset)
          )
          offset = block.loc.end.offset
          return contents
        } else {
          lang = options.attrs!.lang
        }
      }

      // annotate block tag attributes
      const startLoc = block.loc.start
      debug(
        `${block.type} block loc.start: offset=${startLoc.offset}, column=${startLoc.column}`
      )
      const blockTag = buildSFCBlockTag(block)
      const tagStartOffset = startLoc.offset - blockTag.length
      debug(`current tag: ${blockTag}`)
      debug(`tag start offset: ${tagStartOffset}`)
      const annoatedBlockTag = buildSFCBlockTag({
        type: options.type,
        attrs: { ...options.attrs!, lang }
      })
      debug(
        `annotated tag: ${annoatedBlockTag} (length:${annoatedBlockTag.length})`
      )
      const blockContent = `${annoatedBlockTag}${content}`
      debug(`content: ${blockContent}`)
      contents = contents.concat([
        original.slice(offset, tagStartOffset),
        blockContent
      ])
      diffset += annoatedBlockTag.length - blockTag.length
      offset = block.loc.end.offset

      return contents
    } else {
      if (lang !== contentType) {
        options.onWarn!(
          AnnotateWarningCodes.LANG_MISMATCH_IN_ATTR_AND_CONTENT,
          {
            lang,
            content: contentType
          },
          block
        )
      }
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }
  }, contents)
  debug(`end: offset=${offset}, diffset=${diffset}`)

  contents = contents.concat(original.slice(offset, original.length))
  return contents.join('')
}
