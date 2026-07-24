import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkTypeScriptCompat } from './check-typescript-compat.js'
import type { TypeScriptVersionInfo } from './detect.js'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'design-kit-ts-compat-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

function writeTsconfig(content: string): string {
  const p = path.join(dir, 'tsconfig.json')
  fs.writeFileSync(p, content)
  return p
}

function ts(major: number, installed = true): TypeScriptVersionInfo {
  return { major, raw: `${major}.0.0`, installed }
}

describe('checkTypeScriptCompat', () => {
  it('returns no issues for a modern tsconfig on TypeScript 5', () => {
    const p = writeTsconfig(
      JSON.stringify({
        compilerOptions: {
          target: 'es2017',
          module: 'esnext',
          moduleResolution: 'bundler',
          types: ['node'],
          noEmit: true,
        },
      })
    )
    const result = checkTypeScriptCompat(p, ts(5), { '@types/node': '^20' })
    expect(result.issues).toEqual([])
  })

  it('flags target: es5 as "future" (not yet broken) on TypeScript 5', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { target: 'es5', types: [] } }))
    const result = checkTypeScriptCompat(p, ts(5), {})
    const issue = result.issues.find((i) => i.message.includes('target: "es5"'))
    expect(issue?.severity).toBe('future')
  })

  it('flags target: es5 as "broken" on TypeScript 7', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { target: 'es5', types: [] } }))
    const result = checkTypeScriptCompat(p, ts(7), {})
    const issue = result.issues.find((i) => i.message.includes('target: "es5"'))
    expect(issue?.severity).toBe('broken')
  })

  it('flags moduleResolution: "node" but not a plain "nodenext"', () => {
    const nodeCfg = writeTsconfig(JSON.stringify({ compilerOptions: { moduleResolution: 'node', types: [] } }))
    const nodeResult = checkTypeScriptCompat(nodeCfg, ts(7), {})
    expect(nodeResult.issues.some((i) => i.message.includes('moduleResolution'))).toBe(true)

    const nextCfg = writeTsconfig(JSON.stringify({ compilerOptions: { moduleResolution: 'nodenext', types: [] } }))
    const nextResult = checkTypeScriptCompat(nextCfg, ts(7), {})
    expect(nextResult.issues.some((i) => i.message.includes('moduleResolution'))).toBe(false)
  })

  it('auto-fixes a missing "types" array on TypeScript 7 using installed @types/* packages', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { target: 'es2020' } }, null, 2))
    const result = checkTypeScriptCompat(p, ts(7), { '@types/node': '^20', '@types/react': '^19' })
    expect(result.autoFixed.length).toBe(1)
    const written = fs.readFileSync(p, 'utf8')
    expect(written).toContain('"types": ["node", "react"]')
    expect(result.issues.some((i) => i.message.includes('No explicit "types"'))).toBe(false)
  })

  it('does not touch the file when autoFix is disabled, and reports the issue instead', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { target: 'es2020' } }))
    const before = fs.readFileSync(p, 'utf8')
    const result = checkTypeScriptCompat(p, ts(7), { '@types/node': '^20' }, { autoFix: false })
    expect(fs.readFileSync(p, 'utf8')).toBe(before)
    expect(result.issues.some((i) => i.message.includes('No explicit "types"'))).toBe(true)
  })

  it('never flags a missing "types" array when one is already present, even if empty', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { types: [] } }))
    const result = checkTypeScriptCompat(p, ts(7), { '@types/node': '^20' })
    expect(result.issues.some((i) => i.message.includes('types'))).toBe(false)
    expect(result.autoFixed.length).toBe(0)
  })

  it('treats noEmit: true as making a missing rootDir a non-issue', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { noEmit: true, types: [] } }))
    const result = checkTypeScriptCompat(p, ts(7), {})
    expect(result.issues.some((i) => i.message.includes('rootDir'))).toBe(false)
  })

  it('returns an empty result when tsconfig.json does not exist, without throwing', () => {
    const result = checkTypeScriptCompat(path.join(dir, 'nope.json'), ts(7), {})
    expect(result.issues).toEqual([])
    expect(result.autoFixed).toEqual([])
  })

  it('passes tsMajor through untouched, even when null (version undetermined)', () => {
    const p = writeTsconfig(JSON.stringify({ compilerOptions: { types: [] } }))
    const result = checkTypeScriptCompat(p, null, {})
    expect(result.tsMajor).toBeNull()
  })
})
