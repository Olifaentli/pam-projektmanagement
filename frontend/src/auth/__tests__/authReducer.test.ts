import { describe, expect, it } from 'vitest'
import { authReducer } from '../AuthContext'

/**
 * Der Reducer der Anmeldung.
 *
 * Er ist eine reine Funktion und laesst sich deshalb ohne Rendering pruefen -
 * genau das ist der Vorteil, den useReducer gegenueber mehreren useState-
 * Variablen bietet (Lektion 5.2).
 */
const user = {
  id: 1,
  tenantId: 1,
  email: 'admin@musterfirma.de',
  fullName: 'Alina Adam',
  roles: ['ADMIN'] as const,
}

const initial = { user: null, loading: false, error: null, initialising: true }

describe('authReducer', () => {
  it('setzt beim Anmeldestart den Ladezustand und löscht alte Fehler', () => {
    const state = authReducer({ ...initial, error: 'Alter Fehler' }, { type: 'LOGIN_START' })

    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('übernimmt bei Erfolg den Benutzer und beendet den Ladezustand', () => {
    const state = authReducer(initial, { type: 'LOGIN_SUCCESS', user: { ...user, roles: ['ADMIN'] } })

    expect(state.user?.email).toBe('admin@musterfirma.de')
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.initialising).toBe(false)
  })

  it('hält bei einem Fehler keinen Benutzer und keinen Ladezustand', () => {
    const state = authReducer(
      { ...initial, loading: true },
      { type: 'LOGIN_FAILURE', error: 'E-Mail oder Passwort ist falsch.' },
    )

    // Der entscheidende Punkt: "eingeloggt und gleichzeitig fehlerhaft"
    // ist mit diesem Reducer nicht darstellbar.
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBe('E-Mail oder Passwort ist falsch.')
  })

  it('entfernt beim Abmelden den Benutzer vollständig', () => {
    const angemeldet = authReducer(initial, { type: 'LOGIN_SUCCESS', user: { ...user, roles: ['ADMIN'] } })
    const state = authReducer(angemeldet, { type: 'LOGOUT' })

    expect(state.user).toBeNull()
    expect(state.initialising).toBe(false)
  })
})
