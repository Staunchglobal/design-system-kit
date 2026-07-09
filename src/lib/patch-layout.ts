import fs from 'node:fs'
import { Project, SyntaxKind } from 'ts-morph'

export type LayoutPatchResult =
  | { action: 'patched' }
  | { action: 'already-present' }
  | { action: 'not-needed' }
  | { action: 'needs-manual'; reason: string }

const TOOLTIP_IMPORT = `import { TooltipProvider } from '@/components/ui/tooltip'`
const TOASTER_IMPORT = `import { Toaster } from '@/components/ui/sonner'`

/**
 * Best-effort: wraps the single `{children}` expression in <TooltipProvider> and/or drops
 * a <Toaster /> after it — but only for whichever of those two components were actually
 * installed (picking neither is a no-op; picking only "sonner" skips the Tooltip wrapper,
 * and vice versa, since importing a component that isn't on disk would break the build).
 * Anything more custom than a single `{children}` is left alone and reported back so the
 * caller can print manual steps.
 *
 * Uses ts-morph to find the real `{children}` JsxExpression (excluding, e.g., the `children`
 * identifier in the function's own destructured parameter, which a plain `/\{children\}/`
 * regex can't tell apart) and the real last top-level import declaration to anchor new imports
 * to. The edit itself is still a plain text splice at the AST-computed positions, to preserve
 * the file's existing formatting instead of routing it through ts-morph's printer.
 */
export function patchLayout(
  filePath: string,
  opts: { includeTooltip: boolean; includeToaster: boolean }
): LayoutPatchResult {
  if (!opts.includeTooltip && !opts.includeToaster) {
    return { action: 'not-needed' }
  }

  if (!fs.existsSync(filePath)) {
    return { action: 'needs-manual', reason: `${filePath} not found.` }
  }

  const project = new Project({ skipAddingFilesFromTsConfig: true, skipFileDependencyResolution: true })
  const sourceFile = project.addSourceFileAtPath(filePath)

  const importDecls = sourceFile.getImportDeclarations()
  const hasTooltipImport = importDecls.some((d) => d.getModuleSpecifierValue() === '@/components/ui/tooltip')
  const hasToasterImport = importDecls.some((d) => d.getModuleSpecifierValue() === '@/components/ui/sonner')
  const needsTooltip = opts.includeTooltip && !hasTooltipImport
  const needsToaster = opts.includeToaster && !hasToasterImport

  if (!needsTooltip && !needsToaster) {
    return { action: 'already-present' }
  }

  const childrenExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.JsxExpression).filter((e) => {
    const expr = e.getExpression()
    return expr?.getKind() === SyntaxKind.Identifier && expr.getText() === 'children'
  })
  if (childrenExpressions.length !== 1) {
    return {
      action: 'needs-manual',
      reason:
        childrenExpressions.length === 0
          ? 'Could not find `{children}` in layout.tsx.'
          : 'layout.tsx renders `{children}` more than once — pick the right spot by hand.',
    }
  }

  let src = sourceFile.getFullText()
  const childrenNode = childrenExpressions[0]
  let replacement = '{children}'
  if (needsTooltip) replacement = `<TooltipProvider>${replacement}</TooltipProvider>`
  if (needsToaster) replacement = `${replacement}\n        <Toaster />`
  src = src.slice(0, childrenNode.getStart()) + replacement + src.slice(childrenNode.getEnd())

  const imports = [needsTooltip && TOOLTIP_IMPORT, needsToaster && TOASTER_IMPORT].filter(
    (x): x is string => !!x
  )
  if (!importDecls.length) {
    return { action: 'needs-manual', reason: 'Could not find an import line to anchor new imports to.' }
  }
  const insertAt = importDecls[importDecls.length - 1].getEnd()
  src = src.slice(0, insertAt) + `\n${imports.join('\n')}` + src.slice(insertAt)

  fs.writeFileSync(filePath, src)
  return { action: 'patched' }
}
