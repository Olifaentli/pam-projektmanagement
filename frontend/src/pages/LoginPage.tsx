import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/**
 * Anmeldung (US-7).
 *
 * Beide Eingabefelder sind controlled inputs (Lektion 5.1): Der Wert kommt aus
 * dem React-State und wird bei jeder Eingabe zurueckgeschrieben. Damit ist der
 * State die einzige Quelle der Wahrheit fuer den Formularzustand.
 */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, user, initialising } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!initialising && user) {
    const target = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={target} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const success = await login(email, password)
    if (success) {
      const target = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(target, { replace: true })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h1" gutterBottom>
          Anmeldung
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Projekt- und Aufgabenmanagement der Musterfirma IT GmbH
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { 'aria-label': 'E-Mail' } }}
            />
            <TextField
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'Passwort' } }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              // Aus dem State abgeleitet: solange ein Feld leer ist oder eine
              // Anfrage laeuft, ist ein Absenden nicht sinnvoll.
              disabled={loading || email.trim() === '' || password === ''}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {loading ? 'Anmeldung läuft …' : 'Anmelden'}
            </Button>
          </Stack>
        </form>

        <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" component="div">
              <strong>Testkonten</strong> (Passwort jeweils <code>Passwort123!</code>)
              <br />
              admin@musterfirma.de — Administration
              <br />
              leitung@musterfirma.de — Projektleitung
              <br />
              dev1@musterfirma.de — Mitarbeitende:r
            </Typography>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  )
}
