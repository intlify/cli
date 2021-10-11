import { resolve } from 'pathe'
import { promises as fs } from 'fs'

export async function readFile(
  filepath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<{ filename: string; source: string }> {
  const filename = resolve(__dirname, filepath)
  const source = await fs.readFile(filename, { encoding })
  return { filename, source }
}
