import { Alert, Box, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../api/endpoints'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../auth/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
import { STATUS_ACCENT, STATUS_COLORS } from '../theme'
import type { Project } from '../api/types'

/** Einstiegsseite mit Kennzahlen ueber die sichtbaren Projekte. */
export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error } = useAsyncData<Project[]>(() => projectApi.list(), [])

  if (loading) {
    return <Skeleton variant="rounded" height={280} />
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const projects = data ?? []
  const active = projects.filter((p) => p.status === 'ACTIVE')
  const totalTasks = projects.reduce((sum, p) => sum + p.progress.total, 0)
  const doneTasks = projects.reduce((sum, p) => sum + p.progress.done, 0)
  const openTasks = totalTasks - doneTasks

  // Die Kennzahlen greifen dieselben Ampelfarben auf wie die Aufgabenstatus,
  // damit Farbe in der gesamten Anwendung dasselbe bedeutet.
  // Der Randstreifen nimmt die weichere Flaechenfarbe, die Zahl den
  // kraeftigeren Akzent - dieselbe Trennung wie im Fortschrittsbalken.
  const tiles = [
    { label: 'Aktive Projekte', value: active.length, line: '#2E4A66', accent: '#2E4A66' },
    {
      label: 'Archivierte Projekte',
      value: projects.length - active.length,
      line: STATUS_COLORS.OPEN.main,
      accent: STATUS_ACCENT.OPEN,
    },
    {
      label: 'Offene Aufgaben',
      value: openTasks,
      line: STATUS_COLORS.IN_PROGRESS.main,
      accent: STATUS_ACCENT.IN_PROGRESS,
    },
    {
      label: 'Erledigte Aufgaben',
      value: doneTasks,
      line: STATUS_COLORS.DONE.main,
      accent: STATUS_ACCENT.DONE,
    },
  ]

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        Übersicht
      </Typography>
      <Typography variant="h1" gutterBottom>
        Willkommen, {user?.fullName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {active.length} aktive Projekte · {openTasks} offene Aufgaben in Ihrer Verantwortung
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderTop: `3px solid ${tile.line}` }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: tile.accent }}>
                  {tile.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tile.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h2">Aktive Projekte</Typography>
        <Chip
          size="small"
          label={active.length}
          sx={{ bgcolor: '#E7F2F0', color: 'secondary.main', borderRadius: 999 }}
        />
      </Stack>
      {active.length === 0 ? (
        <Alert severity="info">Ihnen ist derzeit kein aktives Projekt zugeordnet.</Alert>
      ) : (
        <Grid container spacing={2}>
          {active.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.memberCount} Mitarbeitende
                  </Typography>
                  <ProgressBar progress={project.progress} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
