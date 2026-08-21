import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { AuthProvider } from '../../auth/AuthContext'
import type { RoleName } from '../../api/types'

/**
 * Zugriffsschutz der Oberflaeche (US-8).
 *
 * Wichtig fuer die Bewertung: Dieser Schutz ist reine Bedienkomfort-Logik.
 * Die verbindliche Pruefung findet im Backend statt und ist dort durch
 * ProjectVisibilityIT abgedeckt.
 */
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function renderAt(path: string, roles?: RoleName[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Anmeldeseite</div>} />
          <Route path="/" element={<div>Übersicht</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={roles}>
                <div>Geschützter Bereich</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('leitet ohne Anmeldung auf die Anmeldeseite um', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(json({ status: 401 }, 401))))

    renderAt('/admin')

    await waitFor(() => expect(screen.getByText('Anmeldeseite')).toBeInTheDocument())
  })

  it('lässt angemeldete Nutzende mit passender Rolle durch', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(json({
        id: 1, tenantId: 1, email: 'admin@musterfirma.de',
        fullName: 'Alina Adam', roles: ['ADMIN'],
      })),
    ))

    renderAt('/admin', ['ADMIN'])

    await waitFor(() => expect(screen.getByText('Geschützter Bereich')).toBeInTheDocument())
  })

  it('schickt angemeldete Nutzende ohne die geforderte Rolle zur Übersicht', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(json({
        id: 3, tenantId: 1, email: 'dev1@musterfirma.de',
        fullName: 'Tomas Berger', roles: ['EMPLOYEE'],
      })),
    ))

    renderAt('/admin', ['ADMIN'])

    await waitFor(() => expect(screen.getByText('Übersicht')).toBeInTheDocument())
    expect(screen.queryByText('Geschützter Bereich')).not.toBeInTheDocument()
  })
})
