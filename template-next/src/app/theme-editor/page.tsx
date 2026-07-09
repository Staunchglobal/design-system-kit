import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { ThemeEditorShell } from '@/app/theme-editor/_components/theme-editor-shell'
import type { ThemeManifest } from '@/lib/theme/types'

export const metadata: Metadata = {
  title: 'Theme Editor',
  description: 'Live design-system theme editor (development).',
  robots: { index: false, follow: false },
}

function loadManifest(): ThemeManifest {
  // Works whether the project uses a src/ directory or not (Next.js supports both).
  const srcDir = fs.existsSync(path.join(process.cwd(), 'src')) ? 'src' : '.'
  const file = path.join(process.cwd(), srcDir, 'styles/theme/theme.manifest.json')
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ThemeManifest
}

export default function ThemeEditorPage() {
  const manifest = loadManifest()
  const isProd = process.env.NODE_ENV === 'production'

  return (
    // fixed inset-0: isolate from root body flex so columns get a real viewport height and can scroll
    // data-theme-editor: scoping host the live-preview CSS var writer targets (see theme-editor-context.tsx)
    <div
      data-theme-editor=""
      className="bg-background text-foreground fixed inset-0 z-50 flex flex-col overflow-hidden"
    >
      {isProd && (
        <div className="bg-destructive/10 text-destructive shrink-0 border-b px-4 py-2 text-center text-sm">
          Theme editor save is disabled in production. Preview only.
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ThemeEditorShell manifest={manifest} />
      </div>
    </div>
  )
}
