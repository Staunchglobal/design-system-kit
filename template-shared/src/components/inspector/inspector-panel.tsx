'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInspector } from './inspector-context'
import { useMounted } from './use-mounted'
import {
  readComputedStyle,
  readInteractiveState,
  describeTarget,
  type BoxSide,
  type ColorValue,
  type ElementStyleSnapshot,
  type InteractiveState,
} from './style-reader'

const STATES: { key: 'resting' | InteractiveState; label: string }[] = [
  { key: 'resting', label: 'Resting' },
  { key: 'hover', label: 'Hover' },
  { key: 'focus', label: 'Focus' },
  { key: 'active', label: 'Active' },
]

function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = React.useCallback((value: string) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(value)
        setTimeout(() => setCopied((c) => (c === value ? null : c)), 1200)
      })
      .catch(() => {})
  }, [])
  return { copied, copy }
}

function Swatch({
  color,
  onCopy,
  copied,
}: {
  color: ColorValue
  onCopy: (v: string) => void
  copied: string | null
}) {
  if (!color) return <span className="text-muted-foreground text-xs">none</span>
  return (
    <button
      type="button"
      data-inspector-ui=""
      onClick={() => onCopy(color.hex)}
      className="flex items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-black/5 dark:hover:bg-white/10"
      title="Click to copy"
    >
      <span
        className="inline-block size-3.5 rounded-sm border border-black/10 dark:border-white/20"
        style={{ background: color.hex }}
      />
      <span className="font-mono">
        {color.hex}
        {color.alpha < 1 ? ` @ ${Math.round(color.alpha * 100)}%` : ''}
      </span>
      {copied === color.hex ? <Check className="size-3" /> : <Copy className="size-3 opacity-40" />}
    </button>
  )
}

function BoxSideRow({ label, side }: { label: string; side: BoxSide }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">
        {side.top} {side.right} {side.bottom} {side.left}
      </span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">{children}</h4>
}

function SnapshotView({ snapshot }: { snapshot: ElementStyleSnapshot & { supported?: boolean } }) {
  const { copied, copy } = useCopy()
  return (
    <div className="space-y-4">
      {snapshot.supported === false && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Best-effort: no matching stylesheet rule found for this state on this element — showing
          resting values instead. Group-hover, Radix data-state-driven interactions, and inline JS
          handlers aren&apos;t covered by this scan.
        </div>
      )}
      <section>
        <SectionHeading>Size</SectionHeading>
        <div className="font-mono text-xs">
          {snapshot.width} × {snapshot.height}
        </div>
      </section>
      <section>
        <SectionHeading>Spacing (top right bottom left)</SectionHeading>
        <BoxSideRow label="Padding" side={snapshot.padding} />
        <BoxSideRow label="Margin" side={snapshot.margin} />
      </section>
      <section>
        <SectionHeading>Color</SectionHeading>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Background</span>
          <Swatch color={snapshot.background} onCopy={copy} copied={copied} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Text</span>
          <Swatch color={snapshot.color} onCopy={copy} copied={copied} />
        </div>
      </section>
      <section>
        <SectionHeading>Border</SectionHeading>
        <BoxSideRow label="Width" side={snapshot.border.width} />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Color (top)</span>
          <Swatch color={snapshot.border.color.top} onCopy={copy} copied={copied} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Style</span>
          <span className="font-mono">{snapshot.border.style}</span>
        </div>
      </section>
      <section>
        <SectionHeading>Radius (TL TR BR BL)</SectionHeading>
        <div className="font-mono text-xs">
          {snapshot.radius.topLeft} {snapshot.radius.topRight} {snapshot.radius.bottomRight}{' '}
          {snapshot.radius.bottomLeft}
        </div>
      </section>
      <section>
        <SectionHeading>Typography</SectionHeading>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Font size</span>
          <span className="font-mono">{snapshot.fontSize}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Line height</span>
          <span className="font-mono">{snapshot.lineHeight}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Font family</span>
          <span className="max-w-[60%] truncate text-right font-mono" title={snapshot.fontFamily}>
            {snapshot.fontFamily}
          </span>
        </div>
      </section>
    </div>
  )
}

export function InspectorPanel() {
  const { pinned, pin } = useInspector()
  const mounted = useMounted()
  const [activeState, setActiveState] = React.useState<'resting' | InteractiveState>('resting')
  const [, forceTick] = React.useReducer((c: number) => c + 1, 0)

  // Reset to the Resting tab whenever a *different* element gets pinned — adjusted during render
  // (not in an effect) per React's "you might not need an effect" guidance for state resets.
  const [prevPinned, setPrevPinned] = React.useState(pinned)
  if (pinned !== prevPinned) {
    setPrevPinned(pinned)
    setActiveState('resting')
  }

  React.useEffect(() => {
    if (!pinned || activeState !== 'resting') return
    const id = setInterval(forceTick, 400)
    return () => clearInterval(id)
  }, [pinned, activeState])

  if (!pinned || !mounted) return null

  const meta = describeTarget(pinned)
  const snapshot: ElementStyleSnapshot & { supported?: boolean } =
    activeState === 'resting' ? readComputedStyle(pinned) : readInteractiveState(pinned, activeState)

  return createPortal(
    <div
      data-inspector-ui=""
      className="bg-background text-foreground fixed inset-y-0 right-0 z-[2147483000] flex w-80 flex-col border-l shadow-2xl"
    >
      <div className="flex items-center justify-between border-b p-3">
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-medium">{meta.slot ?? meta.tag}</div>
          <div className="text-muted-foreground flex gap-2 text-xs">
            {meta.variant && <span>variant={meta.variant}</span>}
            {meta.size && <span>size={meta.size}</span>}
          </div>
        </div>
        <button
          type="button"
          data-inspector-ui=""
          onClick={() => pin(null)}
          className="hover:bg-muted rounded p-1"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex border-b">
        {STATES.map((s) => (
          <button
            key={s.key}
            type="button"
            data-inspector-ui=""
            onClick={() => setActiveState(s.key)}
            className={cn(
              'flex-1 border-b-2 py-2 text-xs font-medium transition-colors',
              activeState === s.key
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <SnapshotView snapshot={snapshot} />
      </div>
    </div>,
    document.body
  )
}
