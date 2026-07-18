import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { patchGlobalsCss } from './patch-globals-css.js'

const template = `@import 'tailwindcss';
@import './styles/theme/index.css';
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
}

:root {
  --background: white;
}
`

let tmpDir: string
let cssPath: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-globals-css-test-'))
  cssPath = path.join(tmpDir, 'app/globals.css')
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('patchGlobalsCss', () => {
  it('creates a missing CSS file and parent directory', () => {
    expect(patchGlobalsCss(cssPath, template)).toEqual({ action: 'created' })
    expect(fs.readFileSync(cssPath, 'utf8')).toBe(template)
  })

  it('adds missing imports and theme registration without discarding consumer CSS', () => {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true })
    fs.writeFileSync(cssPath, 'body { color: rebeccapurple; }\n')

    const result = patchGlobalsCss(cssPath, template)
    const output = fs.readFileSync(cssPath, 'utf8')

    expect(result.action).toBe('patched')
    expect(output).toContain("@import './styles/theme/index.css'")
    expect(output).toContain('@theme inline')
    expect(output).toContain('body { color: rebeccapurple; }')
  })

  it('refuses to merge into an existing custom theme block', () => {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true })
    fs.writeFileSync(cssPath, '@theme { --color-brand: red; }\n')

    expect(patchGlobalsCss(cssPath, template).action).toBe('needs-manual-merge')
    expect(fs.readFileSync(cssPath, 'utf8')).toContain('--color-brand: red')
  })

  it('surfaces malformed CSS for the CLI boundary to handle', () => {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true })
    fs.writeFileSync(cssPath, 'a {')
    expect(() => patchGlobalsCss(cssPath, template)).toThrow()
  })
})
