import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addPackageJsonScript } from './patch-package-json.js'

let tmpDir: string
let packageJsonPath: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-package-json-test-'))
  packageJsonPath = path.join(tmpDir, 'package.json')
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('addPackageJsonScript', () => {
  it('creates scripts and preserves the rest of package.json', () => {
    fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'consumer', private: true }))

    expect(addPackageJsonScript(packageJsonPath, 'theme:manifest', 'node scripts/theme.mjs')).toBe('added')
    expect(JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))).toEqual({
      name: 'consumer',
      private: true,
      scripts: { 'theme:manifest': 'node scripts/theme.mjs' },
    })
  })

  it('does not overwrite an existing script', () => {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({ scripts: { 'theme:manifest': 'custom command' } })
    )

    expect(addPackageJsonScript(packageJsonPath, 'theme:manifest', 'replacement')).toBe(
      'already-present'
    )
    expect(JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).scripts['theme:manifest']).toBe(
      'custom command'
    )
  })

  it('surfaces malformed consumer JSON for the CLI boundary to handle', () => {
    fs.writeFileSync(packageJsonPath, '{ invalid')
    expect(() => addPackageJsonScript(packageJsonPath, 'theme:manifest', 'command')).toThrow()
  })
})
