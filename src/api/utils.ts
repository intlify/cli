import type { CompilerError } from '@vue/compiler-sfc'

/**
 * Vue SFC compiler error
 *
 * @remarks
 * This is the error wrapping the error that occurred in Vue SFC compiler
 *
 * @public
 */
export interface SFCParseError extends SyntaxError {
  /**
   * The error that occurred in Vue SFC compiler
   */
  erorrs: CompilerError[]
  /**
   * The filepath of the source file
   */
  filepath: string
}

/**
 * Check wheather Vue SFC compiler error
 *
 * @param err - The error that occurred in Vue SFC compiler
 * @returns if the error is raised in Vue SFC compiler, return `true`, else `false`
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSFCParserError(err: any): err is SFCParseError {
  return 'errors' in err && 'filepath' in err
}
