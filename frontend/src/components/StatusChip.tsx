import { Chip } from '@mui/material'
import type { TaskStatusName } from '../api/types'

const CONFIG: Record<TaskStatusName, { label: string; color: 'default' | 'warning' | 'success' }> = {
  OPEN: { label: 'Offen', color: 'default' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'warning' },
  DONE: { label: 'Erledigt', color: 'success' },
}

/** Einheitliche Statusdarstellung, damit die Farbe ueberall dieselbe Bedeutung hat. */
export function StatusChip({ status }: { status: TaskStatusName }) {
  const { label, color } = CONFIG[status]
  return <Chip size="small" label={label} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />
}
