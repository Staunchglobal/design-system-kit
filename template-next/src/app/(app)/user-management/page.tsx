import { redirect } from 'next/navigation'

// Tabs are separate routes now (/user-management/all|active|archived|pending)
// — this bare path only exists so an old link/bookmark still lands somewhere.
export default function UserManagementIndexPage() {
  redirect('/user-management/all')
}
