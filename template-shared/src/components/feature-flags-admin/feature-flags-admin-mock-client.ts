import type { FeatureFlagCell } from '@/components/feature-flags-admin/types'

export const FEATURE_FLAGS_ADMIN_MOCK_ENDPOINT = 'mock://feature-flags-admin'

const FEATURES = ['account_settings', 'user_management', 'user_invites', 'delivery_logging', 'audit_trail', 'chat']
const ROLES = ['admin', 'manager', 'member']

// Mirrors SaasKit::FeatureFlags::ROLE_FLOORS — features absent here have
// no floor (every role is a real option); the rest match the same
// hardcoded Pundit policies the real backend enforces regardless of this
// matrix (e.g. AuditTrailPolicy#index? is admin-only, full stop).
const ROLE_FLOORS: Record<string, string[]> = {
  user_management: ['admin', 'manager'],
  user_invites: ['admin', 'manager'],
  delivery_logging: ['admin'],
  audit_trail: ['admin'],
}

function eligible(feature: string, role: string): boolean {
  const floor = ROLE_FLOORS[feature]
  return !floor || floor.includes(role)
}

let cells: FeatureFlagCell[] = FEATURES.flatMap((feature) =>
  ROLES.map((role) => ({ feature, role, enabled: false, eligible: eligible(feature, role) }))
)

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function featureFlagsAdminMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await delay()
  const name = opName(query)

  switch (name) {
    case 'FeatureFlags':
      return { featureFlags: { features: FEATURES, roles: ROLES, cells } } as T

    case 'UpdateFeatureFlag': {
      const input = (variables.input ?? {}) as { feature: string; role: string; enabled: boolean }
      cells = cells.map((c) =>
        c.feature === input.feature && c.role === input.role ? { ...c, enabled: input.enabled } : c
      )
      return { updateFeatureFlag: input } as T
    }

    default:
      throw new Error(`Unknown feature-flags-admin operation: ${name || '(unnamed)'}`)
  }
}
