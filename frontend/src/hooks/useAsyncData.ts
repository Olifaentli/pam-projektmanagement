import { useCallback, useEffect, useReducer } from 'react'
import { ApiError } from '../api/client'

/**
 * Laedt Daten und haelt Ladezustand, Ergebnis und Fehler zusammen.
 *
 * Umgesetzt mit useReducer nach dem Muster aus Lektion 5.2: Statt drei
 * einzelner useState-Variablen, die auseinanderlaufen koennen, beschreibt ein
 * Reducer die erlaubten Zustandswechsel FETCH_START, FETCH_SUCCESS und
 * FETCH_ERROR.
 */
interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: string }

function reducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { data: action.data, loading: false, error: null }
    case 'FETCH_ERROR':
      return { data: null, loading: false, error: action.error }
    default:
      return state
  }
}

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, dispatch] = useReducer(reducer<T>, {
    data: null,
    loading: true,
    error: null,
  } as AsyncState<T>)

  const reload = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      dispatch({ type: 'FETCH_SUCCESS', data: await loader() })
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        error: error instanceof ApiError ? error.message : 'Daten konnten nicht geladen werden.',
      })
    }
    // loader wird bewusst nicht in die Abhaengigkeiten aufgenommen: die
    // Aufrufstelle uebergibt meist eine neu erzeugte Funktion, was sonst
    // eine Endlosschleife ergaebe. Stattdessen steuern deps das Neuladen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    void reload()
  }, [reload])

  return { ...state, reload }
}
