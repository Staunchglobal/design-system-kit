'use client'

import * as React from 'react'
import { Calendar, FolderOpen, Pencil, Settings, Share2, Trash2, UserPlus } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'

function CommandSection() {
  const [commandDialogOpen, setCommandDialogOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandDialogOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <ExampleGrid>
      <Example title="Inline command palette" description="Try typing “zzz” to see the empty state">
        <Command className="w-full max-w-sm rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar />
                Calendar
              </CommandItem>
              <CommandItem>
                <FolderOpen />
                Open recent
              </CommandItem>
              <CommandItem>
                <Share2 />
                Share
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <Settings />
                Preferences
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <UserPlus />
                Invite users
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Example>

      <Example title="Command dialog" description="Trigger button or press ⌘K / Ctrl+K">
        <Button variant="outline" onClick={() => setCommandDialogOpen(true)}>
          <span>Search...</span>
          <kbd className="bg-muted text-muted-foreground ml-2 rounded border px-1.5 py-0.5 text-xs">
            ⌘K
          </kbd>
        </Button>
        <CommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar />
                Calendar
              </CommandItem>
              <CommandItem>
                <Pencil />
                Rename
              </CommandItem>
              <CommandItem>
                <Trash2 />
                Delete
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Example>
    </ExampleGrid>
  )
}

export default function CommandDemo() {
  return (
    <ComponentSection
        id="command"
        title="Command"
        description="Searchable command palette built on cmdk."
      >
        <CommandSection />
      </ComponentSection>
  )
}
