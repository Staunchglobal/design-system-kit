import { ThemeEditorShell } from '@/theme-editor/_components/theme-editor-shell'
import type { ThemeManifest } from '@/lib/theme/types'
import manifestJson from '@/styles/theme/theme.manifest.json'

const manifest = manifestJson as ThemeManifest

/** Mount this wherever your router renders `/theme-editor`. Dev-only save (see the Vite plugin). */
export default function ThemeEditorPage() {
  const isProd = import.meta.env.PROD

  return (
    // fixed inset-0: isolate from your app shell so columns get a real viewport height and can scroll
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
