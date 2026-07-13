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
 *
 * Also silently ensures `compilerOptions.resolveJsonModule` is `true` — needed because
 * `lib/theme/token-families.json` (the token-rename registry) is imported directly by shared
 * theme code. Next's default tsconfig already sets this; Vite's react-ts template (which
 * type-checks for real via `tsc -b && vite build`) does not, so without this a scaffolded Vite
 * project's build would fail on that import.
 */
export function patchTsconfig(filePath: string, aliasTarget: string = './src/*'): TsconfigPatchResult {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultTsconfig(aliasTarget), null, 2) + '\n')
    return 'created'
  }

  let src = fs.readFileSync(filePath, 'utf8')
  const errors: ParseError[] = []
  const tree = parseTree(src, errors, { allowTrailingComma: true, disallowComments: false })
  if (!tree) return 'parse-failed'

  const resolveJsonNode = findNodeAtLocation(tree, ['compilerOptions', 'resolveJsonModule'])
  if (!resolveJsonNode || resolveJsonNode.value !== true) {
    const jsonEdits = modify(src, ['compilerOptions', 'resolveJsonModule'], true, {
      formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
    })
    if (jsonEdits.length) src = applyEdits(src, jsonEdits)
  }

  const existingPaths = findNodeAtLocation(tree, ['compilerOptions', 'paths', '@/*'])
  if (existingPaths) {
    fs.writeFileSync(filePath, src)
    return 'already-present'
  }

  const aliasEdits = modify(src, ['compilerOptions', 'paths', '@/*'], [aliasTarget], {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
  })
  if (!aliasEdits.length) {
    fs.writeFileSync(filePath, src)
    return 'parse-failed'
  }

  fs.writeFileSync(filePath, applyEdits(src, aliasEdits))
  return 'added-alias'
}
