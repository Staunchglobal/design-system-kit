import fs from 'node:fs'

export const TEMPLATES_REPO = 'Staunchglobal/design-system-kit'

declare const __TEMPLATES_REF__: string
export const TEMPLATES_REF = typeof __TEMPLATES_REF__ !== 'undefined' ? __TEMPLATES_REF__ : 'main'

const CDN_PREFIX = `https://cdn.jsdelivr.net/gh/${TEMPLATES_REPO}@${TEMPLATES_REF}/`

function localTemplatesRoot(): string | undefined {
  const root = process.env.DESIGN_KIT_LOCAL_TEMPLATES
  return root && root.length > 0 ? root : undefined
}

export function isRemoteUrl(base: string): boolean {
  return base.startsWith('http://') || base.startsWith('https://')
}

export function cdnBaseFor(templateDirName: string): string {
  return `${CDN_PREFIX}${templateDirName}`
}

export function remoteUrl(base: string, ...segments: string[]): string {
  return [base, ...segments].join('/').replace(/([^:])\/{2,}/g, '$1/')
}

function localShadowPath(url: string): string | null {
  const root = localTemplatesRoot()
  if (!root || !url.startsWith(CDN_PREFIX)) return null
  const localPath = `${root}/${url.slice(CDN_PREFIX.length)}`
  return fs.existsSync(localPath) ? localPath : null
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchTemplateText(url: string, { retries = 2 } = {}): Promise<string | null> {
  const shadow = localShadowPath(url)
  if (shadow) return fs.readFileSync(shadow, 'utf8')

  if (!isRemoteUrl(url)) {
    return fs.existsSync(url) ? fs.readFileSync(url, 'utf8') : null
  }

  for (let attempt = 0; ; attempt++) {
    let response: Response
    try {
      response = await fetch(url)
    } catch (err) {
      if (attempt >= retries) {
        throw new Error(
          `Could not reach ${url} (${err instanceof Error ? err.message : String(err)}). Check your internet connection and try again.`
        )
      }
      await sleep(300 * (attempt + 1))
      continue
    }
    if (response.status === 404) return null
    if (response.ok) return response.text()
    if (attempt >= retries) {
      throw new Error(`Fetching ${url} failed with HTTP ${response.status}. Try again in a moment.`)
    }
    await sleep(300 * (attempt + 1))
  }
}

export async function fetchRequiredTemplateText(url: string): Promise<string> {
  const text = await fetchTemplateText(url)
  if (text === null) {
    throw new Error(
      `Expected template file not found: ${url}\nThis usually means the design-kit templates repo changed shape at ref "${TEMPLATES_REF}", or that ref is unreachable. Try upgrading design-kit, or file an issue.`
    )
  }
  return text
}

export async function fetchTemplateSize(url: string): Promise<number | null> {
  const shadow = localShadowPath(url)
  if (shadow) return fs.statSync(shadow).size

  if (!isRemoteUrl(url)) {
    return fs.existsSync(url) ? fs.statSync(url).size : null
  }
  const response = await fetch(url, { method: 'HEAD' })
  if (!response.ok) return null
  const len = response.headers.get('content-length')
  return len ? Number(len) : null
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (true) {
      const i = next++
      if (i >= items.length) return
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
