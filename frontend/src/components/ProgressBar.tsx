import { Box, LinearProgress, Tooltip, Typography } from '@mui/material'
import type { Progress } from '../api/types'

/**
 * Projektfortschritt (US-6).
 *
 * Zeigt neben dem Balken immer auch die absoluten Zahlen: ein Prozentwert
 * allein laesst offen, ob 50 % aus zwei oder aus zweihundert Aufgaben stammen.
 */
export function ProgressBar({ progress }: { progress: Progress }) {
  const { total, done, percentDone } = progress
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Fortschritt
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {percentDone} %
        </Typography>
      </Box>
      <Tooltip title={`${done} von ${total} Aufgaben erledigt`}>
        <LinearProgress
          variant="determinate"
          value={percentDone}
          sx={{ height: 8, borderRadius: 4 }}
          aria-label={`Fortschritt ${percentDone} Prozent, ${done} von ${total} Aufgaben erledigt`}
        />
      </Tooltip>
      <Typography variant="caption" color="text.secondary">
        {done} von {total} Aufgaben erledigt
      </Typography>
    </Box>
  )
}
