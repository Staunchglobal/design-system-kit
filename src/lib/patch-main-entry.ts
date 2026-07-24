import fs from 'node:fs'
import { Project } from 'ts-morph'

export type MainEntryPatchResult = 'added-import' | 'already-present' | 'needs-manual'

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
