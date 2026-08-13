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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
  vi.unstubAllGlobals()
})

describe('copySelectedFiles', () => {
  it('fetches and writes a newly-copied file verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse(':root {\n  --accent-500: #000;\n}\n'))
    )
    const result = await copySelectedFiles(
      'https://cdn.example.com/repo',
      tmpDir,
      ['styles/theme/tokens/color-scales.css'],
      false
    )
    expect(result.copied).toEqual(['styles/theme/tokens/color-scales.css'])
    const written = fs.readFileSync(path.join(tmpDir, 'styles/theme/tokens/color-scales.css'), 'utf8')
    expect(written).toBe(':root {\n  --accent-500: #000;\n}\n')
  })

  it('never touches an already-existing file', async () => {
    const dest = path.join(tmpDir, 'components/ui/button.tsx')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, 'className="bg-accent"')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('className="bg-info"'))
    )
    const result = await copySelectedFiles('https://cdn.example.com/repo', tmpDir, ['components/ui/button.tsx'], false)
    expect(result.skipped).toEqual(['components/ui/button.tsx'])
    expect(fs.readFileSync(dest, 'utf8')).toBe('className="bg-accent"')
  })

  it('omits a path that 404s at srcBase from both copied and skipped', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }) as unknown as Response)
    )
    const result = await copySelectedFiles('https://cdn.example.com/repo', tmpDir, ['does-not-exist.css'], false)
    expect(result.copied).toEqual([])
    expect(result.skipped).toEqual([])
  })

  it('dry-run classifies copied/skipped without writing anything', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('--accent-500: #000;'))
    )
    const result = await copySelectedFiles('https://cdn.example.com/repo', tmpDir, ['a.css'], true)
    expect(result.copied).toEqual(['a.css'])
    expect(fs.existsSync(path.join(tmpDir, 'a.css'))).toBe(false)
  })
})

describe('copyTemplateFile', () => {
  it('fetches and writes a newly-copied file verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => textResponse('className="bg-accent"'))
    )
    const dest = path.join(tmpDir, 'components/ui/badge.tsx')
    const result = await copyTemplateFile('https://cdn.example.com/repo/badge.tsx', dest, false)
    expect(result).toBe('copied')
    expect(fs.readFileSync(dest, 'utf8')).toBe('className="bg-accent"')
  })

  it('skips an already-existing destination file without fetching new content', async () => {
    const dest = path.join(tmpDir, 'components/ui/badge.tsx')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, 'className="bg-accent"')
    const fetchMock = vi.fn(async () => textResponse('className="bg-info"'))
    vi.stubGlobal('fetch', fetchMock)
    const result = await copyTemplateFile('https://cdn.example.com/repo/badge.tsx', dest, false)
    expect(result).toBe('skipped')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(fs.readFileSync(dest, 'utf8')).toBe('className="bg-accent"')
  })
})
