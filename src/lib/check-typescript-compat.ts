import fs from 'node:fs'
import type { TypeScriptVersionInfo } from './detect.js'
import { log } from './log.js'

export type TsCompatIssue = {
  severity: 'broken' | 'future' | 'info'
  message: string
}

export type TsCompatResult = {
  tsMajor: number | null
  issues: TsCompatIssue[]
  autoFixed: string[]
}

/**
 * `compilerOptions` settings TypeScript 7 turns into hard errors (see the "Updates Since 5.x"
 * section of the TS 7.0 announcement). Detected via text search rather than a full JSONC
 * parse — consistent with patch-tsconfig.ts — so comments/formatting are never at risk.
 */
const TS7_HARD_ERRORS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /"target"\s*:\s*"es5"/i,
    message:
      '`target: "es5"` is removed in TypeScript 7 — bump to `"es2017"` or later (e.g. `"esnext"`).',
  },
  {
    pattern: /"moduleResolution"\s*:\s*"node(10)?"/i,
    message:
      '`moduleResolution: "node"`/`"node10"` is removed in TypeScript 7 — use `"bundler"` (recommended for Next.js/Vite) or `"nodenext"`.',
  },
  {
    pattern: /"moduleResolution"\s*:\s*"classic"/i,
    message: '`moduleResolution: "classic"` is removed in TypeScript 7 — use `"bundler"` or `"nodenext"`.',
  },
  {
    pattern: /"module"\s*:\s*"(amd|umd|systemjs|none)"/i,
    message: '`module: "amd"/"umd"/"systemjs"/"none"` is removed in TypeScript 7 — use `"esnext"` or `"preserve"`.',
  },
  {
    pattern: /"baseUrl"\s*:/,
    message:
      '`baseUrl` is removed in TypeScript 7 — rewrite `paths` entries relative to the tsconfig.json location instead (e.g. `"./src/*"` rather than `baseUrl` + `"src/*"`).',
  },
  {
    pattern: /"downlevelIteration"\s*:/,
    message:
      '`downlevelIteration` is removed in TypeScript 7 (no-op there) — safe to delete; a modern `target` handles iteration natively.',
  },
  {
    pattern: /"esModuleInterop"\s*:\s*false/,
    message: '`esModuleInterop: false` is rejected by TypeScript 7 — delete the line (`true` is now enforced).',
  },
  {
    pattern: /"allowSyntheticDefaultImports"\s*:\s*false/,
    message: '`allowSyntheticDefaultImports: false` is rejected by TypeScript 7 — delete the line.',
  },
  {
    pattern: /"alwaysStrict"\s*:\s*false/,
    message: '`alwaysStrict: false` is rejected by TypeScript 7 — delete the line (strict mode is enforced).',
  },
  {
    pattern: /"ignoreDeprecations"\s*:/,
    message:
      '`ignoreDeprecations` is a TypeScript 5.x escape hatch for deprecated-but-still-working options — TypeScript 7 hard-errors on those options regardless, so this flag no longer has anything to silence. Safe to delete once the underlying options are fixed.',
  },
]

/**
 * Source-level TS7 breaking changes the announcement calls out (namespaces using the `module`
 * keyword, `asserts` on import attributes, Closure-style JSDoc in .js files, etc.) aren't
 * checked here — they'd require scanning every source file, which is slow and these patterns
 * are vanishingly rare in modern React/Next/Vite codebases. Surfaced as a one-line pointer
 * instead of silently pretending the check is exhaustive.
 */
const UNCHECKED_SOURCE_LEVEL_NOTE =
  "This only checks tsconfig.json. TypeScript 7 also changes source-level behavior (the `module` keyword in namespace declarations, `asserts` on import attributes → use `with`, and several JavaScript/JSDoc-file conventions) — see the TS 7.0 announcement's \"JavaScript Differences\" section if you have legacy namespace or JSDoc-heavy code."

