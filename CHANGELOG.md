# Changelog

Versioned with [Changesets](https://github.com/changesets/changesets) — every user-facing change
should ship with a changeset (`npm run changeset`), and this file is regenerated from those on
release (`npm run version`). See `.changeset/README.md` for the day-to-day workflow.

This project follows [Semantic Versioning](https://semver.org/). Since `init` copies real source
files into a consumer's repo rather than shipping a versioned library from `node_modules`, "breaking
change" here means: a CLI flag is removed/renamed, a generated file's shape changes in a way that
breaks a previous `init`'s output, or a component's public props/exports change incompatibly —
not every change to `template-*/`, most of which are template-only fixes/additions (patch/minor).

## 0.1.0

Initial baseline:

- `design-kit init` scaffolds a full shadcn/ui component set, a token-driven Tailwind v4 theme
  system, a `/design-system` showcase, and a live `/theme-editor` into a Next.js (App Router) or
  Vite + React project.
- Atomic per-component selection — an interactive searchable picker, `--components`, or `--all`;
  only the npm packages, `.tsx` files, and CSS a selection actually needs get installed.
- `design-kit remove <components>` uninstalls previously-installed components (dependency-aware —
  won't remove something another kept component still needs) and regenerates the design-system
  page/theme editor/manifest.
- `design-kit update` re-syncs installed files to the current CLI version's templates, skipping
  anything customized since install (content-hash tracked; `--force` overrides).
- `--dry-run` on `init`/`remove`/`update` previews every change without writing anything.
- TypeScript 5/6/7 compatibility checking against tsconfig.json, with safe auto-fix for the
  `"types"` array default change.
- AST-based config patching (ts-morph for TS/TSX, postcss for CSS, jsonc-parser for tsconfig)
  instead of regex/text-splice, so `vite.config.ts`/`layout.tsx`/globals CSS patch correctly
  even when customized, not just against the unmodified scaffold output.
- Vite gets the same default Geist Sans/Mono font as Next.js, self-hosted via `@fontsource/*`.
- Monorepo-aware package manager detection and error guidance.
