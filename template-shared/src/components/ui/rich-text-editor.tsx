'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapUnderline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Link as LinkIcon,
  Unlink,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'

type RichTextEditorProps = {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
    ],
    content: value ?? '',
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML())
    },
  })

  // Sync external value changes without triggering a feedback loop.
  // The guard `editor.getHTML() === value` prevents re-setting content that
  // the editor just emitted — the editor already holds that state.
  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (editor.getHTML() === value) return
    editor.commands.setContent(value ?? '', { emitUpdate: false })
  }, [value, editor])

  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  const showPlaceholder = editor?.isEmpty && !!placeholder && !disabled

  function toggleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const url = window.prompt('URL')
    if (!url) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      id={id}
      data-slot="rich-text-editor"
      data-disabled={disabled || undefined}
      className={cn(
        'rounded-lg border border-input bg-background text-sm shadow-xs transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b border-input px-1.5 py-1',
          disabled && 'pointer-events-none'
        )}
      >
        <Toggle
          size="sm"
          aria-label="Bold"
          pressed={editor?.isActive('bold') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run() && !editor?.isActive('bold')}
        >
          <Bold />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Italic"
          pressed={editor?.isActive('italic') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run() && !editor?.isActive('italic')}
        >
          <Italic />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Strikethrough"
          pressed={editor?.isActive('strike') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor?.can().chain().focus().toggleStrike().run() && !editor?.isActive('strike')}
        >
          <Strikethrough />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Underline"
          pressed={editor?.isActive('underline') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline />
        </Toggle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={editor?.isActive('link') ? 'Remove link' : 'Add link'}
          aria-pressed={editor?.isActive('link') ?? false}
          onClick={toggleLink}
        >
          {editor?.isActive('link') ? <Unlink /> : <LinkIcon />}
        </Button>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Toggle
          size="sm"
          aria-label="Heading 1"
          pressed={editor?.isActive('heading', { level: 1 }) ?? false}
          onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Heading 2"
          pressed={editor?.isActive('heading', { level: 2 }) ?? false}
          onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Heading 3"
          pressed={editor?.isActive('heading', { level: 3 }) ?? false}
          onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Toggle
          size="sm"
          aria-label="Bullet list"
          pressed={editor?.isActive('bulletList') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Ordered list"
          pressed={editor?.isActive('orderedList') ?? false}
          onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>

      <div
        className="relative cursor-text"
        onClick={() => editor?.commands.focus()}
      >
        {showPlaceholder && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-2 select-none text-muted-foreground"
          >
            {placeholder}
          </span>
        )}
        <EditorContent
          editor={editor}
          data-slot="rich-text-editor-content"
          className={cn(
            'min-h-32 px-3 py-2',
            '[&_.tiptap]:outline-none',
            '[&_.tiptap_>*+*]:mt-2',
            '[&_.tiptap_p]:leading-relaxed',
            '[&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:leading-tight',
            '[&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:leading-tight',
            '[&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:leading-tight',
            '[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5',
            '[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5',
            '[&_.tiptap_li]:my-0.5',
            '[&_.tiptap_strong]:font-semibold',
            '[&_.tiptap_em]:italic',
            '[&_.tiptap_s]:line-through',
            '[&_.tiptap_u]:underline',
            '[&_.tiptap_a]:text-primary [&_.tiptap_a]:underline [&_.tiptap_a]:underline-offset-2',
          )}
        />
      </div>
    </div>
  )
}

export { RichTextEditor }
export type { RichTextEditorProps }
