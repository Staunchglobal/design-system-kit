import fs from 'node:fs'
import path from 'node:path'

export type RenameFamily = 'color' | 'radius' | 'typography' | 'shadow'
export type RenameHistoryEntry = { family: RenameFamily; from: string; to: string }

export function loadRenameHistory(destRoot: string): RenameHistoryEntry[] {
  const historyPath = path.join(destRoot, 'lib/theme/token-renames.json')
  if (!fs.existsSync(historyPath)) return []
  try {
    const data = JSON.parse(fs.readFileSync(historyPath, 'utf8')) as { renames?: unknown }
    return Array.isArray(data.renames) ? (data.renames as RenameHistoryEntry[]) : []
  } catch {
    return []
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type Replacement = string | ((...args: string[]) => string)
type Rule = { regex: RegExp; replacement: Replacement }

function cssRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case 'color':
      return [
        {
          regex: new RegExp(`--${escFrom}(-foreground|-\\d+)?(?![\\w-])`, 'g'),
          replacement: (_m: string, suffix: string) => `--${to}${suffix ?? ''}`,
        },
      ]
    case 'radius':
      return [
        { regex: new RegExp(`--theme-radius-${escFrom}(?![\\w-])`, 'g'), replacement: `--theme-radius-${to}` },
        { regex: new RegExp(`--radius-${escFrom}(?![\\w-])`, 'g'), replacement: `--radius-${to}` },
      ]
    case 'typography':
      return [
        {
          regex: new RegExp(`(\\.)?typography-${escFrom}(?![a-zA-Z0-9])`, 'g'),
          replacement: (_m: string, dot: string) => `${dot ?? ''}typography-${to}`,
        },
      ]
    case 'shadow':
      return [{ regex: new RegExp(`--shadow-${escFrom}(?![\\w-])`, 'g'), replacement: `--shadow-${to}` }]
  }
}

const CLASS_BOUNDARY = `(?=[/"'\`\\s:]|$)`

function tsxRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case 'color':
      return [
        {
          regex: new RegExp(
            `\\b(bg|text|border|ring|from|to|via|divide|outline|decoration|caret)-${escFrom}(-foreground)?${CLASS_BOUNDARY}`,
            'g'
          ),
          replacement: (_m: string, prefix: string, fg: string) => `${prefix}-${to}${fg ?? ''}`,
        },
        {
          regex: new RegExp(`(cssVar:\\s*['"\`])--${escFrom}(['"\`])`, 'g'),
          replacement: (_m: string, pre: string, post: string) => `${pre}--${to}${post}`,
        },
        {
          regex: new RegExp(`(prefix:\\s*['"\`])${escFrom}(['"\`])`, 'g'),
          replacement: (_m: string, pre: string, post: string) => `${pre}${to}${post}`,
        },
      ]
    case 'radius':
      return [
        {
          regex: new RegExp(`\\brounded(-[a-z]{1,2})?-${escFrom}${CLASS_BOUNDARY}`, 'g'),
          replacement: (_m: string, dir: string) => `rounded${dir ?? ''}-${to}`,
        },
      ]
    case 'typography':
      return [
        { regex: new RegExp(`\\btypography-${escFrom}${CLASS_BOUNDARY}`, 'g'), replacement: `typography-${to}` },
      ]
    case 'shadow':
      return [{ regex: new RegExp(`\\bshadow-${escFrom}${CLASS_BOUNDARY}`, 'g'), replacement: `shadow-${to}` }]
  }
}

function descriptionRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case 'color':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)${escFrom}(-foreground)?\\2:`, 'gm'),
          replacement: (_m: string, indent: string, _q: string, suffix: string) => `${indent}'${to}${suffix ?? ''}':`,
        },
      ]
    case 'radius':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)theme-radius-${escFrom}\\2:`, 'gm'),
          replacement: (_m: string, indent: string) => `${indent}'theme-radius-${to}':`,
        },
      ]
    case 'shadow':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)shadow-${escFrom}\\2:`, 'gm'),
          replacement: (_m: string, indent: string) => `${indent}'shadow-${to}':`,
        },
      ]
    case 'typography':
      return []
  }
}

/**
 * Applies the project's full rename history (in order) to freshly-fetched template
 * content for a file that doesn't exist locally yet. No-ops for file kinds a rename
 * never touches (anything but .css, .tsx, and lib/theme/descriptions.ts).
 */
export function applyRenameHistory(relOrAbsPath: string, content: string, history: RenameHistoryEntry[]): string {
  if (!history.length) return content
  const normalized = relOrAbsPath.replace(/\\/g, '/')
  const isCss = normalized.endsWith('.css')
  const isTsx = normalized.endsWith('.tsx')
  const isDescriptions = normalized.endsWith('lib/theme/descriptions.ts')
  if (!isCss && !isTsx && !isDescriptions) return content

  let out = content
  for (const { family, from, to } of history) {
    const escFrom = escapeRegExp(from)
    const rules = isCss ? cssRulesFor(family, escFrom, to) : isTsx ? tsxRulesFor(family, escFrom, to) : descriptionRulesFor(family, escFrom, to)
    for (const rule of rules) {
      out = out.replace(rule.regex, rule.replacement as never)
    }
  }
  return out
}
