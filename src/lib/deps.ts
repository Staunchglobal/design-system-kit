import { spawnSync } from 'node:child_process'
import type { PackageManager } from './detect.js'
import { installCommand } from './detect.js'

/**
 * Always installed regardless of which components are chosen: `cn()`'s clsx/tailwind-merge,
 * the icon system's lucide-react, and tw-animate-css (the animate-in/out utilities several
 * components' theme CSS relies on unconditionally). `@shadcn/react` (below, per-component) is
 * a real runtime import (e.g. message-scroller imports from '@shadcn/react/message-scroller'),
 * but bare `shadcn` is only ever reached via the build-time `@import 'shadcn/tailwind.css'` in
 * globals.css/index.css — never JS-imported — so it lives in SHARED_DEV_DEPENDENCIES instead.
 */
export const CORE_RUNTIME_DEPENDENCIES: Record<string, string> = {
  clsx: '^2.1.1',
  'lucide-react': '^1.23.0',
  'tailwind-merge': '^3.6.0',
  'tw-animate-css': '^1.4.0',
}

/**
 * Every package a specific component (per src/generated/registry.ts) might import — only
 * the subset a given selection actually needs gets installed. Version pins mirror the app
 * this kit was extracted from.
 */
export const OPTIONAL_RUNTIME_DEPENDENCIES: Record<string, string> = {
  '@base-ui/react': '^1.6.0',
  '@dnd-kit/core': '^6.3.1',
  '@dnd-kit/sortable': '^10.0.0',
  '@dnd-kit/utilities': '^3.2.2',
  '@react-oauth/google': '^0.13.5',
  '@react-pdf/renderer': '^4.3.1',
  '@shadcn/react': '^0.2.1',
  '@stripe/react-stripe-js': '^6.2.0',
  '@stripe/stripe-js': '^9.2.0',
  '@tanstack/react-table': '^8.21.3',
  '@tiptap/extension-link': '^3.10.7',
  '@tiptap/extension-underline': '^3.10.7',
  '@tiptap/react': '^3.10.7',
  '@tiptap/starter-kit': '^3.10.7',
  'class-variance-authority': '^0.7.1',
  cmdk: '^1.1.1',
  'date-fns': '^4.4.0',
  'embla-carousel-react': '^8.6.0',
  'input-otp': '^1.4.2',
  'radix-ui': '^1.6.2',
  'react-day-picker': '^10.0.1',
  'react-image-crop': '^11.0.10',
  'react-resizable-panels': '^4.12.1',
  recharts: '^3.9.2',
  sonner: '^2.0.7',
  vaul: '^1.1.2',
}

/** All runtime deps this kit could ever need — used to resolve version pins for a chosen subset. */
export const ALL_RUNTIME_DEPENDENCIES: Record<string, string> = {
  ...CORE_RUNTIME_DEPENDENCIES,
  ...OPTIONAL_RUNTIME_DEPENDENCIES,
}

export const SHARED_DEV_DEPENDENCIES: Record<string, string> = {
  '@tailwindcss/container-queries': '^0.1.1',
  '@tailwindcss/forms': '^0.5.11',
  '@tailwindcss/typography': '^0.5.20',
  shadcn: '^4.13.0',
  tailwindcss: '^4',
}

/** Next.js builds Tailwind through PostCSS. */
export const NEXT_DEV_DEPENDENCIES: Record<string, string> = {
  ...SHARED_DEV_DEPENDENCIES,
  '@tailwindcss/postcss': '^4',
}

/** Vite has a dedicated first-party Tailwind plugin — no PostCSS config needed. */
export const VITE_DEV_DEPENDENCIES: Record<string, string> = {
  ...SHARED_DEV_DEPENDENCIES,
  '@tailwindcss/vite': '^4',
}

/**
 * Next.js loads Manrope (sans) + Geist Mono via next/font/google in layout.tsx — Vite has no
 * built-in equivalent, so these self-host the same families via @fontsource instead of falling
 * back to bare system fonts (or requiring a Google Fonts CDN request). Always installed for
 * Vite, mirroring how Next always gets the kit default fonts regardless of which components
 * you pick.
 */
export const VITE_FONT_DEPENDENCIES: Record<string, string> = {
  '@fontsource/manrope': '^5.2.5',
  '@fontsource/geist-mono': '^5.2.8',
}

function withVersions(map: Record<string, string>): string[] {
  return Object.entries(map).map(([name, version]) => `${name}@${version}`)
}

/** Returns the subset of `map` not already present (in any form) in the consumer's package.json. */
export function missingDeps(
  map: Record<string, string>,
  existing: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, version] of Object.entries(map)) {
    if (!(name in existing)) out[name] = version
  }
  return out
}

export function runInstall(
  pm: PackageManager,
  cwd: string,
  packages: Record<string, string>,
  dev: boolean
): { ok: boolean; message: string } {
  const names = withVersions(packages)
  if (!names.length) return { ok: true, message: 'nothing to install' }
  const { command, args } = installCommand(pm, names, dev)
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    return { ok: false, message: `${command} ${args.join(' ')} exited with code ${result.status}` }
  }
  return { ok: true, message: 'installed' }
}
