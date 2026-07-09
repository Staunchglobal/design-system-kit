import fs from 'node:fs'
import postcss from 'postcss'
import type { AtRule, ChildNode, Root } from 'postcss'

/** Recognizes the unmodified `create-next-app` (Tailwind v4) default globals.css. */
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

/** Same at-rule name + params already present at the top level (e.g. `@import 'tailwindcss'`). */
function findEquivalentAtRule(root: Root, node: AtRule): AtRule | undefined {
  return root.nodes.find((n): n is AtRule => isAtRule(n, node.name) && n.params === node.params)
}

export type GlobalsCssPatchResult =
  | { action: 'created' }
  | { action: 'replaced-stock' }
  | { action: 'patched'; addedImports: string[]; addedOther: string[]; addedThemeBlock: boolean }
  | { action: 'needs-manual-merge'; reason: string }

/**
 * Uses postcss to parse both the existing file and the template rather than line-matching
 * strings — at-rules are compared by their real name+params (so `@import "tailwindcss";` and
 * `@import 'tailwindcss'` are recognized as equivalent, formatting differences won't cause a
 * duplicate insert), and merging is done by cloning template AST nodes onto the existing tree
 * rather than string concatenation, so postcss's printer keeps the result syntactically valid.
 */
export function patchGlobalsCss(filePath: string, templateContent: string): GlobalsCssPatchResult {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath.replace(/\/[^/]+$/, ''), { recursive: true })
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
    // Already wired up (e.g. a re-run of init) — nothing to do.
    return { action: 'patched', addedImports: [], addedOther: [], addedThemeBlock: false }
  }

  if (existingTheme) {
    return {
      action: 'needs-manual-merge',
      reason:
        'globals.css already has a custom @theme block — merge it by hand (see the printed snippet) instead of risking a broken duplicate block.',
    }
  }

  // Everything before the template's @theme is the header (@import/@custom-variant/@plugin);
  // everything from @theme onward is the utility-registration block plus :root/@layer base.
  const templateThemeIndex = templateRoot.nodes.findIndex((n) => isAtRule(n, 'theme'))
  const headerNodes = templateThemeIndex === -1 ? templateRoot.nodes : templateRoot.nodes.slice(0, templateThemeIndex)
  const bodyNodes = templateThemeIndex === -1 ? [] : templateRoot.nodes.slice(templateThemeIndex)

  const headerAtRules = headerNodes.filter((n): n is AtRule => n.type === 'atrule')
  const missingImports = headerAtRules.filter((n) => n.name === 'import' && !findEquivalentAtRule(existingRoot, n))
  const missingOther = headerAtRules.filter((n) => n.name !== 'import' && !findEquivalentAtRule(existingRoot, n))

  // Imports need to lead the file for Tailwind to process correctly — insert in template order,
  // with @custom-variant/@plugin lines following right after them. Cloned nodes carry their
  // *template* raws.before (blank-line spacing relative to their old neighbors there), which is
  // meaningless in this file, so every boundary gets its spacing set explicitly instead of
  // trusting whatever the clone happened to inherit.
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

  // No @theme block at all (confirmed above) means Tailwind was never wired into this file —
  // append the whole @theme/:root/@layer base block, or every color/radius CSS variable here
  // would silently never become a real Tailwind utility (bg-primary, text-foreground, …).
  // Only the first clone's boundary spacing is normalized — the rest keep their relative
  // spacing to each other from the template, which is already correct for that block's own shape.
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
