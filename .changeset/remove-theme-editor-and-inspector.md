---
"staunch-shadcn-design-system-kit": major
---

Remove the live `/theme-editor` and the element inspector overlay — both were unconditionally installed on every `init` with no opt-out, and the theme editor's own chrome forced `field`/`input-group`/`combobox` into every project regardless of selection, even blocking `design-kit remove` from ever deleting them.

- Deleted: the `/theme-editor` route and its components (Next + Vite), the `/api/theme/save` and `/api/theme/rename-token` routes, `vite-plugin-design-kit.ts` (the Vite dev-server equivalent), `scripts/generate-theme-manifest.mjs` and the generated `theme.manifest.json`, the repo-wide token-rename engine, and the `components/inspector/*` overlay (previously mounted on both `/theme-editor` and `/design-system`).
- **Breaking**: `field`, `input-group`, and `combobox` are ordinary optional components again — they're only installed if you pick them yourself (or another component you picked depends on them), and `design-kit remove` can delete them like any other component now.
- **Breaking**: the "Renaming design tokens" workflow (repo-wide token identifier rename via `/theme-editor`) is gone with no replacement — rename a CSS custom property and its Tailwind `@theme` bridge entry by hand if you need this.
- Consumers who already ran `init` keep whatever theme-editor/inspector files they have on disk (this only changes what a fresh `init`/`update` fetches); `design-kit update` won't delete them either, since `update` never deletes — remove them by hand if you want them gone from an existing project.
