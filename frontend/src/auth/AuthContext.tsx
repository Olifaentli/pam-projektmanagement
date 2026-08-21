import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import type { CurrentUser, RoleName } from '../api/types'

/**
 * Anmeldezustand der Anwendung.
 *
 * Bewusst mit useReducer statt mehreren useState-Variablen umgesetzt
 * (vgl. Lektion 5.2 des Kursskripts): Laden, Fehler und Benutzer haengen
 * zusammen, und ein zentraler Reducer schliesst widerspruechliche
 * Kombinationen wie "laedt und hat gleichzeitig einen Fehler" aus.
 */
interface AuthState {
  user: CurrentUser | null
  loading: boolean
  error: string | null
  /** Solange true, ist noch nicht geklaert, ob eine Sitzung besteht. */
  initialising: boolean
}

type AuthAction =
  | { type: 'RESTORE_SUCCESS'; user: CurrentUser }
  | { type: 'RESTORE_FAILURE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: CurrentUser }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialising: true,
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_SUCCESS':
      return { user: action.user, loading: false, error: null, initialising: false }
    case 'RESTORE_FAILURE':
      return { ...initialState, initialising: false }
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { user: action.user, loading: false, error: null, initialising: false }
    case 'LOGIN_FAILURE':
      return { user: null, loading: false, error: action.error, initialising: false }
    case 'LOGOUT':
      return { ...initialState, initialising: false }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hasRole: (...roles: RoleName[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Nach einem Reload ist der React-Zustand weg, die Session-Cookie aber
  // noch da. /me stellt den Anmeldezustand daher beim Start wieder her.
  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((user) => active && dispatch({ type: 'RESTORE_SUCCESS', user }))
      .catch(() => active && dispatch({ type: 'RESTORE_FAILURE' }))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      // Erst das CSRF-Cookie holen, sonst wird der Login-POST abgewiesen.
      await authApi.primeCsrf()
      const user = await authApi.login(email, password)
      dispatch({ type: 'LOGIN_SUCCESS', user })
      return true
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Der Server ist nicht erreichbar.'
      dispatch({ type: 'LOGIN_FAILURE', error: message })
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // Auch wenn der Aufruf scheitert, gilt der Benutzer lokal als abgemeldet.
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const hasRole = useCallback(
    (...roles: RoleName[]) => state.user !== null && roles.some((r) => state.user!.roles.includes(r)),
    [state.user],
  )

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  }
  return context
}
