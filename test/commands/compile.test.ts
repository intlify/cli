import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import yargs from 'yargs'
import { assert } from 'chai'
import sinon from 'sinon'
import { compile } from '../../src/commands'
import { initI18n } from '../../src/i18n'

const __dirname = dirname(new URL(import.meta.url).pathname)
const CWD = resolve(__dirname, '../../')

let orgCwd
let sandbox
beforeEach(async () => {
  await initI18n()
  sandbox = sinon.createSandbox()
  orgCwd = process.cwd
  process.cwd = sinon.stub().returns(CWD)
})

afterEach(() => {
  sandbox.restore()
  process.cwd = orgCwd
})

describe('compile', () => {
  it('basic', async function () {
    sandbox.stub(console, 'log')
    const cmd = yargs.command(compile())
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
    assert.equal(compiled, expected)
  })

  it('--mode development', async function () {
    sandbox.stub(console, 'log')
    const cmd = yargs.command(compile())
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
    assert.equal(compiled, expected)
  })
})
