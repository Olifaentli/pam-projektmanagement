import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { userApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../auth/AuthContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ROLE_LABELS } from '../api/types'
import type { AppUser, RoleName } from '../api/types'

const ALL_ROLES: RoleName[] = ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE']

/** Benutzerkonten und Rollen verwalten (US-1). Nur für die Rolle ADMIN erreichbar. */
export function UserAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<AppUser | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()
  const { data, loading, error, reload } = useAsyncData<AppUser[]>(() => userApi.list(), [])

  const changeRole = async (user: AppUser, role: RoleName) => {
    setActionError(null)
    try {
      await userApi.updateRoles(user.id, [role])
      void reload()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Die Rolle konnte nicht geändert werden.')
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await userApi.remove(toDelete.id)
      void reload()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Das Konto konnte nicht gelöscht werden.')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h1">Benutzerverwaltung</Typography>
          <Typography variant="body2" color="text.secondary">
            Konten anlegen und Rollen vergeben.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Benutzer anlegen
        </Button>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      {loading && <Skeleton variant="rounded" height={280} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aktion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data ?? []).map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.fullName}
                      {isSelf && <Chip size="small" label="Sie" sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={user.roles[0] ?? 'EMPLOYEE'}
                        onChange={(e) => changeRole(user, e.target.value as RoleName)}
                        inputProps={{ 'aria-label': `Rolle von ${user.fullName}` }}
                        sx={{ minWidth: 180 }}
                      >
                        {ALL_ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.enabled ? 'Aktiv' : 'Deaktiviert'}
                        color={user.enabled ? 'success' : 'default'}
                        variant={user.enabled ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label={`Konto ${user.fullName} löschen`}
                        disabled={isSelf}
                        onClick={() => setToDelete(user)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          setDialogOpen(false)
          void reload()
        }}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title="Benutzerkonto löschen"
        message={`Soll das Konto von ${toDelete?.fullName} gelöscht werden? Projektzuordnungen werden mit entfernt.`}
        confirmLabel="Löschen"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  )
}

function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<RoleName>('EMPLOYEE')
  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await userApi.create({ email, password, firstName, lastName, roles: [role] })
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setRole('EMPLOYEE')
      onCreated()
    } catch (e) {
      setError(e as Error)
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (field: string) =>
    error instanceof ApiError ? error.fieldMessage(field) : undefined

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>Neues Benutzerkonto</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && !(error instanceof ApiError && error.fieldErrors.length > 0) && (
              <Alert severity="error">{error.message}</Alert>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={Boolean(fieldError('firstName'))}
                helperText={fieldError('firstName')}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={Boolean(fieldError('lastName'))}
                helperText={fieldError('lastName')}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fieldError('email'))}
              helperText={fieldError('email')}
              required
              fullWidth
            />
            <TextField
              label="Initialpasswort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fieldError('password'))}
              helperText={fieldError('password') ?? 'Mindestens 8 Zeichen'}
              required
              fullWidth
            />
            <TextField
              select
              label="Rolle"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleName)}
              fullWidth
            >
              {ALL_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || email.trim() === '' || password.length < 8}
          >
            {saving ? 'Wird angelegt …' : 'Anlegen'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
