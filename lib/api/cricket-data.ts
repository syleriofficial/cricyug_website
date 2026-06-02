import type { Match } from "@/lib/types"

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
