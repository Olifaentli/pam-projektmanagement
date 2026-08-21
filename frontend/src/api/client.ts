/**
 * Schmaler Wrapper um fetch fuer alle API-Aufrufe.
 *
 * Nimmt drei wiederkehrende Aufgaben zentral ab, damit sie nicht an jeder
 * Aufrufstelle wiederholt werden muessen:
 *  - das CSRF-Token aus dem Cookie als Header mitsenden,
 *  - Fehlerantworten des Backends in eine typisierte Exception uebersetzen,
 *  - das Session-Cookie mitschicken.
 */

/** Feldbezogener Validierungsfehler, wie ihn der GlobalExceptionHandler liefert. */
export interface FieldError {
  field: string
  message: string
}

/** Fehlerformat der API (Zeitstempel, Status, Meldung, Felddetails). */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors: FieldError[]
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldError[]

  constructor(status: number, message: string, fieldErrors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  /** Meldung zu einem einzelnen Feld, für die Anzeige direkt am Eingabefeld. */
  fieldMessage(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.message
  }
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')[1]
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  // Spring Security prueft das Token nur bei zustandsaendernden Methoden.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = readCookie('XSRF-TOKEN')
    if (token) {
      headers.set('X-XSRF-TOKEN', decodeURIComponent(token))
    }
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'same-origin',
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    let body: Partial<ApiErrorBody> = {}
    try {
      body = await response.json()
    } catch {
      // Antwort ohne JSON-Körper, z. B. bei einem Proxy-Fehler.
    }
    throw new ApiError(
      response.status,
      body.message ?? 'Die Anfrage konnte nicht verarbeitet werden.',
      body.fieldErrors ?? [],
    )
  }

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
