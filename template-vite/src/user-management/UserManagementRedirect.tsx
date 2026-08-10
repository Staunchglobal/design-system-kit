'use client'

import { Navigate } from 'react-router-dom'

// Tabs are separate routes now (/user-management/all|active|archived|pending)
// — this bare path only exists so an old link/bookmark still lands somewhere.
export default function UserManagementRedirect() {
  return <Navigate to="/user-management/all" replace />
}
