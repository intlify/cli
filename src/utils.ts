import createDebug from 'debug'
import fg from 'fast-glob'
import diff from 'diff-match-patch'
import { parseJSON } from 'jsonc-eslint-parser'
import { parseYAML } from 'yaml-eslint-parser'
import { readFileSync } from 'fs'
import { cosmiconfig } from 'cosmiconfig'
import { promises as fs } from 'fs'
import path from 'pathe'
import { parse } from '@vue/compiler-sfc'
import { isString } from '@intlify/shared'

import type { SFCBlock, SFCDescriptor } from '@vue/compiler-sfc'

declare module '@vue/compiler-sfc' {
  // normalize for `vue-template-compiler`
  interface SFCBlock {
    start?: number
    end?: number
  }
}

const __dirname = path.dirname(new URL(import.meta.url).pathname)
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
export type parseSFC = (source: string) => ReturnType<typeof parse>

export async function exists(path: string, isThrow = false): Promise<boolean> {
  let ret = false
  try {
    const stat = await fs.stat(path)
    ret = stat.isFile()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      if (isThrow) {
        throw e
      }
    } else {
      throw e
    }
  }
  return ret
}

type FilterCallback = (file: string | number) => boolean

export async function getSourceFiles(
  input: {
    source?: string
    files?: (string | number)[]
  },
  filter?: FilterCallback | FilterCallback[]
): Promise<string[]> {
  const { source, files } = input
  const _files =
    source != null
      ? await globAsync(source)
      : [...(files || [])].map(a => a.toString()).splice(1)
  if (filter) {
    const _filters = Array.isArray(filter) ? filter : [filter]
    return _filters.reduce((files, filter) => files.filter(filter), _files)
  } else {
    return _files
  }
}

export function globAsync(pattern: string): Promise<string[]> {
  return fg(pattern)
}

export function getSFCBlocks(
  descriptor: SFCDescriptor,
  version = 3
): SFCBlock[] {
  const { template, script, scriptSetup, styles, customBlocks } = descriptor
  const blocks: SFCBlock[] = [...styles, ...customBlocks]
  template && blocks.push(template as SFCBlock)
  script && blocks.push(script as SFCBlock)
  scriptSetup && blocks.push(scriptSetup as SFCBlock)
  blocks.sort((a, b) => {
    if (version === 3) {
      return a.loc.start.offset - b.loc.start.offset
    } else if (version === 2 && a.start != null && b.start != null) {
      return a.start - b.start
    } else {
      return 0
    }
  })
  return blocks
}

export function getSFCContentInfo(
  block: SFCBlock,
  filepath: string
): { content: string; lang: string | undefined; contentPath: string } {
  if (block.lang) {
    return { content: block.content, lang: block.lang, contentPath: filepath }
  } else if (block.attrs.lang && isString(block.attrs.lang)) {
    return {
      content: block.content,
      lang: block.attrs.lang,
      contentPath: filepath
    }
  } else if (block.src || (block.attrs.src && isString(block.attrs.src))) {
    // prettier-ignore
    const src = block.src
      ? block.src
      : block.attrs.src && isString(block.attrs.src)
        ? block.attrs.src
        : ''
    if (!src) {
      throw new Error(`src is empty`)
    }
    const parsed = path.parse(filepath)
    const target = path.resolve(parsed.dir, src)
    const parsedTarget = path.parse(target)
    return {
      content: readFileSync(target, 'utf8'),
      lang: parsedTarget.ext.split('.').pop(),
      contentPath: target
    }
  } else {
    return { content: block.content, lang: undefined, contentPath: filepath }
  }
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
    parseYAML(content)
    return true
  } catch (e: unknown) {
    debug('yaml load error', (e as Error).message)
    return false
  }
}

function isLoadJson(content: string): boolean {
  try {
    JSON.parse(content)
    return true
  } catch (e: unknown) {
    debug('json load error', (e as Error).message)
    return false
  }
}

function isLoadJson5(content: string): boolean {
  try {
    parseJSON(content, { jsonSyntax: 'json5' })
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

const ESC: { [key in string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
}

function escapeChar(a: string): string {
  return ESC[a] || a
}

export function escape(s: string): string {
  return s.replace(/[<>"&]/g, escapeChar)
}

const df = new diff.diff_match_patch()

export function hasDiff(newContent: string, oldContent: string): boolean {
  const diffs = df.diff_main(oldContent, newContent, true)
  if (diffs.length === 0) {
    return false
  }
  return !!diffs.find(
    d => d[0] === diff.DIFF_DELETE || d[0] === diff.DIFF_INSERT
  )
}

export function updateContents(
  original: string,
  contents: string[],
  offset: number,
  block: SFCBlock,
  vue: number
): [string[], number] {
  // prettier-ignore
  const end = vue === 3
    ? block.loc.end.offset
    : (vue === 2 && block.end != null)
      ? block.end
      : -1
  if (end === -1) {
    throw new Error('Not supported error')
  }
  const _contents = contents.concat(original.slice(offset, end))
  const _offset = end
  return [_contents, _offset]
}

export function getPosition(
  block: SFCBlock,
  vue: number,
  type: 'start' | 'end'
): [number, number] {
  if (vue === 3) {
    return [block.loc[type].offset, block.loc[type].column]
  } else if (vue === 2 && block[type] != null) {
    // @ts-ignore
    return [block[type], -1]
  } else {
    return [-1, -1]
  }
}

export function buildSFCBlockTag(meta: {
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

export async function getPrettierConfig(filepath: string) {
  const explorer = cosmiconfig('prettier')
  return await explorer.load(filepath)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _rDefault = (r: any) => r.default || r

export async function getSFCParser(version: number): Promise<parseSFC | null> {
  let parser: parseSFC | null = null
  try {
    if (version === 3) {
      parser = (
        await import(
          path.resolve(__dirname, '../node_modules', '@vue/compiler-sfc')
        ).then(_rDefault)
      ).parse as parseSFC
    } else if (version === 2) {
      const { parseComponent } = await import(
        path.resolve(__dirname, '../node_modules', 'vue-template-compiler')
      ).then(_rDefault)
      parser = (source: string) => {
        const errors: SyntaxError[] = []
        const descriptor = parseComponent(source)
        return { descriptor, errors }
      }
    }
  } catch (e) {
    debug('getSFCParser error', e)
  }
  return parser
}
