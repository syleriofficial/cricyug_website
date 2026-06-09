import type { Match, Player, PointsTableEntry, SearchResult, Series, Team } from "@/lib/types"

const CRICKET_API_BASE = "https://api.cricapi.com/v1"

interface CricketApiConfig {
  apiKey: string
  timeout?: number
}

class CricketDataService {
  private apiKey: string
  private timeout: number

  constructor(config: CricketApiConfig) {
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 15000
  }

  private async request(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${CRICKET_API_BASE}${endpoint}`)
    url.searchParams.set("apikey", this.apiKey)

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value)
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate: 60 },
      })

      const text = await response.text()

      if (!response.ok) {
        throw new Error(`Cricket API ${response.status}: ${text.slice(0, 300)}`)
      }

      return JSON.parse(text)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getCurrentMatches(): Promise<Match[]> {
    const result = await this.request("/currentMatches", { offset: "0" })
    return this.transformMatches(result?.data || [])
  }

  async getMatchInfo(matchId: string): Promise<Match | null> {
    const result = await this.request("/match_info", { id: matchId })
    const matches = this.transformMatches(result?.data ? [result.data] : [])
    return matches[0] || null
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const result = await this.request("/players", { search: query, offset: "0" })
    const players = Array.isArray(result?.data) ? result.data : []

    return players.map<Player>((item: any) => ({
      id: String(item.id || item.playerId || item.name || ""),
      name: String(item.name || "Unknown Player"),
      shortName: String(item.name || "Player"),
      country: String(item.country || ""),
      countryCode: String(item.country || "").slice(0, 2).toUpperCase(),
      role: "Batsman",
      image: item.playerImg,
    }))
  }

  async getCountries(): Promise<Team[]> {
    const result = await this.request("/countries", { offset: "0" })
    const countries = Array.isArray(result?.data) ? result.data : []

    return countries.map<Team>((item: any, index: number) => ({
      id: String(item.id || item.name || index),
      name: String(item.name || "Cricket Team"),
      shortName: String(item.genericFlag || item.name || "TBA").slice(0, 3).toUpperCase(),
      logo: item.genericFlag,
      flag: item.genericFlag,
      ranking: index + 1,
    }))
  }

  async getSeriesList(type?: string): Promise<Series[]> {
    const result = await this.request("/series", type ? { type, offset: "0" } : { offset: "0" })
    const series = Array.isArray(result?.data) ? result.data : []

    return series.map<Series>((item: any) => ({
      id: String(item.id || item.series_id || item.name || ""),
      name: String(item.name || "Cricket Series"),
      shortName: String(item.name || "Series"),
      type: "tournament",
      format: "T20",
      status: "ongoing",
      startDate: String(item.startDate || item.date || ""),
      endDate: String(item.endDate || item.date || ""),
      totalMatches: Number(item.matches || 0),
      teams: [],
    }))
  }

  async getSeriesStandings(_seriesId: string): Promise<PointsTableEntry[]> {
    return []
  }

  async search(query: string): Promise<SearchResult[]> {
    const [matches, players] = await Promise.all([
      this.getCurrentMatches(),
      this.searchPlayers(query).catch(() => []),
    ])

    const q = query.toLowerCase()

    return [
      ...matches
        .filter((match) => `${match.team1.team.name} ${match.team2.team.name} ${match.series.name}`.toLowerCase().includes(q))
        .map<SearchResult>((match) => ({
          type: "match",
          id: match.id,
          title: `${match.team1.team.shortName} vs ${match.team2.team.shortName}`,
          subtitle: match.series.name,
          url: `/matches/${match.id}`,
        })),
      ...players.map<SearchResult>((player) => ({
        type: "player",
        id: player.id,
        title: player.name,
        subtitle: player.country || player.role,
        url: `/players`,
      })),
    ]
  }

  private transformMatches(data: unknown[]): Match[] {
    if (!Array.isArray(data)) return []

    return data.map((item) => {
      const m = item as any
      const team1 = m.teamInfo?.[0]
      const team2 = m.teamInfo?.[1]
      const score1 = m.score?.[0]
      const score2 = m.score?.[1]

      return {
        id: String(m.id || ""),
        status: this.mapMatchStatus(String(m.status || m.matchStarted || "")),
        format: this.mapFormat(String(m.matchType || "T20")),
        series: {
          id: String(m.series_id || ""),
          name: String(m.name || "Cricket Match"),
          type: "bilateral",
          format: this.mapFormat(String(m.matchType || "T20")),
          status: "ongoing",
          startDate: String(m.date || ""),
          endDate: String(m.date || ""),
          totalMatches: 1,
          teams: [],
        },
        venue: {
          id: "",
          name: String(m.venue || ""),
          city: "",
          country: "",
        },
        team1: {
          team: {
            id: String(team1?.id || ""),
            name: String(team1?.name || "TBA"),
            shortName: String(team1?.shortname || team1?.name || "TBA"),
            flag: String(team1?.img || ""),
          },
          score: score1 ? `${score1.r}/${score1.w}` : undefined,
          overs: score1 ? String(score1.o || "") : undefined,
          wickets: score1 ? Number(score1.w || 0) : undefined,
        },
        team2: {
          team: {
            id: String(team2?.id || ""),
            name: String(team2?.name || "TBA"),
            shortName: String(team2?.shortname || team2?.name || "TBA"),
            flag: String(team2?.img || ""),
          },
          score: score2 ? `${score2.r}/${score2.w}` : undefined,
          overs: score2 ? String(score2.o || "") : undefined,
          wickets: score2 ? Number(score2.w || 0) : undefined,
        },
        result: String(m.status || ""),
        startTime: String(m.dateTimeGMT || m.date || ""),
      }
    })
  }

  private mapMatchStatus(value: string): Match["status"] {
    const v = value.toLowerCase()
    if (v.includes("started") || v.includes("live") || v === "true") return "live"
    if (v.includes("not started") || v.includes("scheduled")) return "upcoming"
    return "completed"
  }

  private mapFormat(value: string): Match["format"] {
    const v = value.toLowerCase()
    if (v.includes("test")) return "Test"
    if (v.includes("odi")) return "ODI"
    if (v.includes("t10")) return "T10"
    return "T20"
  }
}

export function getCricketDataService() {
  const apiKey = process.env.CRICKET_API_KEY

  if (!apiKey) return null

  return new CricketDataService({
    apiKey,
    timeout: 15000,
  })
}
