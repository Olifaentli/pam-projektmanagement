import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { RoleName } from '../api/types'

/** Zeigt seinen Inhalt nur, wenn der Benutzer eine der Rollen besitzt. */
export function RoleGate({ roles, children }: { roles: RoleName[]; children: ReactNode }) {
  const { hasRole } = useAuth()
  return hasRole(...roles) ? <>{children}</> : null
}
