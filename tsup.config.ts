import { execSync } from 'node:child_process'
import { defineConfig } from 'tsup'

function resolveTemplatesRef(): string {
  const sha = execSync('git rev-parse HEAD').toString().trim()
  const onRemote = execSync(`git branch -r --contains ${sha}`).toString().trim()
  if (!onRemote) {
    throw new Error(
      `Refusing to build: HEAD (${sha}) hasn't been pushed to any remote branch yet.\n` +
        'The published CLI fetches templates from this exact commit on GitHub — building now ' +
        'would ship a CLI whose template fetches 404 for every user. Push this commit, then build.'
    )
  }
  return sha
}

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    __TEMPLATES_REF__: JSON.stringify(resolveTemplatesRef()),
  },
})
