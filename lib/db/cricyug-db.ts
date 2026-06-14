import type {
  BatsmanScore,
  BowlerScore,
  CommentaryItem,
  FallOfWicket,
  Match,
  MatchDetails,
  MatchFormat,
  MatchStatus,
  Partnership,
  Player,
  PlayerRole,
  SearchResult,
  Series,
  Team,
  Venue,
} from "@/lib/types"
import { isCricYugDbConfigured, supabaseSelect, supabaseSingle, type SupabaseRow } from "./supabase"

type TeamRow = SupabaseRow & {
  id: string
  slug: string
  name: string
  short_name: string
  country?: string | null
  country_code?: string | null
  logo_url?: string | null
  metadata?: Record<string, unknown>
}

type PlayerRow = SupabaseRow & {
  id: string
  slug: string
  name: string
  short_name?: string | null
  country?: string | null
  country_code?: string | null
  role?: string | null
  batting_style?: string | null
  bowling_style?: string | null
  date_of_birth?: string | null
  image_url?: string | null
  batting_stats?: Record<string, unknown>
  bowling_stats?: Record<string, unknown>
  bio?: string | null
}

type VenueRow = SupabaseRow & {
  id: string
  slug: string
  name: string
  city: string
  country: string
  capacity?: number | null
}

type SeriesRow = SupabaseRow & {
  id: string
  slug: string
  name: string
  short_name?: string | null
  type?: string | null
  category?: string | null
  format?: string | null
  status?: string | null
  start_date?: string | null
  end_date?: string | null
  total_matches?: number | null
  teams?: TeamRow[] | null
}

type MatchRow = SupabaseRow & {
  id: string
  slug: string
  external_id?: string | null
  title: string
  format?: string | null
  status?: string | null
  start_time?: string | null
  result?: string | null
  toss?: { winner?: string; decision?: "bat" | "bowl" } | null
  series?: SeriesRow | null
  venues?: VenueRow | null
  team1?: TeamRow | null
  team2?: TeamRow | null
}

type InningsRow = SupabaseRow & {
  id: string
  innings_number: number
  runs?: number | null
  wickets?: number | null
  overs?: number | string | null
  run_rate?: number | null
  extras?: Record<string, number> | null
  total_text?: string | null
  declared?: boolean | null
  batting_team?: TeamRow | null
  bowling_team?: TeamRow | null
  batting_scorecards?: BattingRow[] | null
  bowling_scorecards?: BowlingRow[] | null
}

type BattingRow = SupabaseRow & {
  dismissal?: string | null
  runs?: number | null
  balls?: number | null
  fours?: number | null
  sixes?: number | null
  strike_rate?: number | null
  is_not_out?: boolean | null
  players?: PlayerRow | null
}

type BowlingRow = SupabaseRow & {
  overs?: number | string | null
  maidens?: number | null
  runs?: number | null
  wickets?: number | null
  economy?: number | null
  wides?: number | null
  no_balls?: number | null
  players?: PlayerRow | null
}

type RankingRow = SupabaseRow & {
  id: string
  ranking_type: string
  format: string
  scope?: string | null
  position: number
  rating: number
  points?: number | null
  previous_position?: number | null
  teams?: TeamRow | null
  players?: PlayerRow | null
}

type RecordRow = SupabaseRow & {
  id: string
  slug: string
  record_type: string
  format?: string | null
  title: string
  value: string
  numeric_value?: number | null
  achieved_on?: string | null
  description?: string | null
  teams?: TeamRow | null
  players?: PlayerRow | null
}

const matchSelect = [
  "*",
  "series:series_id(*)",
  "venues:venue_id(*)",
  "team1:team1_id(*)",
  "team2:team2_id(*)",
].join(",")

const inningsSelect = [
  "*",
  "batting_team:batting_team_id(*)",
  "bowling_team:bowling_team_id(*)",
  "batting_scorecards(*,players:player_id(*))",
  "bowling_scorecards(*,players:player_id(*))",
].join(",")

function asFormat(value?: string | null): MatchFormat {
  const normalized = (value || "T20").toUpperCase()
  if (normalized === "TEST") return "Test"
  if (normalized === "ODI") return "ODI"
  if (normalized === "T10") return "T10"
  return "T20"
}

function asStatus(value?: string | null): MatchStatus {
  if (value === "live" || value === "completed") return value
  return "upcoming"
}

function asRole(value?: string | null): PlayerRole {
  if (value === "Bowler" || value === "All-rounder" || value === "Wicket-keeper") return value
  return "Batsman"
}

function mapTeam(row?: TeamRow | null): Team {
  return {
    id: row?.slug || row?.id || "unknown-team",
    name: row?.name || "Team unavailable",
    shortName: row?.short_name || row?.name?.slice(0, 3).toUpperCase() || "TBA",
    logo: row?.logo_url || undefined,
    flag: row?.logo_url || undefined,
    countryCode: row?.country_code || undefined,
    ranking: typeof row?.metadata?.ranking === "number" ? row.metadata.ranking : undefined,
  }
}

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.slug || row.id,
    name: row.name,
    shortName: row.short_name || row.name,
    country: row.country || "Unknown",
    countryCode: row.country_code || "",
    role: asRole(row.role),
    battingStyle: row.batting_style || undefined,
    bowlingStyle: row.bowling_style || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    image: row.image_url || undefined,
  }
}

