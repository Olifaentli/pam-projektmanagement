import { api } from './client'
import type {
  AppUser,
  CurrentUser,
  Member,
  Progress,
  Project,
  ProjectStatusName,
  RoleName,
  Task,
  TaskStatusName,
} from './types'

export const authApi = {
  /** Setzt das CSRF-Cookie, bevor der erste schreibende Aufruf erfolgt. */
  primeCsrf: () => api.get<void>('/api/auth/csrf'),
  login: (email: string, password: string) =>
    api.post<CurrentUser>('/api/auth/login', { email, password }),
  logout: () => api.post<void>('/api/auth/logout'),
  me: () => api.get<CurrentUser>('/api/auth/me'),
}

export const projectApi = {
  list: (status?: ProjectStatusName) =>
    api.get<Project[]>(`/api/projects${status ? `?status=${status}` : ''}`),
  get: (id: number) => api.get<Project>(`/api/projects/${id}`),
  create: (body: ProjectPayload) => api.post<Project>('/api/projects', body),
  update: (id: number, body: ProjectPayload) => api.put<Project>(`/api/projects/${id}`, body),
  archive: (id: number) => api.post<Project>(`/api/projects/${id}/archive`),
  reactivate: (id: number) => api.post<Project>(`/api/projects/${id}/reactivate`),
  members: (id: number) => api.get<Member[]>(`/api/projects/${id}/members`),
  updateMembers: (id: number, userIds: number[]) =>
    api.put<Member[]>(`/api/projects/${id}/members`, { userIds }),
  progress: (id: number) => api.get<Progress>(`/api/projects/${id}/progress`),
}

export const taskApi = {
  listByProject: (projectId: number) => api.get<Task[]>(`/api/projects/${projectId}/tasks`),
  create: (projectId: number, body: TaskPayload) =>
    api.post<Task>(`/api/projects/${projectId}/tasks`, body),
  update: (id: number, body: TaskPayload) => api.put<Task>(`/api/tasks/${id}`, body),
  updateStatus: (id: number, status: TaskStatusName) =>
    api.patch<Task>(`/api/tasks/${id}/status`, { status }),
  remove: (id: number) => api.delete<void>(`/api/tasks/${id}`),
}

/** Auswahlliste der Mitarbeitenden fuer die Projektzuordnung (US-3). */
export const directoryApi = {
  list: () => api.get<Member[]>('/api/users'),
}

export const userApi = {
  list: () => api.get<AppUser[]>('/api/admin/users'),
  create: (body: CreateUserPayload) => api.post<AppUser>('/api/admin/users', body),
  update: (id: number, body: UpdateUserPayload) => api.put<AppUser>(`/api/admin/users/${id}`, body),
  updateRoles: (id: number, roles: RoleName[]) =>
    api.put<AppUser>(`/api/admin/users/${id}/roles`, { roles }),
  remove: (id: number) => api.delete<void>(`/api/admin/users/${id}`),
}

export interface ProjectPayload {
  name: string
  description?: string
  startDate?: string | null
  endDate?: string | null
}

export interface TaskPayload {
  title: string
  description?: string
  assigneeId?: number | null
  dueDate?: string | null
}

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  roles: RoleName[]
}

export interface UpdateUserPayload {
  firstName: string
  lastName: string
  enabled: boolean
}
