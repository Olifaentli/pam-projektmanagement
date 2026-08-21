import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { RoleName } from '../api/types'

/**
 * Schuetzt eine Route vor nicht angemeldeten oder nicht berechtigten Nutzenden.
 *
 * Das ist eine reine Komfortmassnahme fuer die Oberflaeche: Die eigentliche
 * Absicherung liegt im Backend. Wer die Route direkt aufruft, bekommt vom
 * Server ohnehin 401 oder 403.
 */
export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: RoleName[]
}) {
  const { user, initialising, hasRole } = useAuth()
  const location = useLocation()

  if (initialising) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress aria-label="Anmeldestatus wird geprüft" />
      </Box>
    )
  }

  if (!user) {
    // Ziel merken, damit nach der Anmeldung dorthin zurückgesprungen wird.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
