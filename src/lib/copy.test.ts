import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copySelectedFiles, copyTemplateFile } from './copy.js'

function textResponse(text: string): Response {
  return {
    ok: true,
    status: 200,
    text: async () => text,
    headers: { get: () => null },
  } as unknown as Response
}

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-rename-history-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
  vi.unstubAllGlobals()
})

describe('copySelectedFiles + renameHistory', () => {
  it('applies the rename history to a newly-copied CSS file before writing it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse(':root {\n  --accent-500: #000;\n}\n'))
    )
    const result = await copySelectedFiles(
      'https://cdn.example.com/repo',
      tmpDir,
      ['styles/theme/tokens/color-scales.css'],
      false,
      [{ family: 'color', from: 'accent', to: 'info' }]
    )
    expect(result.copied).toEqual(['styles/theme/tokens/color-scales.css'])
    const written = fs.readFileSync(path.join(tmpDir, 'styles/theme/tokens/color-scales.css'), 'utf8')
    expect(written).toContain('--info-500: #000;')
    expect(written).not.toContain('--accent-500')
  })

  it('never touches an already-existing file, regardless of rename history', async () => {
    const dest = path.join(tmpDir, 'components/ui/button.tsx')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, 'className="bg-accent"')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('className="bg-accent"'))
    )
    const result = await copySelectedFiles('https://cdn.example.com/repo', tmpDir, ['components/ui/button.tsx'], false, [
      { family: 'color', from: 'accent', to: 'info' },
    ])
    expect(result.skipped).toEqual(['components/ui/button.tsx'])
    expect(fs.readFileSync(dest, 'utf8')).toBe('className="bg-accent"') // untouched on disk
  })

  it('does not apply rename history when the list is empty (default)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('--accent-500: #000;'))
    )
    const result = await copySelectedFiles('https://cdn.example.com/repo', tmpDir, ['a.css'], false)
    expect(result.copied).toEqual(['a.css'])
    expect(fs.readFileSync(path.join(tmpDir, 'a.css'), 'utf8')).toBe('--accent-500: #000;')
  })
})

describe('copyTemplateFile + renameHistory', () => {
  it('applies the rename history to a newly-copied file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('className="bg-accent"'))
    )
    const dest = path.join(tmpDir, 'components/ui/badge.tsx')
    const result = await copyTemplateFile('https://cdn.example.com/repo/badge.tsx', dest, false, [
      { family: 'color', from: 'accent', to: 'info' },
    ])
    expect(result).toBe('copied')
    expect(fs.readFileSync(dest, 'utf8')).toBe('className="bg-info"')
  })
})
