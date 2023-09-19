/* eslint-disable @typescript-eslint/no-unused-vars */
import { beforeEach, afterEach, describe, it, vi } from 'vitest'
import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import yargs from 'yargs'
import { annotate } from '../../src/commands'
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

describe('annoate', function () {
  it.skip('basic', async function () {
    // TODO:
  })

  it.skip('--mode development', async function () {
    // TODO:
  })
})

/* eslint-enable @typescript-eslint/no-unused-vars */
