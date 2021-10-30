import { bold, red, yellow } from 'colorette'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = { new (...args: any[]): T }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typeGuard<T>(o: any, className: Constructor<T>): o is T {
  return o instanceof className
}

export class RequireError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineFail(userError: any) {
  return (msg: string, err: Error) => {
    if (msg) {
      // TODO: should refactor console message
      console.error(msg)
      console.warn(red(bold(msg)))
      process.exit(1)
    } else {
      if (typeGuard(err, userError)) {
        console.warn(yellow(bold(err.message)))
        process.exit(0)
      } else {
        // preserve statck! see the https://github.com/yargs/yargs/blob/master/docs/api.md#failfn
        throw err
      }
    }
  }
}
