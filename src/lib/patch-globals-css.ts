import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import type { AtRule, ChildNode, Root } from 'postcss'

function looksLikeStockNextGlobals(css: string): boolean {
  return (
    css.includes('--color-background: var(--background)') &&
    css.includes('--font-sans: var(--font-geist-sans)') &&
    !css.includes('theme/index.css') &&
    css.length < 2000
  )
}

function isAtRule(node: ChildNode, name?: string): node is AtRule {
  return node.type === 'atrule' && (name === undefined || node.name === name)
}

function findEquivalentAtRule(root: Root, node: AtRule): AtRule | undefined {
  return root.nodes.find((n): n is AtRule => isAtRule(n, node.name) && n.params === node.params)
}

export type GlobalsCssPatchResult =
  | { action: 'created' }
  | { action: 'replaced-stock' }
  | { action: 'patched'; addedImports: string[]; addedOther: string[]; addedThemeBlock: boolean }
  | { action: 'needs-manual-merge'; reason: string }

export function patchGlobalsCss(filePath: string, templateContent: string): GlobalsCssPatchResult {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, templateContent)
    return { action: 'created' }
  }

  const existingSrc = fs.readFileSync(filePath, 'utf8')

  if (looksLikeStockNextGlobals(existingSrc)) {
    fs.writeFileSync(filePath, templateContent)
    return { action: 'replaced-stock' }
  }

  const existingRoot = postcss.parse(existingSrc)
  const templateRoot = postcss.parse(templateContent)

  const existingTheme = existingRoot.nodes.find((n): n is AtRule => isAtRule(n, 'theme'))
  const existingImportsThemeIndex = existingRoot.nodes.some(
    (n): n is AtRule => isAtRule(n, 'import') && n.params.includes('theme/index.css')
  )

  if (existingTheme && existingImportsThemeIndex) {
    return { action: 'patched', addedImports: [], addedOther: [], addedThemeBlock: false }
  }

  if (existingTheme) {
    return {
      action: 'needs-manual-merge',
      reason:
        'globals.css already has a custom @theme block — merge it by hand (see the printed snippet) instead of risking a broken duplicate block.',
    }
  }

  const templateThemeIndex = templateRoot.nodes.findIndex((n) => isAtRule(n, 'theme'))
  const headerNodes = templateThemeIndex === -1 ? templateRoot.nodes : templateRoot.nodes.slice(0, templateThemeIndex)
  const bodyNodes = templateThemeIndex === -1 ? [] : templateRoot.nodes.slice(templateThemeIndex)

  const headerAtRules = headerNodes.filter((n): n is AtRule => n.type === 'atrule')
  const missingImports = headerAtRules.filter((n) => n.name === 'import' && !findEquivalentAtRule(existingRoot, n))
  const missingOther = headerAtRules.filter((n) => n.name !== 'import' && !findEquivalentAtRule(existingRoot, n))

  const headerToInsert = [...missingImports, ...missingOther]
  if (headerToInsert.length) {
    const originalFirst = existingRoot.first
    const clones = headerToInsert.map((n) => n.clone())
    clones.forEach((n, i) => {
      n.raws.before = i === 0 ? '' : i === missingImports.length ? '\n\n' : '\n'
    })
    if (originalFirst) {
      existingRoot.insertBefore(originalFirst, clones)
      originalFirst.raws.before = '\n\n'
    } else {
      for (const c of clones) existingRoot.append(c)
    }
  }

  if (bodyNodes.length) {
    const bodyClones = bodyNodes.map((n) => n.clone())
    bodyClones[0].raws.before = existingRoot.nodes.length ? '\n\n' : ''
    for (const c of bodyClones) existingRoot.append(c)
  }

  fs.writeFileSync(filePath, existingRoot.toString())
  return {
    action: 'patched',
    addedImports: missingImports.map((n) => n.toString()),
    addedOther: missingOther.map((n) => n.toString()),
    addedThemeBlock: bodyNodes.length > 0,
  }
}
