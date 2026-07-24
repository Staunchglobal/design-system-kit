import fs from 'node:fs'
import { IndentationText, Project, QuoteKind, SyntaxKind, type ObjectLiteralExpression } from 'ts-morph'

export type ViteConfigPatchResult =
  | { action: 'patched' }
  | { action: 'already-present' }
  | { action: 'needs-manual'; reason: string }

export function patchViteConfig(filePath: string): ViteConfigPatchResult {
  if (!fs.existsSync(filePath)) {
    return { action: 'needs-manual', reason: `${filePath} not found.` }
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    manipulationSettings: { quoteKind: QuoteKind.Single, indentationText: IndentationText.TwoSpaces },
  })
  const sourceFile = project.addSourceFileAtPath(filePath)

  const importDecls = sourceFile.getImportDeclarations()
  const alreadyImported = (specifier: string) => importDecls.some((d) => d.getModuleSpecifierValue() === specifier)

  if (alreadyImported('./vite-plugin-design-kit.ts') || alreadyImported('./vite-plugin-design-kit')) {
    return { action: 'already-present' }
  }

  const defineConfigCall = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((c) => c.getExpression().getText() === 'defineConfig')
  if (!defineConfigCall) {
    return {
      action: 'needs-manual',
      reason: 'Could not find a `defineConfig(...)` call — merge the Tailwind/theme-save plugin wiring in by hand.',
    }
  }

  const arg = defineConfigCall.getArguments()[0]
  if (!arg || arg.getKind() !== SyntaxKind.ObjectLiteralExpression) {
    return {
      action: 'needs-manual',
      reason: 'defineConfig(...) is not called with a plain object literal — merge the wiring in by hand.',
    }
  }
  const configObject = arg as ObjectLiteralExpression

  const pluginsProp = configObject.getProperty('plugins')
  const pluginsInitializer = pluginsProp?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
  if (!pluginsProp || !pluginsInitializer || pluginsInitializer.getKind() !== SyntaxKind.ArrayLiteralExpression) {
    return {
      action: 'needs-manual',
      reason: pluginsProp
        ? '`plugins` is not a plain array literal — merge the Tailwind/theme-save plugin wiring in by hand.'
        : 'Could not find a `plugins` array — merge the Tailwind/theme-save plugin wiring in by hand.',
    }
  }
  const pluginsArray = pluginsInitializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression)

  const hasPluginNamed = (name: string) =>
    pluginsArray
      .getElements()
      .some((e) => e.getKind() === SyntaxKind.CallExpression && e.asKindOrThrow(SyntaxKind.CallExpression).getExpression().getText() === name)

  const missingImports: string[] = []
  if (!alreadyImported('@tailwindcss/vite')) missingImports.push(`import tailwindcss from '@tailwindcss/vite'`)
  if (!alreadyImported('node:url')) missingImports.push(`import { fileURLToPath } from 'node:url'`)
  missingImports.push(`import { designKit } from './vite-plugin-design-kit.ts'`)

  if (!hasPluginNamed('tailwindcss')) pluginsArray.addElement('tailwindcss()')
  if (!hasPluginNamed('designKit')) pluginsArray.addElement('designKit()')

  const resolveProp = configObject.getProperty('resolve')
  if (!resolveProp) {
    const newResolveProp = configObject
      .addPropertyAssignment({ name: 'resolve', initializer: '{}' })
      .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    const newAliasProp = newResolveProp
      .addPropertyAssignment({ name: 'alias', initializer: '{}' })
      .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    newAliasProp.addPropertyAssignment({
      name: `'@'`,
      initializer: `fileURLToPath(new URL('./src', import.meta.url))`,
    })
  } else {
    const resolveInitializer = resolveProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
    if (resolveInitializer?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      return {
        action: 'needs-manual',
        reason: '`resolve` is not a plain object literal — add the "@/*" alias in by hand.',
      }
    }
    const resolveObject = resolveInitializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    const aliasProp = resolveObject.getProperty('alias')
    if (!aliasProp) {
      resolveObject.addPropertyAssignment({
        name: 'alias',
        initializer: `{ '@': fileURLToPath(new URL('./src', import.meta.url)) }`,
      })
    } else {
      const aliasInitializer = aliasProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
      if (aliasInitializer?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
        return {
          action: 'needs-manual',
          reason: '`resolve.alias` is not a plain object literal — add the "@/*" alias in by hand.',
        }
      }
      const aliasObject = aliasInitializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
      if (!aliasObject.getProperty('@') && !aliasObject.getProperty("'@'")) {
        aliasObject.addPropertyAssignment({
          name: `'@'`,
          initializer: `fileURLToPath(new URL('./src', import.meta.url))`,
        })
      }
    }
  }

  let src = sourceFile.getFullText()
  if (importDecls.length) {
    const insertAt = importDecls[importDecls.length - 1].getEnd()
    src = src.slice(0, insertAt) + `\n${missingImports.join('\n')}` + src.slice(insertAt)
  } else {
    src = `${missingImports.join('\n')}\n` + src
  }

  fs.writeFileSync(filePath, src)
  return { action: 'patched' }
}

export const VITE_CONFIG_MANUAL_SNIPPET = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { designKit } from './vite-plugin-design-kit.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), designKit()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
`
