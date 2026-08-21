/** Typen der REST-API. Spiegeln die DTOs des Backends wider. */

export type RoleName = 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE'

export type ProjectStatusName = 'ACTIVE' | 'ARCHIVED'

export type TaskStatusName = 'OPEN' | 'IN_PROGRESS' | 'DONE'

export interface CurrentUser {
  id: number
  tenantId: number
  email: string
  fullName: string
  roles: RoleName[]
}

export interface AppUser {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  enabled: boolean
  roles: RoleName[]
}

export interface Progress {
  total: number
  open: number
  inProgress: number
  done: number
  percentDone: number
}

export interface Project {
  id: number
  name: string
  description?: string
  status: ProjectStatusName
  startDate?: string
  endDate?: string
  memberCount: number
  progress: Progress
}

export interface Member {
  userId: number
  fullName: string
  email: string
}

export interface Task {
  id: number
  projectId: number
  title: string
  description?: string
  status: TaskStatusName
  statusLabel: string
  assigneeId?: number
  assigneeName?: string
  dueDate?: string
  updatedAt: string
}

/** Reihenfolge und Beschriftung der Statusspalten im Aufgabenboard. */
export const TASK_STATUSES: { value: TaskStatusName; label: string }[] = [
  { value: 'OPEN', label: 'Offen' },
  { value: 'IN_PROGRESS', label: 'In Bearbeitung' },
  { value: 'DONE', label: 'Erledigt' },
]

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN: 'Administration',
  PROJECT_MANAGER: 'Projektleitung',
  EMPLOYEE: 'Mitarbeitende:r',
}
