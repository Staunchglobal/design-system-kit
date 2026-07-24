import { execSync } from 'node:child_process'
import { defineConfig } from 'tsup'

/**
 * The built CLI fetches component templates from this exact commit on GitHub (via
 * jsdelivr — see src/lib/remote.ts) rather than bundling them, so every install done
 * with a given CLI build fetches the exact same bytes forever. That guarantee is
 * worthless if the pinned commit was never pushed: refuse to build from an
 * unpublished HEAD rather than ship a CLI whose template fetches would 404 for
 * every single user.
 */
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
