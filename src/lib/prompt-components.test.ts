import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { detectInstalledComponents } from './prompt-components.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-components-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('detectInstalledComponents', () => {
  it('detects components in the standard src layout', () => {
    const uiDir = path.join(tmpDir, 'src/components/ui')
    fs.mkdirSync(uiDir, { recursive: true })
    fs.writeFileSync(path.join(uiDir, 'button.tsx'), '')

    expect(detectInstalledComponents(tmpDir)).toContain('button')
  })

  it('detects components in a root-level Next.js layout', () => {
    const uiDir = path.join(tmpDir, 'components/ui')
    fs.mkdirSync(uiDir, { recursive: true })
    fs.writeFileSync(path.join(uiDir, 'dialog.tsx'), '')

    expect(detectInstalledComponents(tmpDir, '')).toContain('dialog')
  })
})
