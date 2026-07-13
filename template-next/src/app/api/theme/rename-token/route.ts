import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { NextResponse } from 'next/server'
import type { RenameTokenRequest, RenameTokenResponse, ThemeManifest } from '@/lib/theme/types'
import { planRename, applyRename, buildRenameContext, appendRenameHistory } from '@/lib/theme/rename-engine'
import { isValidRenameTarget, type RenameFamily } from '@/lib/theme/validation'

export const runtime = 'nodejs'

/** Works whether the project uses a src/ directory or not (Next.js supports both). */
function srcRoot(): string {
  return fs.existsSync(path.join(process.cwd(), 'src')) ? 'src' : '.'
}

function manifestPath(): string {
  return path.join(process.cwd(), srcRoot(), 'styles/theme/theme.manifest.json')
}

function renameHistoryPath(): string {
  return path.join(process.cwd(), srcRoot(), 'lib/theme/token-renames.json')
}

function renameCtx() {
  const root = process.cwd()
  const sr = srcRoot()
  return buildRenameContext({
    tokensDir: path.join(root, sr, 'styles/theme/tokens'),
    componentsDir: path.join(root, sr, 'styles/theme/components'),
    bridgeFile: path.join(root, sr, 'app/globals.css'),
    uiDir: path.join(root, sr, 'components/ui'),
    designSystemSectionsDir: path.join(root, sr, 'app/design-system/_sections'),
    descriptionsPath: path.join(root, sr, 'lib/theme/descriptions.ts'),
  })
}

function existingTokenNames(): string[] {
  const p = manifestPath()
  if (!fs.existsSync(p)) return []
  const manifest = JSON.parse(fs.readFileSync(p, 'utf8')) as ThemeManifest
  const names = new Set<string>()
  for (const g of manifest.groups) for (const v of g.variables) names.add(v.name.replace(/^--/, ''))
  return [...names]
}

const VALID_FAMILIES: RenameFamily[] = ['color', 'radius', 'typography', 'shadow']

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json<RenameTokenResponse>(
      { ok: false, message: 'Token rename is disabled in production.' },
      { status: 403 }
    )
  }

  let payload: RenameTokenRequest
  try {
    payload = (await request.json()) as RenameTokenRequest
  } catch {
    return NextResponse.json<RenameTokenResponse>({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const { family, from, to, mode } = payload
  if (
    !VALID_FAMILIES.includes(family) ||
    typeof from !== 'string' ||
    typeof to !== 'string' ||
    !from ||
    (mode !== 'preview' && mode !== 'apply')
  ) {
    return NextResponse.json<RenameTokenResponse>(
      { ok: false, message: 'Invalid rename request.', reason: 'invalid' },
      { status: 400 }
    )
  }

  const validationError = isValidRenameTarget(family, from, to, existingTokenNames())
  if (validationError) {
    return NextResponse.json<RenameTokenResponse>(
      { ok: false, message: validationError, reason: 'invalid' },
      { status: 400 }
    )
  }

  const ctx = renameCtx()

  if (mode === 'preview') {
    const plan = planRename({ family, from, to }, ctx)
    if (plan.totalMatches === 0) {
      return NextResponse.json<RenameTokenResponse>(
        { ok: false, message: `No occurrences of "${from}" found.`, reason: 'no-op' },
        { status: 422 }
      )
    }
    return NextResponse.json<RenameTokenResponse>({ ok: true, plan, message: `Found ${plan.totalMatches} occurrence(s) across ${plan.changes.length} file(s).` })
  }

  // mode === 'apply'
  const plan = planRename({ family, from, to }, ctx)
  if (plan.totalMatches === 0) {
    return NextResponse.json<RenameTokenResponse>(
      { ok: false, message: `No occurrences of "${from}" found.`, reason: 'no-op' },
      { status: 422 }
    )
  }

  applyRename({ family, from, to }, ctx)
  appendRenameHistory(renameHistoryPath(), { family, from, to })

  try {
    execFileSync('node', ['scripts/generate-theme-manifest.mjs'], { cwd: process.cwd(), stdio: 'pipe' })
  } catch (e) {
    return NextResponse.json<RenameTokenResponse>({
      ok: true,
      plan,
      message: `Renamed "${from}" to "${to}", but manifest regenerate failed: ${e instanceof Error ? e.message : e}`,
    })
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath(), 'utf8')) as ThemeManifest

  return NextResponse.json<RenameTokenResponse>({
    ok: true,
    plan,
    manifest,
    message: `Renamed "${from}" to "${to}" across ${plan.changes.length} file(s).`,
  })
}
