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
        p: 2,
        // Verlauf in den Markenfarben statt einer leeren Flaeche. Die
        // Anmeldeseite ist der erste Eindruck der Anwendung.
        background:
          'radial-gradient(1100px 560px at 15% 10%, #3B5C7C 0%, transparent 55%),' +
          'radial-gradient(900px 500px at 85% 90%, #157F73 0%, transparent 50%),' +
          'linear-gradient(140deg, #1E3247 0%, #2E4A66 60%, #27526B 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          boxShadow: '0 24px 60px rgba(4, 20, 38, .35)',
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 5,
            borderRadius: 999,
            mb: 2.5,
            background: 'linear-gradient(90deg, #2E4A66 0%, #157F73 100%)',
          }}
        />
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
              size="medium"
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
              size="medium"
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
