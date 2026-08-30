import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../auth/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
import { STATUS_ACCENT } from '../theme'
import type { Progress, Project, ProjectStatusName } from '../api/types'

/** Ordnet einen Fortschritt der Ampelstufe zu, deren Akzentfarbe er traegt. */
function progressStatus(p: Progress): 'OPEN' | 'IN_PROGRESS' | 'DONE' {
  if (p.total === 0 || p.percentDone === 0) return 'OPEN'
  if (p.percentDone >= 100) return 'DONE'
  return 'IN_PROGRESS'
}

/** Projektübersicht mit Filter und Anlage-Dialog (US-2, US-6, US-8). */
export function ProjectListPage() {
  const [filter, setFilter] = useState<ProjectStatusName | 'ALL'>('ACTIVE')
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const canManage = hasRole('ADMIN', 'PROJECT_MANAGER')

  const { data, loading, error, reload } = useAsyncData<Project[]>(
    () => projectApi.list(filter === 'ALL' ? undefined : filter),
    [filter],
  )

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h1">Projekte</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Projekt anlegen
          </Button>
        )}
      </Stack>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filter}
        onChange={(_, value) => value && setFilter(value)}
        sx={{ mb: 3 }}
        aria-label="Projektfilter"
      >
        <ToggleButton value="ACTIVE">Aktiv</ToggleButton>
        <ToggleButton value="ARCHIVED">Archiviert</ToggleButton>
        <ToggleButton value="ALL">Alle</ToggleButton>
      </ToggleButtonGroup>

      {loading && <Skeleton variant="rounded" height={220} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (data?.length ?? 0) === 0 && (
        <Alert severity="info">Zu diesem Filter gibt es keine Projekte.</Alert>
      )}

      <Grid container spacing={2}>
        {(data ?? []).map((project) => (
          <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                sx={{ height: '100%', alignItems: 'stretch' }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent>
                  {/* Der Prozentwert steht rechts oben: in einer Liste ist er
                      der schnellste Anker beim Überfliegen. */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}
                  >
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        color: STATUS_ACCENT[progressStatus(project.progress)],
                        flexShrink: 0,
                      }}
                    >
                      {project.progress.percentDone} %
                    </Typography>
                  </Stack>
                  {project.status === 'ARCHIVED' && (
                    <Chip size="small" label="Archiviert" variant="outlined" sx={{ mb: 1 }} />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description ?? 'Keine Beschreibung hinterlegt.'}
                  </Typography>
                  <ProgressBar progress={project.progress} />
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mt: 1, fontSize: 12, color: '#8A94A2' }}
                  >
                    <span>
                      {project.progress.done}/{project.progress.total} Aufgaben
                    </span>
                    <span>{project.memberCount} Mitarbeitende</span>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          setDialogOpen(false)
          void reload()
        }}
      />
    </Box>
  )
}

/** Anlagedialog. Alle Felder sind controlled inputs. */
function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await projectApi.create({
        name,
        description: description || undefined,
        startDate: startDate || null,
        endDate: endDate || null,
      })
      reset()
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
      <form onSubmit={handleSubmit}>
        <DialogTitle>Neues Projekt</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && !(error instanceof ApiError && error.fieldErrors.length > 0) && (
              <Alert severity="error">{error.message}</Alert>
            )}
            <TextField
              label="Projektname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldError('name'))}
              helperText={fieldError('name')}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(fieldError('description'))}
              helperText={fieldError('description')}
              multiline
              rows={3}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Startdatum"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Enddatum"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button type="submit" variant="contained" disabled={saving || name.trim() === ''}>
            {saving ? 'Wird angelegt …' : 'Anlegen'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
