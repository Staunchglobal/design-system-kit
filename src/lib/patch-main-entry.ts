import fs from 'node:fs'
import { Project } from 'ts-morph'

export type MainEntryPatchResult = 'added-import' | 'already-present' | 'needs-manual'

/**
 * Ensures the Vite entry file imports the theme-wired CSS (create-vite already does this by
 * default). Uses ts-morph to find the real top-level import declarations rather than a
 * `/^import .+$/gm` regex — that would misfire on a multi-line import statement (only matches
 * its first line) or a comment that happens to start with the word "import". The insertion
 * itself is still a plain text splice at the AST-computed position, to keep the file's existing
 * style (no semicolons, single quotes) instead of ts-morph's default printer output.
 */
export function patchMainEntry(mainEntryPath: string | null, cssFileName: string): MainEntryPatchResult {
  if (!mainEntryPath || !fs.existsSync(mainEntryPath)) return 'needs-manual'

  const project = new Project({ skipAddingFilesFromTsConfig: true, skipFileDependencyResolution: true })
  const sourceFile = project.addSourceFileAtPath(mainEntryPath)
  const target = `./${cssFileName}`

  const importDecls = sourceFile.getImportDeclarations()
  const alreadyImported = importDecls.some((d) => d.getModuleSpecifierValue() === target)
  if (alreadyImported) return 'already-present'

  const src = sourceFile.getFullText()
  const importLine = `import '${target}'`
  const next = importDecls.length
    ? (() => {
        const insertPos = importDecls[importDecls.length - 1].getEnd()
        return src.slice(0, insertPos) + `\n${importLine}` + src.slice(insertPos)
      })()
    : `${importLine}\n` + src

  fs.writeFileSync(mainEntryPath, next)
  return 'added-import'
}
