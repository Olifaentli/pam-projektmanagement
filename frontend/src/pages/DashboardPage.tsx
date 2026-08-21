import { Alert, Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../api/endpoints'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../auth/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
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

  const tiles = [
    { label: 'Aktive Projekte', value: active.length },
    { label: 'Archivierte Projekte', value: projects.length - active.length },
    { label: 'Offene Aufgaben', value: openTasks },
    { label: 'Erledigte Aufgaben', value: doneTasks },
  ]

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Willkommen, {user?.fullName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Übersicht über die Projekte, für die Sie berechtigt sind.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
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

      <Typography variant="h2" gutterBottom>
        Aktive Projekte
      </Typography>
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
