import { redirect } from 'next/navigation'

const VALID_TABS = new Set(['all', 'active', 'archived', 'pending'])

/** Old path-based tab URLs → query-param URL (avoids remounting the screen). */
export default async function UserManagementTabRedirect({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params
  const normalized = VALID_TABS.has(tab) ? tab : 'all'
  redirect(normalized === 'all' ? '/user-management' : `/user-management?tab=${normalized}`)
}
