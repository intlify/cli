import createDebug from 'debug'
import fg from 'fast-glob'
import { parseJSON } from 'jsonc-eslint-parser'
import { parseYAML } from 'yaml-eslint-parser'
import { readFileSync } from 'fs'
import path from 'pathe'
import { parse } from '@vue/compiler-sfc'

import type { SFCBlock, SFCDescriptor, CompilerError } from '@vue/compiler-sfc'

const debug = createDebug('@intlify/cli:utils')

export type CustomBlockContentType = 'json' | 'json5' | 'yaml' | 'unknwon'
export type SFCBloackType =
  | 'template'
  | 'script'
  | 'scriptSetup'
  | 'style'
  | 'custom'
export type SFCAnnotateOptions = {
  type?: string
  force?: boolean
  attrs?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  onWarn?: (msg: string, block: SFCBlock) => void
}

export function globAsync(pattern: string): Promise<string[]> {
  return fg(pattern)
}

export function getSFCBlocks(descriptor: SFCDescriptor): SFCBlock[] {
  const { template, script, scriptSetup, styles, customBlocks } = descriptor
  const blocks: SFCBlock[] = [...styles, ...customBlocks]
  template && blocks.push(template as SFCBlock)
  script && blocks.push(script as SFCBlock)
  scriptSetup && blocks.push(scriptSetup as SFCBlock)
  blocks.sort((a, b) => a.loc.start.offset - b.loc.start.offset)
  return blocks
}

export function getSFCContentInfo(
  block: SFCBlock,
  filepath: string
): { content: string; lang: string | undefined; contentPath: string } {
  if (block.src) {
    const parsed = path.parse(filepath)
    const target = path.resolve(parsed.dir, block.src)
    const parsedTarget = path.parse(target)
    return {
      content: readFileSync(target, 'utf8'),
      lang: parsedTarget.ext.split('.').pop(),
      contentPath: target
    }
  } else {
    return { content: block.content, lang: block.lang, contentPath: filepath }
  }
}

const ESC: { [key in string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
}

function escapeChar(a: string): string {
  return ESC[a] || a
}

function escape(s: string): string {
  return s.replace(/[<>"&]/g, escapeChar)
}

function buildSFCBlockTag(meta: {
  type: string
  attrs: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}): string {
  let tag = `<${meta.type}`
  for (const [key, value] of Object.entries(meta.attrs)) {
    if (value === true) {
      tag += ` ${key}`
    } else {
      tag += ` ${key}="${escape(meta.attrs[key])}"`
    }
  }
  tag += '>'
  return tag
}

export interface SFCParseError extends SyntaxError {
  erorrs: CompilerError[]
}

export class SFCAnnotateError extends Error {}

const NOOP_WARN = (msg: string, block: SFCBlock) => {} // eslint-disable-line

export function annotateSFCAttrs(
  source: string,
  filepath: string,
  options: SFCAnnotateOptions = {}
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
    throw error
  }

  // NOTE: currently support i18n only!
  if (options.type !== 'i18n') {
    throw new SFCAnnotateError('')
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

    const { content, lang, contentPath } = getSFCContentInfo(block, filepath)
    const contentType = getCustomBlockContenType(content)
    debug('content info', block.lang, lang, contentType)
    if (contentType === 'unknwon') {
      options.onWarn!(
        `Unsupported ${block.type} block content type: ${contentType}`,
        block
      )
      contents = contents.concat(original.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
      return contents
    }

    if (block.src) {
      if (lang !== contentType) {
        options.onWarn!(
          `${block.type} block src="${lang}" is not equal to content type "${contentType}"`,
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
          `loaded ${
            block.type
          } block content "${contentType}" is not equal to options lang type "${
            options.attrs!.lang
          }"`,
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
          `${block.type} block "${lang}" is not equal to content type "${contentType}"`,
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

export function getCustomBlockContenType(
  content: string
): CustomBlockContentType {
  const [isLoad, type] = loadJson(content)
  if (isLoad) {
    return type
  } else if (isLoadYaml(content)) {
    return 'yaml'
  } else {
    return 'unknwon'
  }
}

function isLoadYaml(content: string): boolean {
  try {
    const yamlData = parseYAML(content)
    return true
  } catch (e: unknown) {
    debug('yaml load error', (e as Error).message)
    return false
  }
}

function isLoadJson(content: string): boolean {
  try {
    const json = JSON.parse(content)
    return true
  } catch (e: unknown) {
    debug('json load error', (e as Error).message)
    return false
  }
}

function isLoadJson5(content: string): boolean {
  try {
    const json5 = parseJSON(content, { jsonSyntax: 'json5' })
    return true
  } catch (e: unknown) {
    debug('json5 load error', (e as Error).message)
    return false
  }
}

function loadJson(content: string): [boolean, 'json' | 'json5' | 'unknwon'] {
  try {
    if (isLoadJson(content)) {
      return [true, 'json']
    } else if (isLoadJson5(content)) {
      return [true, 'json5']
    } else {
      return [false, 'unknwon']
    }
  } catch (e: unknown) {
    debug('json load error', (e as Error).message)
    return [false, 'unknwon']
  }
}
