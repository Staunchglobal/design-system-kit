import { Copy, Eye, FolderOpen, Mail, MessageSquare, Pencil, Share2, Trash2 } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu'

function ContextMenuSection() {
  return (
    <Example title="Right-click context menu" description="Items, checkbox, radio group, submenu">
      <ContextMenu>
        <ContextMenuTrigger className="text-muted-foreground flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed text-sm">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem>
            <FolderOpen />
            Open
          </ContextMenuItem>
          <ContextMenuItem>
            <Pencil />
            Rename
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem defaultChecked>
            <Eye />
            Show hidden files
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuRadioGroup defaultValue="list">
            <ContextMenuRadioItem value="list">List</ContextMenuRadioItem>
            <ContextMenuRadioItem value="grid">Grid</ContextMenuRadioItem>
            <ContextMenuRadioItem value="details">Details</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share2 />
              Share
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>
                <Mail />
                Email
              </ContextMenuItem>
              <ContextMenuItem>
                <MessageSquare />
                Message
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <Trash2 />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Example>
  )
}

export default function ContextMenuDemo() {
  return (
    <ComponentSection
        id="context-menu"
        title="Context Menu"
        description="Menu triggered by right-clicking a target."
      >
        <ContextMenuSection />
      </ComponentSection>
  )
}
