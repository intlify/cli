import { resolve } from 'pathe'
import { promises as fs } from 'fs'
import { format } from 'prettier'

export async function readFile(
  filepath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<{ filename: string; source: string }> {
  const filename = resolve(__dirname, filepath)
  const source = await fs.readFile(filename, { encoding })
  return { filename, source }
}

export async function prettier(code: string): Promise<string> {
  return await format(code, { parser: 'acorn' })
}
