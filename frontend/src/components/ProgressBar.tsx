import { Box, LinearProgress, Tooltip, Typography } from '@mui/material'
import { STATUS_COLORS } from '../theme'
import type { Progress } from '../api/types'

/**
 * Projektfortschritt (US-6).
 *
 * Zeigt neben dem Balken immer auch die absoluten Zahlen: ein Prozentwert
 * allein laesst offen, ob 50 % aus zwei oder aus zweihundert Aufgaben stammen.
 *
 * Die Balkenfarbe folgt derselben Ampellogik wie die Aufgabenstatus, damit
 * Farbe in der ganzen Anwendung dasselbe bedeutet: grau solange nichts
 * erledigt ist, orange waehrend der Bearbeitung, gruen bei Abschluss.
 */
function barColor(percent: number, total: number): string {
  if (total === 0 || percent === 0) return STATUS_COLORS.OPEN.main
  if (percent >= 100) return STATUS_COLORS.DONE.main
  return STATUS_COLORS.IN_PROGRESS.main
}

export function ProgressBar({ progress }: { progress: Progress }) {
  const { total, done, percentDone } = progress
  const color = barColor(percentDone, total)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Fortschritt
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color }}>
          {percentDone} %
        </Typography>
      </Box>
      <Tooltip title={`${done} von ${total} Aufgaben erledigt`}>
        <LinearProgress
          variant="determinate"
          value={percentDone}
          sx={{ height: 9, '& .MuiLinearProgress-bar': { backgroundColor: color } }}
          aria-label={`Fortschritt ${percentDone} Prozent, ${done} von ${total} Aufgaben erledigt`}
        />
      </Tooltip>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {done} von {total} Aufgaben erledigt
      </Typography>
    </Box>
  )
}
