/* eslint-disable @typescript-eslint/no-unused-vars */
import { beforeEach, afterEach, describe, it, vi } from 'vitest'
import { dirname, resolve } from 'pathe'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { annotate } from '../../src/commands'
import { initI18n } from '../../src/i18n'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CWD = resolve(__dirname, '../../')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let orgCwd: any
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