function mapSeries(row?: SeriesRow | null): Series {
  return {
    id: row?.slug || row?.id || "unknown-series",
    name: row?.name || "Series unavailable",
    shortName: row?.short_name || undefined,
    type: row?.type === "league" || row?.type === "tournament" ? row.type : "bilateral",
    category: row?.category === "league" || row?.category === "domestic" || row?.category === "women" ? row.category : "international",
    format: asFormat(row?.format),
    status: row?.status === "ongoing" || row?.status === "completed" ? row.status : "upcoming",
    startDate: row?.start_date || "",
    endDate: row?.end_date || "",
    totalMatches: row?.total_matches || 0,
    teams: row?.teams?.map(mapTeam) || [],
  }
}

function mapVenue(row?: VenueRow | null): Venue {
  return {
    id: row?.slug || row?.id || "unknown-venue",
    name: row?.name || "Venue TBA",
    city: row?.city || "",
    country: row?.country || "",
    capacity: row?.capacity || undefined,
  }
}

function mapMatch(row: MatchRow): Match {
  return {
    id: row.slug || row.external_id || row.id,
    status: asStatus(row.status),
    format: asFormat(row.format),
    series: mapSeries(row.series),
    venue: mapVenue(row.venues),
    team1: { team: mapTeam(row.team1) },
    team2: { team: mapTeam(row.team2) },
    result: row.result || undefined,
    startTime: row.start_time || undefined,
    toss: row.toss?.winner && row.toss?.decision ? { winner: row.toss.winner, decision: row.toss.decision } : undefined,
  }
}

function mapBatsman(row: BattingRow): BatsmanScore {
  return {
    player: row.players ? mapPlayer(row.players) : mapPlayer({ id: "unknown", slug: "unknown", name: "Unknown player" }),
    runs: row.runs || 0,
    balls: row.balls || 0,
    fours: row.fours || 0,
    sixes: row.sixes || 0,
    strikeRate: row.strike_rate || 0,
    dismissal: row.dismissal || undefined,
    isNotOut: row.is_not_out || false,
  }
}

function mapBowler(row: BowlingRow): BowlerScore {
  return {
    player: row.players ? mapPlayer(row.players) : mapPlayer({ id: "unknown", slug: "unknown", name: "Unknown player" }),
    overs: String(row.overs || "0"),
    maidens: row.maidens || 0,
    runs: row.runs || 0,
    wickets: row.wickets || 0,
    economy: row.economy || 0,
    wides: row.wides || 0,
    noBalls: row.no_balls || 0,
  }
}

