---
"staunch-shadcn-design-system-kit": minor
---

Feature-flags admin matrix cells now carry an `eligible` flag, and the CLI's post-install guidance covers `notification-center` for the first time.

- A role/feature combination whose own backend policy hard-denies it regardless of the flag (e.g. Audit Trail is admin-only, full stop) now renders as a disabled dash instead of a checkbox that could never take effect.
- `init-next`/`init-vite` now print setup guidance for `notification-center` (previously undocumented), including the `message_received` notification type the Rails gem's `SendMessage` mutation raises automatically once `chat` is also installed.
