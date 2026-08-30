import { Box, LinearProgress, Tooltip, Typography } from '@mui/material'
import { STATUS_ACCENT, STATUS_COLORS } from '../theme'
import type { Progress } from '../api/types'

/**
 * Projektfortschritt (US-6).
 *
 * Zeigt neben dem Balken immer auch die absoluten Zahlen: ein Prozentwert
 * allein laesst offen, ob 50 % aus zwei oder aus zweihundert Aufgaben stammen.
 *
 * Die Farbe folgt derselben Ampellogik wie die Aufgabenstatus. Balken und
 * Prozenttext verwenden dabei unterschiedliche Toene: der Balken die weichere
 * Flaechenfarbe, die Zahl den kraeftigeren Akzent - kleine Schrift braucht
 * mehr Kontrast als eine Flaeche.
 */
function statusOf(percent: number, total: number): keyof typeof STATUS_COLORS {
  if (total === 0 || percent === 0) return 'OPEN'
  if (percent >= 100) return 'DONE'
  return 'IN_PROGRESS'
}

export function ProgressBar({
  progress,
  height = 6,
  showHeader = true,
  showCaption = true,
}: {
  progress: Progress
  height?: number
  /** Zeile mit Beschriftung und Prozentwert oberhalb des Balkens. */
  showHeader?: boolean
  /** Zeile "x von y Aufgaben erledigt" unterhalb des Balkens. */
  showCaption?: boolean
}) {
  const { total, done, percentDone } = progress
  const status = statusOf(percentDone, total)

  return (
    <Box>
      {showHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
          <Typography variant="body2" color="text.secondary">
            Fortschritt
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: STATUS_ACCENT[status] }}>
            {percentDone} %
          </Typography>
        </Box>
      )}
      <Tooltip title={`${done} von ${total} Aufgaben erledigt`}>
        <LinearProgress
          variant="determinate"
          value={percentDone}
          sx={{
            height,
            '& .MuiLinearProgress-bar': { backgroundColor: STATUS_COLORS[status].main },
          }}
          aria-label={`Fortschritt ${percentDone} Prozent, ${done} von ${total} Aufgaben erledigt`}
        />
      </Tooltip>
      {showCaption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {done} von {total} Aufgaben erledigt
        </Typography>
      )}
    </Box>
  )
}
