import { assert, describe, it } from 'vitest'
import { promises as fs } from 'fs'
import { dirname, resolve, relative } from 'pathe'
import { readIgnore, getSFCFiles } from '../../src/commands/utils'
import { VUE_COMPONENT_FIXTURES } from '../contents'

const __dirname = dirname(new URL(import.meta.url).pathname)
const EXPECTABLE_FILES = VUE_COMPONENT_FIXTURES.map(
  fixture => `../fixtures/components/${fixture}`
)

describe('readIgnore', function () {
  it('default', async function () {
    const cwd = resolve(__dirname, '../fixtures')
    const acutal = await fs.readFile(resolve(cwd, '.intlifyignore'), 'utf8')
    const ignore = await readIgnore(cwd)
    assert.equal(acutal, ignore)
  })

  it('path', async function () {
    const cwd = resolve(__dirname, '../fixtures')
    const ignorePath = resolve(cwd, 'ignore/.myignore')
    const acutal = await fs.readFile(ignorePath, 'utf8')
    const ignore = await readIgnore(cwd, ignorePath)
    assert.equal(acutal, ignore)
  })

  it('not found', async function () {
    const cwd = resolve(__dirname, '../fixtures')
    const ignorePath = resolve(cwd, 'ignore/myignore')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let err: any = null
    try {
      await readIgnore(cwd, ignorePath)
    } catch (e) {
      err = e
    }
    assert.isNotNull(err)
    assert.equal(err.code, 'ENOENT')
  })
})

describe('getSFCFiles', function () {
  it('source', async function () {
    const source = resolve(__dirname, '../fixtures/**/*.vue')
    const files = await getSFCFiles({ source })
    assert.deepEqual(
      files.map(file => relative(__dirname, file)),
      EXPECTABLE_FILES
    )
  })

  it('files', async function () {
    const files = ['annotate', ...EXPECTABLE_FILES]
    const actual = await getSFCFiles({ files })
    assert.deepEqual(actual, files.splice(1))
  })
})
