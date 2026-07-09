'use client'

import type { ReactNode } from 'react'
import { ThemeEditorProvider, useThemeEditor } from '@/app/theme-editor/_lib/theme-editor-context'
import { ThemeNav } from '@/app/theme-editor/_components/theme-nav'
import { VariableForm } from '@/app/theme-editor/_components/variable-form'
import { LivePreview } from '@/app/theme-editor/_components/live-preview'
import { IconMapProvider } from '@/components/icons/icon-context'
import { Inspector } from '@/components/inspector/inspector'
import type { ThemeManifest } from '@/lib/theme/types'

function ThemeEditorWithIcons({ children }: { children: ReactNode }) {
  const { iconMap } = useThemeEditor()
  return <IconMapProvider value={iconMap}>{children}</IconMapProvider>
}

export function ThemeEditorShell({ manifest }: { manifest: ThemeManifest }) {
  return (
    <ThemeEditorProvider manifest={manifest}>
      <ThemeEditorWithIcons>
        <Inspector>
          <div className="flex h-full min-h-0 overflow-hidden">
            <ThemeNav />
            {/* flex (not grid): stacked rows on mobile each get flex-1 + min-h-0 so overflow-y-auto works */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden border-r">
                <VariableForm />
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <LivePreview />
              </div>
            </div>
          </div>
        </Inspector>
      </ThemeEditorWithIcons>
    </ThemeEditorProvider>
  )
}
