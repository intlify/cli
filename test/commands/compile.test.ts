import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest'
import { prettier } from '../utils'
import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { compile } from '../../src/commands'
import { initI18n } from '../../src/i18n'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CWD = resolve(__dirname, '../../')

let orgCwd
beforeEach(async () => {
  await initI18n()
  orgCwd = process.cwd
  process.cwd = vi.fn().mockImplementation(() => CWD)
})

afterEach(() => {
  process.cwd = orgCwd
})

describe('compile', () => {
  it('basic', async () => {
    const cmd = yargs()
    // @ts-expect-error
    cmd.command(compile())
    await cmd.parse(
      `compile --source ./test/fixtures/commands/compile-basic.json --output ./temp`
    )
    const expected = await fs.readFile(
      resolve(__dirname, '../__generated__/compile/commands/compile-basic.js'),
      'utf8'
    )
    const compiled = await fs.readFile(
      resolve(__dirname, '../../temp/compile-basic.js'),
      'utf8'
    )
    expect(await prettier(compiled)).toBe(await prettier(expected))
  })

  it('--mode development', async () => {
    const cmd = yargs()
    // @ts-expect-error
    cmd.command(compile())
    await cmd.parse(
      `compile --source ./test/fixtures/commands/compile-mode.json --output ./temp --mode development`
    )
    const expected = await fs.readFile(
      resolve(__dirname, '../__generated__/compile/commands/compile-mode.js'),
      'utf8'
    )
    const compiled = await fs.readFile(
      resolve(__dirname, '../../temp/compile-mode.js'),
      'utf8'
    )
    expect(await prettier(compiled)).toBe(await prettier(expected))
  })

  it('ast format', async () => {
    const cmd = yargs()
    // @ts-expect-error
    cmd.command(compile())
    await cmd.parse(
      `compile --source ./test/fixtures/commands/compile-ast.json --output ./temp --format ast`
    )
    const code = await import(
      resolve(__dirname, '../../temp/compile-ast.js')
    ).then(m => m.default || m)
    expect(code).toMatchSnapshot()
  })
})
