import { promises as fs } from 'fs'
import path from 'pathe'

type FileCache = {
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const fileCache: FileCache = {}

async function exists(filepath: string) {
  try {
    return !!(await fs.lstat(filepath))
  } catch (e) {
    return false
  }
}

async function readFile(filepath: string) {
  return await fs.readFile(filepath, 'utf8')
}

async function readSnap(file: string, name: string) {
  if (fileCache[file] == null) {
    fileCache[file] = (await exists(file)) ? await readFile(file) : false
  }
  if (!fileCache[file] || !(name in fileCache[file])) {
    throw `Snapshot does not exists`
  }
  return fileCache[file][name]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function writeSnap(file: string, name: string, data: any) {
  let snap
  if (!(await exists(path.dirname(file)))) {
    await fs.mkdir(path.dirname(file))
  }

  const snapShotCountsBefore = fileCache[file]
    ? Object.keys(fileCache[file]).length
    : 0

  if (snapShotCountsBefore === 0) {
    fileCache[file] = { [name]: data }
  } else {
    fileCache[file][name] = data
  }

  const snapShotCountsAfter = Object.keys(fileCache[file]).length
  if (
    snapShotCountsBefore === 0 ||
    snapShotCountsBefore !== snapShotCountsAfter
  ) {
    snap = `exports[\`${name}\`] = \`${data}\`;\n\n`
    fs.appendFile(file, snap, { encoding: 'utf8' })
    return true
  }

  snap = ''
  for (const snapshot in fileCache[file]) {
    snap = `${snap}exports[\`${snapshot}\`] = \`${fileCache[file][snapshot]}\`;\n\n`
  }

  await fs.writeFile(file, snap, { encoding: 'utf8' })

  return true
}

export function chatSnaptshotPlugin(
  chai: Chai.ChaiStatic,
  utils: Chai.ChaiUtils
): void {
  utils.addProperty(chai.Assertion.prototype, 'force', function () {
    utils.flag(this, 'updateSnapshot', true)
  })

  const UPDATE_SNAPSHOT = process.env.UPDATE_SNAPSHOT

  async function matchSnapshot(passedContext) {
    const actual = utils.flag(this, 'object')
    const isForced = UPDATE_SNAPSHOT || utils.flag(this, 'updateSnapshot')
    const context = passedContext.test ? passedContext.test : passedContext
    const dir = path.dirname(context.file)
    const filename = path.basename(context.file)
    const snapshotFile = path.join(dir, '__snapshots__', filename + '.snap')

    const prepareTitle = chain => {
      if (
        chain.parent &&
        chain.parent.file &&
        path.basename(chain.parent.file) === filename
      ) {
        return `${prepareTitle(chain.parent)} : ${chain.title}`
      }
      return chain.title
    }

    if (!context.matchSequence) {
      context.matchSequence = 1
    }

    const name = `${prepareTitle(context)} ${context.matchSequence++}`
    let expected
    try {
      expected = await readSnap(snapshotFile, name)
    } catch (e) {
      if (!isForced) {
        throw e
      }
    }
    if (isForced) {
      await writeSnap(snapshotFile, name, actual)
      expected = actual
    }

    if (actual !== null && typeof actual === 'object') {
      chai.assert.deepEqual(actual, expected)
    } else {
      chai.assert.equal(actual, expected)
    }
  }

  utils.addMethod(chai.Assertion.prototype, 'matchSnapshot', matchSnapshot)
}
