type QueryValue = string | number | boolean | null | undefined

export type SupabaseRow = Record<string, unknown>

type SupabaseSelectOptions = {
  select?: string
  order?: string
  limit?: number
  filters?: Record<string, QueryValue>
  search?: {
    columns: string[]
    query: string
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) return null

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1`,
    key,
  }
}

export function isCricYugDbConfigured() {
  return Boolean(getSupabaseConfig())
}

function buildUrl(table: string, options: SupabaseSelectOptions = {}) {
  const config = getSupabaseConfig()
  if (!config) return null

  const url = new URL(`${config.restUrl}/${table}`)
  url.searchParams.set("select", options.select || "*")

  Object.entries(options.filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    url.searchParams.set(key, `eq.${value}`)
  })

  if (options.search?.query) {
    const query = options.search.query.replace(/[%(),]/g, " ").trim()
    if (query) {
      const clauses = options.search.columns.map((column) => `${column}.ilike.%${query}%`)
      url.searchParams.set("or", `(${clauses.join(",")})`)
    }
  }

  if (options.order) url.searchParams.set("order", options.order)
  if (options.limit) url.searchParams.set("limit", String(options.limit))

  return { url, config }
}

export async function supabaseSelect<T extends SupabaseRow>(
  table: string,
  options: SupabaseSelectOptions = {}
): Promise<T[]> {
  const built = buildUrl(table, options)
  if (!built) return []

  const response = await fetch(built.url, {
    headers: {
      apikey: built.config.key,
      Authorization: `Bearer ${built.config.key}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase ${table} query failed: ${message}`)
  }

  return response.json() as Promise<T[]>
}

export async function supabaseSingle<T extends SupabaseRow>(
  table: string,
  options: SupabaseSelectOptions = {}
): Promise<T | null> {
  const rows = await supabaseSelect<T>(table, { ...options, limit: 1 })
  return rows[0] || null
}
