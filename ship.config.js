import execa from 'execa'
import { promises as fs, writeFile } from 'fs'
import path from 'pathe'

const dirname = path.dirname(new URL(import.meta.url).pathname)

async function readJson(path) {
  const data = await fs.readFile(path, 'utf8')
  return JSON.parse(data)
}

function extractSpecificChangelog(changelog, version) {
  if (!changelog) {
    return null
  }
  const escapedVersion = version.replace(/\./g, '\\.')
  const regex = new RegExp(
    `(#+?\\s\\[?v?${escapedVersion}\\]?[\\s\\S]*?)(#+?\\s\\[?v?\\d\\.\\d\\.\\d\\]?)`,
    'g'
  )
  const matches = regex.exec(changelog)
  return matches ? matches[1] : null
}

async function commitChangelog(current, next) {
  const { stdout } = await execa('npx', [
    'lerna-changelog',
    '--next-version',
    `v${next}`
  ])
  const escapedVersion = next.replace(/\./g, '\\.')
  const regex = new RegExp(
    `(#+?\\s\\[?v?${escapedVersion}\\]?[\\s\\S]*?)(#+?\\s\\[?v?\\d\\.\\d\\.\\d\\]?)`,
    'g'
  )
  const matches = regex.exec(stdout.toString())
  const head = matches ? matches[1] : stdout
  const changelog = await fs.readFile('./CHANGELOG.md', 'utf8')
  return writeFile('./CHANGELOG.md', `${head}\n\n${changelog}`)
}

module.exports = {
  mergeStrategy: { toSameBranch: ['master'] },
  monorepo: undefined,
  updateChangelog: false,
  beforeCommitChanges: ({ nextVersion, exec, dir }) => {
    return new Promise(async resolve => {
      const pkg = await readJson(path.relative(dirname, './package.json'))
      commitChangelog(pkg.version, nextVersion).then(resolve)
    })
  },
  formatCommitMessage: ({ version, releaseType, mergeStrategy, baseBranch }) =>
    `${releaseType} release v${version}`,
  formatPullRequestTitle: ({ version, releaseType }) =>
    `${releaseType} release v${version}`,
  shouldRelease: () => true,
  releases: {
    extractChangelog: async ({ version, dir }) => {
      const changelogPath = path.resolve(dir, 'CHANGELOG.md')
      try {
        const changelogFile = await fs.readFile(changelogPath, 'utf8')
        const ret = extractSpecificChangelog(changelogFile, version)
        return ret
      } catch (err) {
        if (err.code === 'ENOENT') {
          return null
        }
        throw err
      }
    }
  }
}
