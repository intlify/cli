import fg from 'fast-glob'

export function globAsync(pattern: string): Promise<string[]> {
  return fg(pattern)
}
