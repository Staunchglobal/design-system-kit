#!/usr/bin/env node
/**
 * Splits the hand-authored category demo files (_sections/buttons.tsx, forms.tsx, …) into one
 * file per component (_sections/button.tsx, _sections/dialog.tsx, …) so picking a single
 * component installs only its own demo, not its whole category's.
 *
 * Two source shapes exist in the category files:
 *  - "inline": the default-exported section function's JSX directly contains multiple sibling
 *    `<ComponentSection id="...">...</ComponentSection>` blocks (buttons.tsx, forms.tsx, …).
 *  - "named-function": the default export just renders `<XSection />` for several locally
 *    defined `function XSection() { … return <ComponentSection id="…">…</ComponentSection> … }`
 *    (overlays.tsx). Each named function is already a clean per-component unit.
 *
 * Import/helper references are resolved by substring match against each extracted block's
 * text — over-inclusive in rare edge cases (safe: an unused import is a lint nit, never a
 * broken build) rather than under-inclusive (would break the build).
 *
 * Run with `npm run split:sections` after editing a category file's component list; re-run
 * `npm run build:registry` afterward too, since it reads _sections/*.tsx file names.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  { dir: 'template-next', sectionsRel: 'src/app/design-system/_sections' },
  { dir: 'template-vite', sectionsRel: 'src/design-system/_sections' },
]

// Category files that map 1:1 to a single always-included/pseudo group — left untouched.
const NO_SPLIT = new Set(['colors.tsx', 'typography.tsx', 'patterns.tsx'])

/**
 * Word-boundary identifier check — plain `.includes()` false-positives constantly (e.g. "Select"
 * inside "Selected", "Input" inside "ComboboxInput"), which would leak unused imports/helpers
 * into split files and break a strict `noUnusedLocals` build.
 *
 * Word-boundary alone still false-positives on plain English inside string/JSX text — a label
 * reading "Select all" mentions no such component, but \bSelect\b matches it. Blank out string
 * literals and JSX text runs (content between `>` and `<`) before matching, since a real
 * identifier reference (tag name, `{expression}`, import specifier) never appears there.
 */
