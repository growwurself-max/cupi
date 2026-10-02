/**
 * Supabase (PostgreSQL) client for Cupi's persistent store.
 *
 * Talks to PostgREST over plain HTTPS using the built-in `fetch`, so Cupi gains
 * a real, free, persistent cloud database without adding a single npm
 * dependency and without a long-lived database socket (which is what makes
 * serverless/edge Postgres awkward to use from a normal Express app).
 *
 * CREDENTIALS
 * Only the server-side `service_role` key is used, it is read from the
 * environment, and it is never logged, never returned in a response and never
 * bundled into the frontend. Combined with RLS enabled and no anon policy in
 * supabase/schema.sql, the tables are unreachable from a browser.
 */

export interface SupabaseConfig {
  url: string
  serviceRoleKey: string
}

/**
 * Raised for every failure to reach or write the database. Carries an HTTP
 * status when one is available so callers can distinguish "the database said
 * no" from "the database is unreachable" and report honestly instead of
 * pretending an order was saved.
 */
export class SupabaseStoreError extends Error {
  readonly status: number
  readonly code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'SupabaseStoreError'
    this.status = status
    this.code = code
  }
}

/**
 * Reads Supabase credentials from the environment.
 *
 * Returns null when they are absent so local development can keep using the
 * JSON file store. In production (`NODE_ENV=production`) a missing key is a
 * hard boot failure: silently falling back to an ephemeral disk is exactly the
 * bug this migration exists to remove.
 */
export function readSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseConfig | null {
  const url = (env.SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

  if (!url || !serviceRoleKey) return null
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('SUPABASE_URL must start with http:// or https://')
  }
  return { url, serviceRoleKey }
}

const DEFAULT_TIMEOUT_MS = 15_000
/** PostgREST error bodies look like { code, details, hint, message }. */
interface PostgrestErrorBody {
  code?: string
  details?: string
  hint?: string
  message?: string
}

export interface SupabaseRestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  /** Path under /rest/v1/, e.g. `cupi_orders?id=eq.abc`. */
  path: string
  query?: Record<string, unknown>
  prefer?: string
  /** Skips the JSON body when there is nothing to send. */
  body?: unknown
  timeoutMs?: number
  /** Extra response headers to read back (e.g. Content-Range for counts). */
  expectHeaders?: string[]
}

export interface SupabaseRestResponse<T> {
  data: T
  headers: Headers
}

function buildQuery(query: Record<string, unknown> | undefined): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    params.set(key, String(value))
  }
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

/**
 * Escapes a value for use inside a PostgREST `eq.`/`in.()` filter.
 *
 * Slugs and order ids are server-generated, but this keeps the filter grammar
 * intact even if a value ever contains a comma, quote or parenthesis.
 */
export function escapePostgrestValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export class SupabaseRest {
  private readonly config: SupabaseConfig

  constructor(config: SupabaseConfig) {
    this.config = config
  }

  /** Project host with the REST mount, e.g. https://abc.supabase.co/rest/v1 */
  get endpoint(): string {
    return `${this.config.url}/rest/v1`
  }

  /**
   * Performs one request. Throws SupabaseStoreError on any non-2xx response or
   * transport failure — it never resolves with a partially applied write, so a
   * caller can never report a successful save that did not happen.
   */
  async request<T>(options: SupabaseRestOptions): Promise<SupabaseRestResponse<T>> {
    const url = `${this.endpoint}/${options.path}${buildQuery(options.query)}`
    const headers: Record<string, string> = {
      apikey: this.config.serviceRoleKey,
      Authorization: `Bearer ${this.config.serviceRoleKey}`,
      Accept: 'application/json',
    }
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    if (options.prefer) headers.Prefer = options.prefer

    let response: Response
    try {
      response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      })
    } catch (error) {
      // Never include the URL's credentials or the request headers here.
      const reason = error instanceof Error ? error.message : 'unknown transport error'
      throw new SupabaseStoreError(`Supabase request failed: ${reason}`, 0, 'NETWORK')
    }

    const raw = await response.text()
    let parsed: unknown = null
    if (raw.length > 0) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
    }

    if (!response.ok) {
      const body = (parsed ?? {}) as PostgrestErrorBody
      const summary =
        typeof body.message === 'string' && body.message.length > 0
          ? body.message
          : `HTTP ${response.status}`
      throw new SupabaseStoreError(
        `Supabase ${options.method} ${options.path.split('?')[0]} failed: ${summary}`,
        response.status,
        typeof body.code === 'string' ? body.code : null,
      )
    }

    return { data: parsed as T, headers: response.headers }
  }

  /** Reads every value in `Content-Range: 0-0/N` (the exact row count). */
  static parseExactCount(headers: Headers): number | null {
    const range = headers.get('content-range')
    if (!range) return null
    const match = range.match(/\/(\d+)\s*$/)
    if (!match) return null
    const total = Number(match[1])
    return Number.isFinite(total) ? total : null
  }
}