export async function getDbPlayers(options: { search?: string; role?: string; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const filters = options.role && options.role !== "All" ? { role: options.role } : undefined
  const rows = await supabaseSelect<PlayerRow>("players", {
    filters,
    search: options.search ? { query: options.search, columns: ["name", "short_name", "country", "role"] } : undefined,
    order: "name.asc",
    limit: options.limit || 20,
  })
  return rows.map(mapPlayer)
}

export async function getDbPlayer(id: string) {
  if (!isCricYugDbConfigured()) return null
  const row = await supabaseSingle<PlayerRow>("players", {
    filters: { slug: id },
  }) || await supabaseSingle<PlayerRow>("players", {
    filters: { id },
  })
  return row ? mapPlayer(row) : null
}

export async function getDbTeams(options: { search?: string; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const rows = await supabaseSelect<TeamRow>("teams", {
    search: options.search ? { query: options.search, columns: ["name", "short_name", "country"] } : undefined,
    order: "name.asc",
    limit: options.limit || 20,
  })
  return rows.map(mapTeam)
}

export async function getDbTeam(id: string) {
  if (!isCricYugDbConfigured()) return null
  const row = await supabaseSingle<TeamRow>("teams", { filters: { slug: id } }) || await supabaseSingle<TeamRow>("teams", { filters: { id } })
  return row ? mapTeam(row) : null
}

export async function getDbSeries(options: { category?: string; status?: string; type?: string; featured?: boolean; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const filters: Record<string, string> = {}
  if (options.category && options.category !== "all") filters.category = options.category
  if (options.status) filters.status = options.status
  if (options.type) filters.type = options.type
  const rows = await supabaseSelect<SeriesRow>("series", {
    filters,
    order: options.featured ? "start_date.desc" : "name.asc",
    limit: options.limit || 20,
  })
  return rows.map(mapSeries)
}

export async function getDbSeriesById(id: string) {
  if (!isCricYugDbConfigured()) return null
  const row = await supabaseSingle<SeriesRow>("series", { filters: { slug: id } }) || await supabaseSingle<SeriesRow>("series", { filters: { id } })
  return row ? mapSeries(row) : null
}

export async function getDbMatches(options: { status?: string; format?: string; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const filters: Record<string, string> = {}
  if (options.status) filters.status = options.status
  if (options.format) filters.format = options.format.toUpperCase()
  const rows = await supabaseSelect<MatchRow>("matches", {
    select: matchSelect,
    filters,
    order: "start_time.desc",
    limit: options.limit || 20,
  })
  return rows.map(mapMatch)
}

export async function getDbMatch(id: string): Promise<MatchDetails | null> {
  if (!isCricYugDbConfigured()) return null
  const row = await supabaseSingle<MatchRow>("matches", { select: matchSelect, filters: { slug: id } }) || await supabaseSingle<MatchRow>("matches", { select: matchSelect, filters: { external_id: id } })
  if (!row) return null

  const inningsRows = await supabaseSelect<InningsRow>("innings", {
    select: inningsSelect,
    filters: { match_id: row.id },
    order: "innings_number.asc",
  })

  return {
    ...mapMatch(row),
    scorecard: inningsRows.map((innings) => ({
      battingTeam: mapTeam(innings.batting_team),
      bowlingTeam: mapTeam(innings.bowling_team),
      batsmen: (innings.batting_scorecards || []).map(mapBatsman),
      bowlers: (innings.bowling_scorecards || []).map(mapBowler),
      extras: {
        byes: innings.extras?.byes || 0,
        legByes: innings.extras?.legByes || 0,
        wides: innings.extras?.wides || 0,
        noBalls: innings.extras?.noBalls || 0,
        penalty: innings.extras?.penalty || 0,
        total: innings.extras?.total || 0,
      },
      total: innings.total_text || `${innings.runs || 0}/${innings.wickets || 0}`,
      overs: String(innings.overs || "0"),
      runRate: innings.run_rate || 0,
      declared: innings.declared || false,
    })),
    commentary: [] as CommentaryItem[],
    partnerships: [] as Partnership[],
    fallOfWickets: [] as FallOfWicket[],
  }
}

export async function searchCricYugDb(query: string, limit = 10): Promise<SearchResult[]> {
  if (!isCricYugDbConfigured() || query.length < 2) return []
  const [players, teams, series, matches] = await Promise.all([
    getDbPlayers({ search: query, limit }),
    getDbTeams({ search: query, limit }),
    supabaseSelect<SeriesRow>("series", { search: { query, columns: ["name", "short_name", "category"] }, limit }),
    supabaseSelect<MatchRow>("matches", { select: matchSelect, search: { query, columns: ["title", "result", "match_summary"] }, limit }),
  ])

  return [
    ...players.map((player) => ({ type: "player" as const, id: player.id, title: player.name, subtitle: `${player.country} • ${player.role}`, image: player.image, url: `/players/${player.id}` })),
    ...teams.map((team) => ({ type: "team" as const, id: team.id, title: team.name, subtitle: team.countryCode || "Team profile", image: team.logo, url: `/teams/${team.id}` })),
    ...series.map((item) => ({ type: "series" as const, id: item.slug, title: item.name, subtitle: `${item.category || "Series"} • ${item.status || ""}`, url: `/series/${item.slug}` })),
    ...matches.map((item) => ({ type: "match" as const, id: item.slug, title: item.title, subtitle: item.result || item.start_time || "Match scorecard", url: `/matches/${item.slug}` })),
  ].slice(0, limit)
}

export async function getDbRankings(options: { type?: string; format?: string; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const filters: Record<string, string> = {}
  if (options.type) filters.ranking_type = options.type
  if (options.format) filters.format = options.format.toUpperCase()

  const rows = await supabaseSelect<RankingRow>("rankings", {
    select: "*,teams:team_id(*),players:player_id(*)",
    filters,
    order: "position.asc",
    limit: options.limit || 50,
  })

  return rows.map((row) => ({
    id: row.id,
    rankingType: row.ranking_type,
    format: row.format,
    scope: row.scope || "icc",
    position: row.position,
    rating: row.rating,
    points: row.points || undefined,
    previousPosition: row.previous_position || undefined,
    team: row.teams ? mapTeam(row.teams) : undefined,
    player: row.players ? mapPlayer(row.players) : undefined,
  }))
}

export async function getDbRecords(options: { type?: string; format?: string; limit?: number } = {}) {
  if (!isCricYugDbConfigured()) return []
  const filters: Record<string, string> = {}
  if (options.type) filters.record_type = options.type
  if (options.format) filters.format = options.format.toUpperCase()

  const rows = await supabaseSelect<RecordRow>("records", {
    select: "*,teams:holder_team_id(*),players:holder_player_id(*)",
    filters,
    order: "numeric_value.desc",
    limit: options.limit || 50,
  })

  return rows.map((row) => ({
    id: row.slug || row.id,
    recordType: row.record_type,
    format: row.format || "All",
    title: row.title,
    value: row.value,
    numericValue: row.numeric_value || undefined,
    achievedOn: row.achieved_on || undefined,
    description: row.description || undefined,
    team: row.teams ? mapTeam(row.teams) : undefined,
    player: row.players ? mapPlayer(row.players) : undefined,
  }))
}