const noiseCache = new Map()
function stripNoise(text) {
  let cached = noiseCache.get(text)
  if (cached === undefined) {
    cached = text
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/>([^<>{]*)</g, (_m, inner) => '>' + inner.replace(/[A-Za-z_$][A-Za-z0-9_$]*/g, '_') + '<')
      // Plain-word JSX text directly followed by an expression, e.g. `>Message {index + 1}<` —
      // blank just the leading word run, leave the {expression} itself untouched (still scanned).
      .replace(/>([\sA-Za-z0-9_]*)\{/g, (_m, textBefore) => '>' + textBefore.replace(/[A-Za-z_$][A-Za-z0-9_$]*/g, '_') + '{')
    noiseCache.set(text, cached)
  }
  return cached
}
function usesIdentifier(text, name) {
  return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(stripNoise(text))
}

function toPascalCase(slug) {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')
}

/** Splits a source file into { imports: string[], preamble: string, body: string, hasUseClient } */
function splitHeader(source) {
  const lines = source.split('\n')
  let i = 0
  let hasUseClient = false
  if (lines[0]?.trim() === "'use client'") {
    hasUseClient = true
    i = 1
    while (lines[i]?.trim() === '') i++
  }

  const imports = []
  while (i < lines.length) {
    const line = lines[i]
    if (!line.startsWith('import ')) break
    let stmt = line
    let j = i
    while (!/from\s+'[^']+'\s*$/.test(stmt) && j < lines.length - 1) {
      j++
      stmt += '\n' + lines[j]
    }
    imports.push(stmt)
    i = j + 1
    while (lines[i]?.trim() === '') i++
  }

  const rest = lines.slice(i).join('\n')
  const exportMatch = rest.match(/^export default function \w+\s*\(/m)
  const preamble = exportMatch ? rest.slice(0, exportMatch.index) : ''
  const body = exportMatch ? rest.slice(exportMatch.index) : rest
  return { imports, preamble, hasUseClient, body }
}

/** Every top-level `function name(` / `const name = (` declared in the preamble. */
function extractHelperNames(preamble) {
  const names = []
  for (const m of preamble.matchAll(/^(?:function|const)\s+([A-Za-z0-9_]+)/gm)) names.push(m[1])
  return names
}

/**
 * Filters an import statement down to only the specifiers a given block's text actually uses —
 * NOT whole-statement include/exclude. A leftover unused named import (e.g. `ExampleGrid` next
 * to a used `Example`) is a hard `tsc` error under a strict `noUnusedLocals` tsconfig (Vite's
 * default), not just a lint nit, so this has to be precise for named-import groups. Default/
 * namespace imports and any shape this doesn't recognize are kept whole rather than dropped —
 * a stray default import is at worst a lint nit; a *missing* one breaks the build outright.
 */
function filterImportStatement(stmt, blockText) {
  const ns = stmt.match(/^import \* as (\w+) from (.+)$/s)
  if (ns) return blockText.includes(ns[1]) ? stmt : null

  const combined = stmt.match(/^import\s+(\w+)\s*,\s*\{([\s\S]*?)\}\s*from\s*(.+)$/)
  const namedOnly = stmt.match(/^import\s+(type\s+)?\{([\s\S]*?)\}\s*from\s*(.+)$/)
  const defaultOnly = stmt.match(/^import\s+(\w+)\s+from\s*(.+)$/)

  const filterNamed = (block) =>
    block
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((n) => usesIdentifier(blockText, n.replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim()))

  if (combined) {
    const [, defaultName, namedBlock, from] = combined
    const kept = filterNamed(namedBlock)
    const usesDefault = usesIdentifier(blockText, defaultName)
    if (!usesDefault && !kept.length) return null
    if (usesDefault && kept.length) return `import ${defaultName}, { ${kept.join(', ')} } from ${from}`
    if (usesDefault) return `import ${defaultName} from ${from}`
    return `import { ${kept.join(', ')} } from ${from}`
  }

  if (namedOnly) {
    const [, typePrefix = '', namedBlock, from] = namedOnly
    const kept = filterNamed(namedBlock)
    return kept.length ? `import ${typePrefix}{ ${kept.join(', ')} } from ${from}` : null
  }

  if (defaultOnly) {
    const [, name] = defaultOnly
    return usesIdentifier(blockText, name) ? stmt : null
  }

  return stmt
}

function neededImports(blockText, imports) {
  return imports.map((stmt) => filterImportStatement(stmt, blockText)).filter((x) => x !== null)
}

function neededHelpers(blockText, helperNames) {
  return helperNames.filter((name) => usesIdentifier(blockText, name))
}

/** Non-nested `<ComponentSection id="…" …>…</ComponentSection>` siblings inside `body`. */
function extractInlineBlocks(body) {
  const blocks = []
  const re = /<ComponentSection\s+id="([a-z0-9-]+)"[\s\S]*?<\/ComponentSection>/g
  let m
  while ((m = re.exec(body))) blocks.push({ id: m[1], text: m[0] })
  return blocks
}

function bracketDepthOf(line) {
  let depth = 0
  for (const ch of line) {
    if (ch === '(' || ch === '{' || ch === '[') depth++
    else if (ch === ')' || ch === '}' || ch === ']') depth--
  }
  return depth
}

/**
 * `const [selectedDate, setSelectedDate] = React.useState(…)`-style local declarations that sit
 * in the default-exported function's body BEFORE its first ComponentSection block (e.g.
 * media-charts.tsx declares 4 useState hooks once, then several sibling sections each use one) —
 * these never showed up in the preamble scan since they're inside the function, not beside it.
 * Since they're hook calls, they can't be hoisted to a shared module-level file like other
 * helpers — each demo file that needs one gets its own private copy, injected into its own
 * function body, not shared as an import.
 */
function extractBodyLocals(preBlockText) {
  const lines = preBlockText.split('\n')
  const stmts = []
  let i = 0
  while (i < lines.length) {
    if (!/^\s*(const|let)\s+/.test(lines[i])) {
      i++
      continue
    }
    let stmt = lines[i]
    let depth = bracketDepthOf(lines[i])
    let j = i
    while (depth > 0 && j < lines.length - 1) {
      j++
      stmt += '\n' + lines[j]
      depth += bracketDepthOf(lines[j])
    }
    const declMatch = stmt.match(/^\s*(?:const|let)\s+(\[[^\]]+\]|\{[^}]+\}|\w+)/)
    const names = declMatch
      ? declMatch[1].startsWith('[') || declMatch[1].startsWith('{')
        ? declMatch[1]
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().split(':')[0].trim())
            .filter(Boolean)
        : [declMatch[1]]
      : []
    if (names.length) stmts.push({ names, text: stmt })
    i = j + 1
  }
  return stmts
}

