import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest'
import { prettier } from '../utils'
import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import yargs from 'yargs'
import { compile } from '../../src/commands'
import { initI18n } from '../../src/i18n'

const __dirname = dirname(new URL(import.meta.url).pathname)
const CWD = resolve(__dirname, '../../')

let orgCwd
beforeEach(async function () {
  await initI18n()
  orgCwd = process.cwd
  process.cwd = vi.fn().mockImplementation(() => CWD)
})

afterEach(function () {
  process.cwd = orgCwd
})

describe('compile', function () {
  it('basic', async function () {
    // @ts-expect-error
    const cmd = yargs(compile())
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

  it('--mode development', async function () {
    // @ts-expect-error
    const cmd = yargs(compile())
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
})
