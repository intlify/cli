import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  emitCJS: false,
  outDir: 'lib',
  entries: ['src/index', 'src/cli']
})
