import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArchiveIcon from '@mui/icons-material/Archive'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupIcon from '@mui/icons-material/Group'
import { useNavigate, useParams } from 'react-router-dom'
import { directoryApi, projectApi, taskApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../auth/AuthContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusDot } from '../components/StatusIndicator'
import { STATUS_ACCENT, STATUS_COLORS } from '../theme'
import { TASK_STATUSES } from '../api/types'
import type { Member, Progress, Project, Task, TaskStatusName } from '../api/types'

/** Ordnet einen Fortschritt der Ampelstufe zu, deren Farbe er traegt. */
function progressStatus(p: Progress): 'OPEN' | 'IN_PROGRESS' | 'DONE' {
  if (p.total === 0 || p.percentDone === 0) return 'OPEN'
  if (p.percentDone >= 100) return 'DONE'
  return 'IN_PROGRESS'
}

/**
 * Projektdetail mit Aufgabenboard (US-4, US-5), Fortschritt (US-6) und
 * Mitgliederzuordnung (US-3).
 */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const canManage = hasRole('ADMIN', 'PROJECT_MANAGER')

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const project = useAsyncData<Project>(() => projectApi.get(projectId), [projectId])
  const tasks = useAsyncData<Task[]>(() => taskApi.listByProject(projectId), [projectId])
  const members = useAsyncData<Member[]>(() => projectApi.members(projectId), [projectId])

  const refreshAll = useCallback(() => {
    void project.reload()
    void tasks.reload()
    void members.reload()
  }, [project, tasks, members])

  const changeStatus = async (task: Task, status: TaskStatusName) => {
    setActionError(null)
    try {
      await taskApi.updateStatus(task.id, status)
      // Projekt neu laden, weil sich der Fortschritt mitgeaendert hat.
      void tasks.reload()
      void project.reload()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Der Status konnte nicht geändert werden.')
    }
  }

  const confirmDeleteTask = async () => {
    if (!deleteTask) return
    try {
      await taskApi.remove(deleteTask.id)
      void tasks.reload()
      void project.reload()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Die Aufgabe konnte nicht gelöscht werden.')
    } finally {
      setDeleteTask(null)
    }
  }

  const confirmArchive = async () => {
    try {
      await projectApi.archive(projectId)
      refreshAll()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Das Projekt konnte nicht archiviert werden.')
    } finally {
      setArchiveOpen(false)
    }
  }

  if (project.loading) return <Skeleton variant="rounded" height={400} />
  if (project.error) return <Alert severity="error">{project.error}</Alert>
  if (!project.data) return null

  const p = project.data
  const archived = p.status === 'ARCHIVED'

  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: '#8496A9', mb: 0.5 }}>
        Projekte / {p.name}
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              aria-label="Zurück zur Projektliste"
              onClick={() => navigate('/projects')}
              sx={{ ml: -0.5 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h1">{p.name}</Typography>
            {archived && <Chip label="Archiviert" variant="outlined" />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {p.description ?? 'Keine Beschreibung hinterlegt.'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          {canManage && !archived && (
            <>
              <Button startIcon={<GroupIcon />} onClick={() => setMemberDialogOpen(true)}>
                Mitarbeitende
              </Button>
              <Button startIcon={<ArchiveIcon />} color="secondary" onClick={() => setArchiveOpen(true)}>
                Archivieren
              </Button>
            </>
          )}
          {!archived && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTaskDialogOpen(true)}>
              Aufgabe anlegen
            </Button>
          )}
        </Stack>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      {archived && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dieses Projekt ist archiviert. Inhalte sind lesbar, aber nicht mehr änderbar.
        </Alert>
      )}

      {/* Fortschritt und Team in einer Karte: beides beschreibt denselben
          Gegenstand und wurde vorher unnoetig auf zwei Flaechen verteilt. */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fortschritt
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 22,
                    fontWeight: 700,
                    color: STATUS_ACCENT[progressStatus(p.progress)],
                  }}
                >
                  {p.progress.percentDone} %
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={p.progress.percentDone}
                sx={{
                  height: 8,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: STATUS_COLORS[progressStatus(p.progress)].main,
                  },
                }}
                aria-label={`Fortschritt ${p.progress.percentDone} Prozent, ${p.progress.done} von ${p.progress.total} Aufgaben erledigt`}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                {p.progress.done} von {p.progress.total} Aufgaben erledigt
              </Typography>
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Team ({members.data?.length ?? 0})
              </Typography>
              {(members.data ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Noch niemand zugeordnet.
                </Typography>
              ) : (
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {(members.data ?? []).map((m) => (
                    // Initialen sparen Platz; der volle Name bleibt als
                    // Tooltip und als title-Attribut erreichbar.
                    <Tooltip key={m.userId} title={m.fullName}>
                      <Box
                        title={m.fullName}
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '9px',
                          bgcolor: '#EAEFF5',
                          color: '#3E5872',
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {m.fullName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </Box>
                    </Tooltip>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h2" gutterBottom>
        Aufgaben
      </Typography>
      {tasks.loading && <Skeleton variant="rounded" height={220} />}
      {tasks.error && <Alert severity="error">{tasks.error}</Alert>}

      {/* Drei Spalten, eine je Status. Der Statuswechsel erfolgt ueber das
          Auswahlfeld auf der Karte - bewusst ohne Drag & Drop, das per Tastatur
          schwer bedienbar waere. */}
      <Grid container spacing={2}>
        {TASK_STATUSES.map((column) => {
          const columnTasks = (tasks.data ?? []).filter((t) => t.status === column.value)
          return (
            <Grid key={column.value} size={{ xs: 12, md: 4 }}>
              {/* Die Spaltenflaeche traegt die Statusfarbe. Ein zusaetzlicher
                  Rahmen waere doppelte Kodierung und macht das Board unruhig. */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  border: 'none',
                  bgcolor: STATUS_COLORS[column.value].soft,
                }}
              >
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <StatusDot status={column.value} size={11} />
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 700, color: STATUS_COLORS[column.value].text }}
                    >
                      {column.label}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: STATUS_ACCENT[column.value],
                    }}
                  >
                    {columnTasks.length}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {columnTasks.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Keine Aufgaben.
                    </Typography>
                  )}
                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      sx={{
                        bgcolor: '#fff',
                        borderRadius: '11px',
                        border: `1px solid ${STATUS_COLORS[column.value].line}`,
                      }}
                    >
                      <CardContent sx={{ pb: 1.5 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              ...(task.status === 'DONE' && {
                                color: '#5E6D7E',
                                textDecoration: 'line-through',
                                textDecorationColor: '#C3CCD6',
                              }),
                            }}
                          >
                            {task.title}
                          </Typography>
                          {!archived && (
                            <IconButton
                              size="small"
                              aria-label={`Aufgabe ${task.title} löschen`}
                              onClick={() => setDeleteTask(task)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}
                        >
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {task.assigneeName ?? 'Nicht zugewiesen'}
                          </Typography>
                          {task.dueDate && (
                            <Box
                              sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#8A5A1C',
                                bgcolor: '#F5E8D6',
                                borderRadius: '6px',
                                px: 0.75,
                                py: 0.25,
                                flexShrink: 0,
                              }}
                            >
                              {new Date(task.dueDate).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </Box>
                          )}
                        </Stack>
                        <Select
                          size="small"
                          fullWidth
                          sx={{ mt: 1.5 }}
                          value={task.status}
                          disabled={archived}
                          onChange={(e) => changeStatus(task, e.target.value as TaskStatusName)}
                          inputProps={{ 'aria-label': `Status von ${task.title}` }}
                        >
                          {TASK_STATUSES.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                                <StatusDot status={s.value} size={9} />
                                <span>{s.label}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <TaskDialog
        open={taskDialogOpen}
        projectId={projectId}
        members={members.data ?? []}
        onClose={() => setTaskDialogOpen(false)}
        onCreated={() => {
          setTaskDialogOpen(false)
          void tasks.reload()
          void project.reload()
        }}
      />
      <MemberDialog
        open={memberDialogOpen}
        projectId={projectId}
        current={members.data ?? []}
        onClose={() => setMemberDialogOpen(false)}
        onSaved={() => {
          setMemberDialogOpen(false)
          void members.reload()
          void project.reload()
        }}
      />
      <ConfirmDialog
        open={archiveOpen}
        title="Projekt archivieren"
        message={`Soll "${p.name}" archiviert werden? Das Projekt bleibt lesbar, kann aber nicht mehr bearbeitet werden.`}
        confirmLabel="Archivieren"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveOpen(false)}
      />
      <ConfirmDialog
        open={deleteTask !== null}
        title="Aufgabe löschen"
        message={`Soll die Aufgabe "${deleteTask?.title}" endgültig gelöscht werden?`}
        confirmLabel="Löschen"
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTask(null)}
      />
    </Box>
  )
}

function TaskDialog({
  open,
  projectId,
  members,
  onClose,
  onCreated,
}: {
  open: boolean
  projectId: number
  members: Member[]
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await taskApi.create(projectId, {
        title,
        description: description || undefined,
        assigneeId: assigneeId === '' ? null : Number(assigneeId),
        dueDate: dueDate || null,
      })
      setTitle('')
      setDescription('')
      setAssigneeId('')
      setDueDate('')
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
        <DialogTitle>Neue Aufgabe</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && !(error instanceof ApiError && error.fieldErrors.length > 0) && (
              <Alert severity="error">{error.message}</Alert>
            )}
            <TextField
              label="Titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={Boolean(fieldError('title'))}
              helperText={fieldError('title')}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Zuständig"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Nicht zugewiesen</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.userId} value={String(m.userId)}>
                  {m.fullName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fällig am"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button type="submit" variant="contained" disabled={saving || title.trim() === ''}>
            {saving ? 'Wird angelegt …' : 'Anlegen'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

/** Zuordnung von Mitarbeitenden zu einem Projekt (US-3). */
function MemberDialog({
  open,
  projectId,
  current,
  onClose,
  onSaved,
}: {
  open: boolean
  projectId: number
  current: Member[]
  onClose: () => void
  onSaved: () => void
}) {
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const users = useAsyncData<Member[]>(() => (open ? directoryApi.list() : Promise.resolve([])), [open])

  // Auswahl beim Öffnen mit dem aktuellen Stand vorbelegen.
  const [initialised, setInitialised] = useState(false)
  if (open && !initialised) {
    setSelected(current.map((m) => m.userId))
    setInitialised(true)
  }
  if (!open && initialised) {
    setInitialised(false)
  }

  const toggle = (userId: number) =>
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await projectApi.updateMembers(projectId, selected)
      onSaved()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Die Zuordnung konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Mitarbeitende zuordnen</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {users.loading && <Skeleton height={180} />}
        {users.error && <Alert severity="warning">{users.error}</Alert>}
        <List dense>
          {(users.data ?? []).map((user) => (
            <ListItem key={user.userId} disablePadding>
              <ListItemButton onClick={() => toggle(user.userId)} dense>
                <Checkbox
                  edge="start"
                  checked={selected.includes(user.userId)}
                  tabIndex={-1}
                  disableRipple
                  slotProps={{ input: { 'aria-label': `${user.fullName} zuordnen` } }}
                />
                <ListItemText primary={user.fullName} secondary={user.email} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {selected.length} ausgewählt
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={save} disabled={saving}>
          {saving ? 'Wird gespeichert …' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
