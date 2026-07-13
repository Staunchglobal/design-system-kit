import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyRenameHistory, loadRenameHistory } from './rename-history.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rename-history-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('loadRenameHistory', () => {
  it('returns an empty list when no history file exists', () => {
    expect(loadRenameHistory(tmpDir)).toEqual([])
  })

  it('reads renames from lib/theme/token-renames.json', () => {
    const dir = path.join(tmpDir, 'lib/theme')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'token-renames.json'),
      JSON.stringify({ renames: [{ family: 'color', from: 'accent', to: 'info' }] })
    )
    expect(loadRenameHistory(tmpDir)).toEqual([{ family: 'color', from: 'accent', to: 'info' }])
  })

  it('returns an empty list for malformed JSON rather than throwing', () => {
    const dir = path.join(tmpDir, 'lib/theme')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'token-renames.json'), '{not json')
    expect(loadRenameHistory(tmpDir)).toEqual([])
  })
})

describe('applyRenameHistory', () => {
  it('no-ops for file kinds a rename never touches', () => {
    const content = '--accent-500: #000;'
    expect(applyRenameHistory('package.json', content, [{ family: 'color', from: 'accent', to: 'info' }])).toBe(
      content
    )
    expect(applyRenameHistory('scripts/generate-theme-manifest.mjs', content, [
      { family: 'color', from: 'accent', to: 'info' },
    ])).toBe(content)
  })

  it('replays multiple historical renames in order against a fresh CSS file', () => {
    const content = ':root {\n  --accent-500: #000;\n  --destructive: var(--destructive-600);\n}\n'
    const out = applyRenameHistory('styles/theme/tokens/color-scales.css', content, [
      { family: 'color', from: 'accent', to: 'info' },
      { family: 'color', from: 'destructive', to: 'danger' },
    ])
    expect(out).toContain('--info-500: #000;')
    expect(out).toContain('--danger: var(--danger-600);')
    expect(out).not.toMatch(/--accent\b|--destructive\b/)
  })

  it('replays a rename against a freshly-copied component .tsx file', () => {
    const content = `className="focus:bg-accent focus:text-accent-foreground"`
    const out = applyRenameHistory('components/ui/dropdown-menu.tsx', content, [
      { family: 'color', from: 'accent', to: 'info' },
    ])
    expect(out).toBe(`className="focus:bg-info focus:text-info-foreground"`)
  })

  it('never touches an unrelated token that only shares a substring', () => {
    const content = '--sidebar-accent: var(--accent-100);'
    const out = applyRenameHistory('styles/theme/tokens/colors.css', content, [
      { family: 'color', from: 'accent', to: 'info' },
    ])
    expect(out).toBe('--sidebar-accent: var(--info-100);')
  })
})