function typesArrayFromDeps(deps: Record<string, string>): string[] {
  return Object.keys(deps)
    .filter((name) => name.startsWith('@types/'))
    .map((name) => name.replace(/^@types\//, ''))
    .sort()
}

/**
 * Only bites when "types" is entirely absent: TS 7 changes its default from `["*"]`
 * (auto-include every @types/* package) to `[]` (include nothing), which can silently drop
 * @types/node's `process`/`Buffer`, @types/react's JSX namespace, etc.
 */
function checkTypesDefault(
  tsconfigSrc: string,
  tsMajor: number | null,
  deps: Record<string, string>
): TsCompatIssue | null {
  if (/"types"\s*:/.test(tsconfigSrc)) return null

  const knownTypes = typesArrayFromDeps(deps)
  const listHint = knownTypes.length ? ` (yours: ${knownTypes.join(', ')})` : ''

  if (tsMajor !== null && tsMajor >= 7) {
    return {
      severity: 'broken',
      message: `No explicit "types" array — TypeScript 7 defaults this to [] (previously every installed @types/* package was included automatically)${listHint}. This can silently drop ambient globals.`,
    }
  }
  return {
    severity: 'future',
    message: `No explicit "types" array — fine on TypeScript ${tsMajor ?? '(unknown)'} today, but TypeScript 7 changes the default to [] and can silently break ambient globals${listHint}. Worth listing them explicitly before you upgrade.`,
  }
}

/**
 * TypeScript 7 changes `rootDir`'s default from "the nearest common ancestor of your input
 * files" to the project root (`./`). Only matters when something is actually emitted — with
 * `noEmit: true` (which every Next.js/Vite tsconfig sets) there's no output tree for rootDir
 * to shape, so this is a low-severity FYI rather than a real risk.
 */
function checkRootDirDefault(tsconfigSrc: string, tsMajor: number | null): TsCompatIssue | null {
  if (/"rootDir"\s*:/.test(tsconfigSrc)) return null
  if (/"noEmit"\s*:\s*true/.test(tsconfigSrc)) return null
  const isTs7Plus = tsMajor !== null && tsMajor >= 7
  return {
    severity: isTs7Plus ? 'future' : 'info',
    message:
      'No explicit "rootDir" and no "noEmit: true" — TypeScript 7 defaults rootDir to the project root instead of inferring it from your source layout, which can change where declaration/output files land. Add "rootDir" explicitly if you emit output and your tsconfig sits outside your source folder.',
  }
}

/** Inserts an explicit "types" array right after the compilerOptions opening brace. */
function insertTypesArray(tsconfigSrc: string, types: string[]): string | null {
  const m = tsconfigSrc.match(/"compilerOptions"\s*:\s*\{/)
  if (!m) return null
  const insertAt = m.index! + m[0].length
  const arr = types.map((t) => `"${t}"`).join(', ')
  return tsconfigSrc.slice(0, insertAt) + `\n    "types": [${arr}],` + tsconfigSrc.slice(insertAt)
}

export function checkTypeScriptCompat(
  tsconfigPath: string,
  tsVersion: TypeScriptVersionInfo | null,
  deps: Record<string, string>,
  opts: { autoFix: boolean } = { autoFix: true }
): TsCompatResult {
  const tsMajor = tsVersion?.major ?? null
  const issues: TsCompatIssue[] = []
  const autoFixed: string[] = []

  if (!fs.existsSync(tsconfigPath)) {
    return { tsMajor, issues, autoFixed }
  }

  let src = fs.readFileSync(tsconfigPath, 'utf8')
  const isTs7Plus = tsMajor !== null && tsMajor >= 7

  for (const check of TS7_HARD_ERRORS) {
    if (!check.pattern.test(src)) continue
    issues.push({
      severity: isTs7Plus ? 'broken' : 'future',
      message: isTs7Plus
        ? check.message
        : `${check.message} (fine on your current TypeScript ${tsMajor ?? '(unknown)'}; only bites once you upgrade to 7+)`,
    })
  }

  const typesIssue = checkTypesDefault(src, tsMajor, deps)
  if (typesIssue) {
    if (isTs7Plus && opts.autoFix) {
      const knownTypes = typesArrayFromDeps(deps)
      if (knownTypes.length) {
        const patched = insertTypesArray(src, knownTypes)
        if (patched) {
          fs.writeFileSync(tsconfigPath, patched)
          src = patched
          autoFixed.push(`Added "types": [${knownTypes.join(', ')}] so TypeScript 7's empty default doesn't drop them`)
        } else {
          issues.push(typesIssue)
        }
      } else {
        issues.push(typesIssue)
      }
    } else {
      issues.push(typesIssue)
    }
  }

  const rootDirIssue = checkRootDirDefault(src, tsMajor)
  if (rootDirIssue) issues.push(rootDirIssue)

  return { tsMajor, issues, autoFixed }
}

/**
 * Runs the check and prints a "TypeScript compatibility" report section. Shared by both the
 * Next and Vite init flows since the check itself is framework-agnostic (just tsconfig text
 * + installed @types/* packages).
 */
export function logTypeScriptCompat(
  tsconfigPath: string,
  tsVersion: TypeScriptVersionInfo | null,
  deps: Record<string, string>
): void {
  log.title('TypeScript compatibility')

  if (!tsVersion) {
    log.warn('Could not determine your TypeScript version — skipping compatibility checks.')
    return
  }

  const source = tsVersion.installed ? 'installed' : 'declared range, not yet installed'
  log.info(`Detected TypeScript ${tsVersion.raw} (${source}) — major version ${tsVersion.major}.`)

  const result = checkTypeScriptCompat(tsconfigPath, tsVersion, deps)

  for (const fix of result.autoFixed) log.success(fix)

  const broken = result.issues.filter((i) => i.severity === 'broken')
  const future = result.issues.filter((i) => i.severity === 'future')
  const info = result.issues.filter((i) => i.severity === 'info')

  for (const issue of broken) log.error(issue.message)
  for (const issue of future) log.warn(issue.message)
  for (const issue of info) log.info(issue.message)

  if (!result.autoFixed.length && !broken.length && !future.length && !info.length) {
    if (tsVersion.major >= 7) {
      log.success('tsconfig.json looks TypeScript 7-compatible — no removed options or default-change risks found.')
    } else {
      log.success(
        `TypeScript ${tsVersion.major} detected — compatible as-is. Nothing here would break on an eventual TypeScript 7 upgrade either.`
      )
    }
  } else if (tsVersion.major < 7 && future.length) {
    log.info(
      `These are all fine on TypeScript ${tsVersion.major} today — listed so you're not surprised if you upgrade to TypeScript 7 later.`
    )
  }

  log.info(UNCHECKED_SOURCE_LEVEL_NOTE)
}
