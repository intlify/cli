import { glob } from 'glob'

export function globAsync(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, (err: Error | null, matches: string[]) => {
      if (err) {
        return reject(err)
      }
      resolve(matches)
    })
  })
}
