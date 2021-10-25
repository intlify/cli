import path from 'pathe'
import { t } from '../i18n'
import { getSourceFiles } from '../utils'
import { RequireError } from './fail'

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

export async function getSFCFiles(
  source?: string,
  files?: (string | number)[]
) {
  return await getSourceFiles({ source, files }, file => {
    const parsed = path.parse(file as string)
    return parsed.ext === '.vue'
  })
}
