import { spawnSync } from 'node:child_process'
import type { PackageManager } from './detect.js'
import { installCommand } from './detect.js'
import optionalRuntimeDependencies from './optional-runtime-dependencies.json'

export const CORE_RUNTIME_DEPENDENCIES: Record<string, string> = {
  clsx: '^2.1.1',
  'lucide-react': '^1.23.0',
  'tailwind-merge': '^3.6.0',
  'tw-animate-css': '^1.4.0',
}

export const OPTIONAL_RUNTIME_DEPENDENCIES: Record<string, string> = optionalRuntimeDependencies

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

export const NEXT_DEV_DEPENDENCIES: Record<string, string> = {
  ...SHARED_DEV_DEPENDENCIES,
  '@tailwindcss/postcss': '^4',
}

export const VITE_DEV_DEPENDENCIES: Record<string, string> = {
  ...SHARED_DEV_DEPENDENCIES,
  '@tailwindcss/vite': '^4',
}

export const VITE_FONT_DEPENDENCIES: Record<string, string> = {
  '@fontsource/manrope': '^5.2.5',
  '@fontsource/geist-mono': '^5.2.8',
}

function withVersions(map: Record<string, string>): string[] {
  return Object.entries(map).map(([name, version]) => `${name}@${version}`)
}

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
