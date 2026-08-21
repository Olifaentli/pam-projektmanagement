import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import { LoginPage } from '../LoginPage'
import { AuthProvider } from '../../auth/AuthContext'
import { theme } from '../../theme'

/** Anmeldeseite (US-7): controlled inputs und Fehleranzeige. */

function renderLogin() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

/** Antwort des Backends nachbilden, ohne einen Server zu starten. */
function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(handler(String(input), init)),
  ))
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('LoginPage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('deaktiviert die Schaltfläche, solange ein Feld leer ist', async () => {
    // /api/auth/me schlägt fehl: es besteht noch keine Sitzung.
    mockFetch(() => json({ status: 401, message: 'Anmeldung erforderlich.' }, 401))
    const user = userEvent.setup()
    renderLogin()

    const button = await screen.findByRole('button', { name: /anmelden/i })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('E-Mail'), 'admin@musterfirma.de')
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('Passwort'), 'Passwort123!')
    expect(button).toBeEnabled()
  })

  it('schreibt jede Eingabe in den State zurück (controlled input)', async () => {
    mockFetch(() => json({ status: 401 }, 401))
    const user = userEvent.setup()
    renderLogin()

    const email = await screen.findByLabelText<HTMLInputElement>('E-Mail')
    await user.type(email, 'test@example.de')

    expect(email.value).toBe('test@example.de')
  })

  it('zeigt die Fehlermeldung des Servers bei falschen Zugangsdaten', async () => {
    mockFetch((url) => {
      if (url.includes('/api/auth/me')) return json({ status: 401 }, 401)
      if (url.includes('/api/auth/csrf')) return new Response(null, { status: 204 })
      return json(
        { status: 401, message: 'E-Mail oder Passwort ist falsch.', fieldErrors: [] },
        401,
      )
    })
    const user = userEvent.setup()
    renderLogin()

    await user.type(await screen.findByLabelText('E-Mail'), 'admin@musterfirma.de')
    await user.type(screen.getByLabelText('Passwort'), 'falsch')
    await user.click(screen.getByRole('button', { name: /anmelden/i }))

    await waitFor(() =>
      expect(screen.getByText('E-Mail oder Passwort ist falsch.')).toBeInTheDocument(),
    )
  })

  it('meldet einen nicht erreichbaren Server verständlich', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('/api/auth/me')) {
        return Promise.resolve(json({ status: 401 }, 401))
      }
      return Promise.reject(new TypeError('Failed to fetch'))
    }))
    const user = userEvent.setup()
    renderLogin()

    await user.type(await screen.findByLabelText('E-Mail'), 'admin@musterfirma.de')
    await user.type(screen.getByLabelText('Passwort'), 'Passwort123!')
    await user.click(screen.getByRole('button', { name: /anmelden/i }))

    await waitFor(() =>
      expect(screen.getByText('Der Server ist nicht erreichbar.')).toBeInTheDocument(),
    )
  })
})
