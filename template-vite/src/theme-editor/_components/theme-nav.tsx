import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useThemeEditor } from '@/theme-editor/_lib/theme-editor-context'
import { cn } from '@/lib/utils'
import * as React from 'react'

export function ThemeNav() {
  const {
    manifest,
    activeGroupId,
    setActiveGroupId,
    dirty,
    saving,
    save,
    reset,
    exportTheme,
    importTheme,
  } = useThemeEditor()
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)
  const importInputRef = React.useRef<HTMLInputElement>(null)

  const tokens = manifest.groups.filter((g) => g.kind === 'token')
  const components = manifest.groups.filter((g) => g.kind === 'component')

  const filter = (title: string, id: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return title.toLowerCase().includes(q) || id.toLowerCase().includes(q)
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full min-h-0 w-64 shrink-0 flex-col border-r">
      <div className="flex shrink-0 flex-col gap-2 p-3">
        <div className="typography-h6">Theme Editor</div>
        <Input
          placeholder="Filter groups…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={!dirty || saving}
            onClick={async () => {
              const res = await save()
              setStatus(res.message)
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="outline" disabled={!dirty || saving} onClick={reset}>
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={exportTheme}>
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => importInputRef.current?.click()}
          >
            Import
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              const res = await importTheme(file)
              setStatus(res.message)
            }}
          />
        </div>
        {dirty && <p className="text-muted-foreground text-xs">Unsaved changes</p>}
        {status && <p className="text-muted-foreground text-xs">{status}</p>}
      </div>
      <Separator />
      <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="Theme groups">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="typography-overline text-muted-foreground px-2">Tokens</div>
            <button
              type="button"
              className={cn(
                'hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-left text-sm',
                activeGroupId === 'icons' && 'bg-sidebar-accent font-medium'
              )}
              onClick={() => setActiveGroupId('icons')}
            >
              Icons
            </button>
            {tokens
              .filter((g) => filter(g.title, g.id))
              .map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={cn(
                    'hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-left text-sm',
                    activeGroupId === g.id && 'bg-sidebar-accent font-medium'
                  )}
                  onClick={() => setActiveGroupId(g.id)}
                >
                  {g.title}
                </button>
              ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className="typography-overline text-muted-foreground px-2">Components</div>
            {components
              .filter((g) => filter(g.title, g.id))
              .map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={cn(
                    'hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-left text-sm',
                    activeGroupId === g.id && 'bg-sidebar-accent font-medium'
                  )}
                  onClick={() => setActiveGroupId(g.id)}
                >
                  {g.title}
                </button>
              ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
