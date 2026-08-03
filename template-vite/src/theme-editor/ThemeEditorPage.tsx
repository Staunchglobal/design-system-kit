import { ThemeEditorShell } from '@/theme-editor/_components/theme-editor-shell'
import type { ThemeManifest } from '@/lib/theme/types'
import manifestJson from '@/styles/theme/theme.manifest.json'

const manifest = manifestJson as ThemeManifest

export default function ThemeEditorPage() {
  const isProd = import.meta.env.PROD

  return (
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
