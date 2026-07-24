import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchRequiredTemplateText,
  fetchTemplateSize,
  fetchTemplateText,
  isRemoteUrl,
  mapWithConcurrency,
  remoteUrl,
} from './remote.js'

function jsonResponse(init: { status?: number; text?: string; headers?: Record<string, string> }) {
  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    text: async () => init.text ?? '',
    headers: { get: (name: string) => init.headers?.[name.toLowerCase()] ?? null },
  } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('remoteUrl', () => {
  it('joins a base and segments with a single slash', () => {
    expect(remoteUrl('https://cdn.example.com/repo', 'src', 'components', 'ui', 'button.tsx')).toBe(
      'https://cdn.example.com/repo/src/components/ui/button.tsx'
    )
  })

  it('collapses accidental double slashes without touching the protocol', () => {
    expect(remoteUrl('https://cdn.example.com/repo/', '/src/', 'button.tsx')).toBe(
      'https://cdn.example.com/repo/src/button.tsx'
    )
  })
})

describe('isRemoteUrl', () => {
  it('recognizes http(s) URLs and rejects local paths', () => {
    expect(isRemoteUrl('https://cdn.example.com/x')).toBe(true)
    expect(isRemoteUrl('http://cdn.example.com/x')).toBe(true)
    expect(isRemoteUrl('/home/user/repo/template-shared')).toBe(false)
  })
})

describe('fetchTemplateText', () => {
  it('returns the body text on a 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ text: 'export const x = 1' })))
    expect(await fetchTemplateText('https://cdn.example.com/button.tsx')).toBe('export const x = 1')
  })

  it('returns null on a 404 without retrying — a 404 is a real answer, not a transient failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchTemplateText('https://cdn.example.com/missing.tsx')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries a transient network error before giving up, then throws a clear message', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchTemplateText('https://cdn.example.com/button.tsx', { retries: 1 })).rejects.toThrow(
      /Could not reach https:\/\/cdn\.example\.com\/button\.tsx/
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries a 500 before giving up, then throws with the status code', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchTemplateText('https://cdn.example.com/button.tsx', { retries: 1 })).rejects.toThrow(/HTTP 500/)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('succeeds after a transient failure followed by a 200 (retry actually recovers)', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ text: 'recovered' }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchTemplateText('https://cdn.example.com/button.tsx')).toBe('recovered')
  })
})

describe('fetchRequiredTemplateText', () => {
  it('throws a clear, actionable error when the file is unexpectedly missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 404 })))
    await expect(fetchRequiredTemplateText('https://cdn.example.com/components.json')).rejects.toThrow(
      /Expected template file not found/
    )
  })

  it('returns the text when the file exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ text: '{}' })))
    expect(await fetchRequiredTemplateText('https://cdn.example.com/components.json')).toBe('{}')
  })
})

describe('fetchTemplateSize', () => {
  it('parses Content-Length from a HEAD response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ headers: { 'content-length': '1234' } })))
    expect(await fetchTemplateSize('https://cdn.example.com/button.tsx')).toBe(1234)
  })

  it('returns null when Content-Length is missing or the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})))
    expect(await fetchTemplateSize('https://cdn.example.com/button.tsx')).toBeNull()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 404 })))
    expect(await fetchTemplateSize('https://cdn.example.com/missing.tsx')).toBeNull()
  })
})

describe('mapWithConcurrency', () => {
  it('processes every item exactly once and preserves input order in the results', async () => {
    const items = [1, 2, 3, 4, 5]
    const results = await mapWithConcurrency(items, 2, async (n) => n * 10)
    expect(results).toEqual([10, 20, 30, 40, 50])
  })

  it('never runs more than `limit` callbacks concurrently', async () => {
    let inFlight = 0
    let maxInFlight = 0
    const items = Array.from({ length: 10 }, (_, i) => i)
    await mapWithConcurrency(items, 3, async (n) => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((r) => setTimeout(r, 5))
      inFlight--
      return n
    })
    expect(maxInFlight).toBeLessThanOrEqual(3)
  })

  it('handles an empty item list without error', async () => {
    expect(await mapWithConcurrency([], 5, async () => 1)).toEqual([])
  })
})

describe('local shadowing (DESIGN_KIT_LOCAL_TEMPLATES)', () => {
  it('reads a locally-present file instead of fetching, and falls back to the CDN when absent', async () => {
    const localRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'design-kit-local-'))
    fs.mkdirSync(path.join(localRoot, 'template-shared'), { recursive: true })
    fs.writeFileSync(path.join(localRoot, 'template-shared', 'present.tsx'), 'export const local = true')

    const prevEnv = process.env.DESIGN_KIT_LOCAL_TEMPLATES
    process.env.DESIGN_KIT_LOCAL_TEMPLATES = localRoot
    vi.resetModules()
    try {
      const remote = await import('./remote.js')
      const base = remote.cdnBaseFor('template-shared')

      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ text: 'from cdn' }))
      vi.stubGlobal('fetch', fetchMock)

      const present = await remote.fetchTemplateText(remote.remoteUrl(base, 'present.tsx'))
      expect(present).toBe('export const local = true')
      expect(fetchMock).not.toHaveBeenCalled()

      const absent = await remote.fetchTemplateText(remote.remoteUrl(base, 'missing.tsx'))
      expect(absent).toBe('from cdn')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      process.env.DESIGN_KIT_LOCAL_TEMPLATES = prevEnv
      fs.rmSync(localRoot, { recursive: true, force: true })
      vi.resetModules()
    }
  })
})
