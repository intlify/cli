import { relative, resolve, parse } from 'pathe'
import { promises as fs } from 'fs'
import ignore from 'ignore'
import { t } from '../i18n'
import { exists, getSourceFiles } from '../utils'
import { RequireError } from './fail'

const DEFAULT_IGNORE_FILENAME = '.intlifyignore'

export function checkType(type?: string) {
  if (type !== 'custom-block') {
    throw new RequireError(
      t(`'--type' is not supported except for 'custom-block'`)
    )
  }
}

export function checkSource(argsLength: number, source?: string) {
  if (source == null && argsLength === 1) {
    throw new RequireError(
      t(
        `if you don't specify some files at the end of the command, the '—-source' option is required`
      )
    )
  }
}

export async function readIgnore(
  cwd: string,
  path?: string
): Promise<string | undefined> {
  if (path == null) {
    const defaultIgnorePath = resolve(cwd, DEFAULT_IGNORE_FILENAME)
    return (await exists(defaultIgnorePath))
      ? await fs.readFile(defaultIgnorePath, 'utf8')
      : undefined
  } else {
    return (await exists(path, true))
      ? await fs.readFile(path, 'utf8')
      : undefined
  }
}

export type GetSFCFilesArguments = {
  source?: string
  files?: (string | number)[]
  cwd?: string
  ignore?: string
}

export async function getSFCFiles(args: GetSFCFilesArguments = {}) {
  const { source, files, cwd, ignore: _ignore } = args
  const _files = await getSourceFiles({ source, files }, [
    file => {
      const parsed = parse(file as string)
      return parsed.ext === '.vue'
    }
  ])

  if (cwd && _ignore) {
    return ignore()
      .add(_ignore)
      .filter(_files.map(file => relative(cwd, file)))
      .map(file => resolve(cwd, file)) // to fullpath
  } else {
    return _files
  }
}