/** `function XSection() { … return (… <ComponentSection id="y" …> … ) }` — whole function per id. */
function extractNamedFunctionBlocks(preamble) {
  const blocks = []
  const fnRe = /^function (\w+)\(\) \{/gm
  const starts = [...preamble.matchAll(fnRe)]
  for (let k = 0; k < starts.length; k++) {
    const start = starts[k].index
    const end = k + 1 < starts.length ? starts[k + 1].index : preamble.length
    const fnText = preamble.slice(start, end).trimEnd()
    const idMatch = fnText.match(/<ComponentSection\s+id="([a-z0-9-]+)"/)
    if (idMatch) blocks.push({ id: idMatch[1], text: fnText, fnName: starts[k][1] })
  }
  return blocks
}

/**
 * Slices the preamble into per-declaration source text, keyed by declared name — same top-level
 * `function`/`const` boundaries as extractHelperNames, just keeping the text instead of the name.
 */
function extractHelperTexts(preamble) {
  const texts = new Map()
  const declRe = /^(?:function|const)\s+([A-Za-z0-9_]+)/gm
  const matches = [...preamble.matchAll(declRe)]
  for (let k = 0; k < matches.length; k++) {
    const start = matches[k].index
    const end = k + 1 < matches.length ? matches[k + 1].index : preamble.length
    texts.set(matches[k][1], preamble.slice(start, end).trimEnd())
  }
  return texts
}

function writeComponentFile(sectionsDir, id, opts) {
  const {
    hasUseClient,
    imports,
    prelude,
    bodyLocals,
    helperImportSpecifier,
    sharedHelperNames,
    jsxOrFunction,
    isNamedFunction,
  } = opts
  const pascal = toPascalCase(id)
  const lines = []
  if (hasUseClient) lines.push("'use client'", '')
  lines.push(...imports)
  if (sharedHelperNames?.length) {
    lines.push(`import { ${sharedHelperNames.join(', ')} } from '${helperImportSpecifier}'`)
  }
  lines.push('')
  if (prelude) lines.push(prelude, '')
  if (isNamedFunction) {
    lines.push(jsxOrFunction.replace(/^function \w+\(/, `export default function ${pascal}Demo(`))
  } else {
    lines.push(`export default function ${pascal}Demo() {`)
    if (bodyLocals) lines.push(bodyLocals)
    lines.push('  return (', `    ${jsxOrFunction}`, '  )', '}')
  }
  lines.push('')
  fs.writeFileSync(path.join(sectionsDir, `${id}.tsx`), lines.join('\n'))
}

function splitFile(sectionsDir, fileName) {
  const source = fs.readFileSync(path.join(sectionsDir, fileName), 'utf8')
  const { imports, preamble, hasUseClient, body } = splitHeader(source)
  const helperNames = extractHelperNames(preamble)

  const inlineBlocks = extractInlineBlocks(body)
  const useNamedFunctionMode = inlineBlocks.length === 0
  const blocks = useNamedFunctionMode ? extractNamedFunctionBlocks(preamble) : inlineBlocks

  if (!blocks.length) {
    console.warn(`  ! ${fileName}: found no ComponentSection blocks — left as-is`)
    return []
  }

  const category = fileName.replace(/\.tsx$/, '')
  // Helpers not already captured as their own block (named-function mode captures its helpers
  // as blocks directly; inline mode never does, so all preamble helpers land here).
  const helperFnNames = helperNames.filter((n) => !blocks.some((b) => b.fnName === n))
  const helperTexts = extractHelperTexts(preamble)

  // Helpers can reference other helpers (e.g. a component function using a sibling constant) —
  // a block's real helper need is the transitive closure over these cross-references, not just
  // what's literally typed in the block's own JSX text.
  const directHelperRefs = new Map(
    helperFnNames.map((n) => [n, helperFnNames.filter((m) => m !== n && usesIdentifier(helperTexts.get(n), m))])
  )
  function closureFor(text) {
    const closure = new Set(neededHelpers(text, helperFnNames))
    const stack = [...closure]
    while (stack.length) {
      const n = stack.pop()
      for (const dep of directHelperRefs.get(n) ?? []) {
        if (!closure.has(dep)) {
          closure.add(dep)
          stack.push(dep)
        }
      }
    }
    return closure
  }

  const blockClosures = blocks.map((b) => closureFor(b.text))

  // A helper used by exactly one block isn't actually "shared" — inline it into that block's
  // own file instead of a category-wide _shared file. Otherwise selecting e.g. just "dialog"
  // would import a _shared/overlays.tsx bundling all 11 overlay helpers (and every import any
  // of them need — Tooltip, Sheet, Drawer, …) just to get the one function dialog.tsx uses.
  const usageCount = new Map(helperFnNames.map((n) => [n, 0]))
  for (const closure of blockClosures) for (const n of closure) usageCount.set(n, usageCount.get(n) + 1)
  const sharedNames = helperFnNames.filter((n) => usageCount.get(n) > 1)
  const singleUseNames = helperFnNames.filter((n) => usageCount.get(n) === 1)

  if (sharedNames.length) {
    const sharedText = sharedNames.map((n) => helperTexts.get(n)).join('\n\n')
    const helperImports = neededImports(sharedText, imports)
    const exportedShared = sharedText.replace(/^(function|const) /gm, 'export $1 ')
    const helperSource = [
      ...(hasUseClient ? ["'use client'", ''] : []),
      ...helperImports,
      '',
      exportedShared,
      '',
    ].join('\n')
    fs.mkdirSync(path.join(sectionsDir, '_shared'), { recursive: true })
    fs.writeFileSync(path.join(sectionsDir, '_shared', `${category}.tsx`), helperSource)
  }

  // Local `const`/`let` declarations (typically useState hooks) sitting before the first block
  // in the default-exported function's own body — can't be shared as a module-level import since
  // they're hook calls, so every block that needs one gets its own private copy inlined instead.
  const firstBlockIdx = useNamedFunctionMode ? -1 : body.search(/<ComponentSection\s+id="/)
  const bodyLocalStmts = firstBlockIdx > 0 ? extractBodyLocals(body.slice(0, firstBlockIdx)) : []

  const ids = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const text = block.text
    const closure = blockClosures[i]
    // Filtering helperFnNames (rather than iterating the Set directly) preserves the original
    // declaration order — needed since a `const` helper referencing another `const` declared
    // earlier in the file isn't hoisted, so the inlined/shared output must keep that order.
    const sharedUsed = helperFnNames.filter((n) => closure.has(n) && sharedNames.includes(n))
    const singleUsed = helperFnNames.filter((n) => closure.has(n) && singleUseNames.includes(n))
    const prelude = singleUsed.map((n) => helperTexts.get(n)).join('\n\n') || undefined
    const neededLocals = bodyLocalStmts.filter((s) => s.names.some((n) => usesIdentifier(text, n)))
    const bodyLocals = neededLocals.map((s) => s.text).join('\n') || undefined
    const blockImports = neededImports([text, prelude, bodyLocals].filter(Boolean).join('\n'), imports)
    writeComponentFile(sectionsDir, block.id, {
      hasUseClient,
      imports: blockImports,
      prelude,
      bodyLocals,
      helperImportSpecifier: `./_shared/${category}`,
      sharedHelperNames: sharedUsed,
      jsxOrFunction: text,
      isNamedFunction: useNamedFunctionMode,
    })
    ids.push(block.id)
  }

  fs.rmSync(path.join(sectionsDir, fileName))
  return ids
}

for (const target of TARGETS) {
  const sectionsDir = path.join(root, target.dir, target.sectionsRel)
  console.log(`\n${target.dir}:`)
  for (const fileName of fs.readdirSync(sectionsDir)) {
    if (!fileName.endsWith('.tsx') || NO_SPLIT.has(fileName)) continue
    const ids = splitFile(sectionsDir, fileName)
    if (ids.length) console.log(`  ${fileName} -> ${ids.join(', ')}`)
  }
}

console.log('\nDone. Re-run `npm run build:registry` next.')
