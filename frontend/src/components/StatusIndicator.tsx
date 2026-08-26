import { Box, Chip } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { STATUS_COLORS } from '../theme'
import { TASK_STATUSES } from '../api/types'
import type { TaskStatusName } from '../api/types'

/**
 * Einheitliche Statusdarstellung der Aufgaben (US-5).
 *
 * Der Status wird doppelt kodiert - ueber Farbe **und** ueber ein Symbol.
 * Das ist kein Zierrat: Rund acht Prozent der Maenner haben eine
 * Rot-Gruen-Sehschwaeche. Eine Ampel, die ihre Bedeutung allein ueber die
 * Farbe transportiert, ist fuer sie nicht lesbar.
 */

const ICONS: Record<TaskStatusName, typeof CheckCircleRoundedIcon> = {
  OPEN: RadioButtonUncheckedRoundedIcon,
  IN_PROGRESS: AutorenewRoundedIcon,
  DONE: CheckCircleRoundedIcon,
}

export function statusLabel(status: TaskStatusName): string {
  return TASK_STATUSES.find((s) => s.value === status)?.label ?? status
}

/** Reiner Farbpunkt - fuer beengte Stellen wie Auswahlfelder und Spaltenköpfe. */
export function StatusDot({ status, size = 10 }: { status: TaskStatusName; size?: number }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-block',
        backgroundColor: STATUS_COLORS[status].main,
        // Heller Ring, damit der Punkt auch auf farbigem Grund abgesetzt bleibt.
        boxShadow: `0 0 0 3px ${STATUS_COLORS[status].soft}`,
      }}
    />
  )
}

/** Punkt mit Beschriftung - die Standardanzeige eines Status. */
export function StatusIndicator({
  status,
  showLabel = true,
}: {
  status: TaskStatusName
  showLabel?: boolean
}) {
  const label = statusLabel(status)
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <StatusDot status={status} />
      {showLabel && (
        <Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS[status].text }}>
          {label}
        </Box>
      )}
    </Box>
  )
}

/** Statusplakette mit Symbol - fuer Karten und Listen. */
export function StatusChip({ status }: { status: TaskStatusName }) {
  const Icon = ICONS[status]
  const color = STATUS_COLORS[status]
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: 16, color: `${color.main} !important` }} />}
      label={statusLabel(status)}
      sx={{
        backgroundColor: color.soft,
        color: color.text,
        border: `1px solid ${color.main}22`,
        '& .MuiChip-label': { paddingInline: 1 },
      }}
    />
  )
}
