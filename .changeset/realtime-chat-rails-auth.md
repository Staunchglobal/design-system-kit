---
"staunch-shadcn-design-system-kit": minor
---

Add realtime chat and account-settings templates, and align auth with the Rails GraphQL OTP flows.

- New opt-in `chat` inbox (Next + Vite): conversations, archive, search, attachments (images/PDF/DOC), GraphQL uploads, and ActionCable subscriptions (mock-first).
- New opt-in `account-settings` email-change wizard.
- Auth reworked for mandatory OTP login/signup, link-based password reset, and shared form primitives; smoke fixes for Vite typing and Next `set-state-in-effect` lint.
