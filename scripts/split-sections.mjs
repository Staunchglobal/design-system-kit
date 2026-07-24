#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  { dir: 'template-next', sectionsRel: 'src/app/design-system/_sections' },
  { dir: 'template-vite', sectionsRel: 'src/design-system/_sections' },
]

const NO_SPLIT = new Set(['colors.tsx', 'typography.tsx', 'patterns.tsx'])

const noiseCache = new Map()
function stripNoise(text) {
  let cached = noiseCache.get(text)
  if (cached === undefined) {
    cached = text
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/>([^<>{]*)</g, (_m, inner) => '>' + inner.replace(/[A-Za-z_$][A-Za-z0-9_$]*/g, '_') + '<')
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

function extractHelperNames(preamble) {
  const names = []
  for (const m of preamble.matchAll(/^(?:function|const)\s+([A-Za-z0-9_]+)/gm)) names.push(m[1])
  return names
}

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
  const helperFnNames = helperNames.filter((n) => !blocks.some((b) => b.fnName === n))
  const helperTexts = extractHelperTexts(preamble)

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

  const firstBlockIdx = useNamedFunctionMode ? -1 : body.search(/<ComponentSection\s+id="/)
  const bodyLocalStmts = firstBlockIdx > 0 ? extractBodyLocals(body.slice(0, firstBlockIdx)) : []

  const ids = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const text = block.text
    const closure = blockClosures[i]
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
