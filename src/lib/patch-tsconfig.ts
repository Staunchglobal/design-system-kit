import fs from 'node:fs'
import { applyEdits, modify, parseTree, findNodeAtLocation, type ParseError } from 'jsonc-parser'

export type TsconfigPatchResult = 'added-alias' | 'already-present' | 'parse-failed' | 'created'

function defaultTsconfig(aliasTarget: string) {
  return {
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      incremental: true,
      paths: { '@/*': [aliasTarget] },
    },
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
  }
}

/**
 * tsconfig files are commonly JSONC (comments, trailing commas) — a real project's
 * tsconfig.app.json will happily fail `JSON.parse`. Uses jsonc-parser's tolerant parse plus its
 * edit API (modify/applyEdits) so comments and existing formatting survive the edit, and nested
 * objects that don't exist yet ("compilerOptions", "paths") get created automatically rather
 * than needing separate manual-splice cases for each.
 *
 * `aliasTarget` is `./src/*` for a `src/` layout, `./*` for a root layout (Next.js without
 * `--src-dir`) — only used when inserting a brand new "@/*" entry; an existing one is left as-is.
 */
export function patchTsconfig(filePath: string, aliasTarget: string = './src/*'): TsconfigPatchResult {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultTsconfig(aliasTarget), null, 2) + '\n')
    return 'created'
  }

  const src = fs.readFileSync(filePath, 'utf8')
  const errors: ParseError[] = []
  const tree = parseTree(src, errors, { allowTrailingComma: true, disallowComments: false })
  if (!tree) return 'parse-failed'

  const existingPaths = findNodeAtLocation(tree, ['compilerOptions', 'paths', '@/*'])
  if (existingPaths) return 'already-present'

  const edits = modify(src, ['compilerOptions', 'paths', '@/*'], [aliasTarget], {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
  })
  if (!edits.length) return 'parse-failed'

  fs.writeFileSync(filePath, applyEdits(src, edits))
  return 'added-alias'
}
