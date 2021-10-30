/* eslint-disable @typescript-eslint/no-unused-vars */
import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import yargs from 'yargs'
import { assert } from 'chai'
import sinon from 'sinon'
import { annotate } from '../../src/commands'
import { initI18n } from '../../src/i18n'

const __dirname = dirname(new URL(import.meta.url).pathname)
const CWD = resolve(__dirname, '../../')

let orgCwd
let sandbox
beforeEach(async function () {
  await initI18n()
  sandbox = sinon.createSandbox()
  orgCwd = process.cwd
  process.cwd = sinon.stub().returns(CWD)
})

afterEach(function () {
  sandbox.restore()
  process.cwd = orgCwd
})

describe('annoate', function () {
  it.skip('basic', async function () {
    // TODO:
  })

  it.skip('--mode development', async function () {
    // TODO:
  })
})

/* eslint-enable @typescript-eslint/no-unused-vars */
