import createDebug from 'debug'
import fg from 'fast-glob'
import diff from 'diff-match-patch'
import { parseJSON } from 'jsonc-eslint-parser'
import { parseYAML } from 'yaml-eslint-parser'
import { readFileSync } from 'fs'
import { cosmiconfig } from 'cosmiconfig'
import { promises as fs } from 'fs'
import path from 'pathe'

import type { SFCBlock, SFCDescriptor } from '@vue/compiler-sfc'

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
