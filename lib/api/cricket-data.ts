// CricYug - CricketData.org API Integration
// Production-ready API service layer
// API Documentation: https://cricketdata.org/docs

import type { Match, Player, NewsArticle, Series, Team, SearchResult } from "@/lib/types"

const CRICKET_API_BASE = "https://api.cricketdata.org/v1"

interface CricketApiConfig {
  apiKey: string
  timeout?: number
}

interface CricketApiResponse<T> {
  status: "success" | "error"
  data: T
  info?: {
    currentPage?: number
    totalResults?: number
  }
}

class CricketDataService {
  private apiKey: string
  private timeout: number

  constructor(config: CricketApiConfig) {
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 10000
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${CRICKET_API_BASE}${endpoint}`)
    url.searchParams.append("apikey", this.apiKey)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 60 }, // Cache for 60 seconds
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result: CricketApiResponse<T> = await response.json()
      
      if (result.status === "error") {
        throw new Error("API returned error status")
      }

      return result.data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  // === MATCHES ===
  
  async getCurrentMatches(): Promise<Match[]> {
    const data = await this.request<Match[]>("/currentMatches")
    return this.transformMatches(data)
  }

  async getMatchInfo(matchId: string): Promise<Match | null> {
    const data = await this.request<Match>("/match_info", { id: matchId })
    return data ? this.transformMatch(data) : null
  }

  async getMatchScorecard(matchId: string) {
    return this.request("/match_scorecard", { id: matchId })
  }

  // === SERIES ===

  async getSeriesList(type?: "international" | "league" | "domestic"): Promise<Series[]> {
    const params: Record<string, string> = {}
    if (type) params.type = type
    const data = await this.request<Series[]>("/series", params)
    return this.transformSeries(data)
  }

  async getSeriesInfo(seriesId: string): Promise<Series | null> {
    const data = await this.request<Series>("/series_info", { id: seriesId })
    return data ? this.transformSeriesItem(data) : null
  }

  // === PLAYERS ===

  async getPlayerInfo(playerId: string): Promise<Player | null> {
    const data = await this.request<Player>("/players_info", { id: playerId })
    return data ? this.transformPlayer(data) : null
  }

  async searchPlayers(name: string): Promise<Player[]> {
    const data = await this.request<Player[]>("/players", { search: name })
    return this.transformPlayers(data)
  }

  // === NEWS ===

  async getNews(): Promise<NewsArticle[]> {
    // CricketData.org doesn't have a news endpoint
    // This would need to be integrated with a news API
    return []
  }

  // === TEAMS ===

  async getCountries(): Promise<Team[]> {
    const data = await this.request<Team[]>("/countries")
    return this.transformTeams(data)
  }

  // === SEARCH ===

  async search(query: string): Promise<SearchResult[]> {
    // Combine player search results
    const players = await this.searchPlayers(query)
    return players.map(p => ({
      id: p.id,
      type: "player" as const,
      title: p.name,
      subtitle: p.country,
      url: `/players/${p.id}`,
    }))
  }

  // === TRANSFORMERS ===
  // These transform CricketData.org API responses to our internal types

  private transformMatches(data: unknown[]): Match[] {
    if (!Array.isArray(data)) return []
    return data.map(this.transformMatch).filter(Boolean) as Match[]
  }

  private transformMatch(item: unknown): Match | null {
    if (!item || typeof item !== "object") return null
    const m = item as Record<string, unknown>
    
    return {
      id: String(m.id || ""),
      status: this.mapMatchStatus(m.matchStatus as string),
      matchType: String(m.matchType || ""),
      venue: String(m.venue || ""),
      date: String(m.date || ""),
      seriesId: String(m.series_id || ""),
      seriesName: String(m.name || ""),
      team1: {
        id: String((m.teamInfo as Record<string, unknown>[])?.[0]?.id || ""),
        name: String((m.teamInfo as Record<string, unknown>[])?.[0]?.name || "TBA"),
        shortName: String((m.teamInfo as Record<string, unknown>[])?.[0]?.shortname || "TBA"),
        flag: "",
      },
      team2: {
        id: String((m.teamInfo as Record<string, unknown>[])?.[1]?.id || ""),
        name: String((m.teamInfo as Record<string, unknown>[])?.[1]?.name || "TBA"),
        shortName: String((m.teamInfo as Record<string, unknown>[])?.[1]?.shortname || "TBA"),
        flag: "",
      },
      score: {
        team1: {
          innings: [{
            runs: Number((m.score as Record<string, unknown>[])?.[0]?.r || 0),
            wickets: Number((m.score as Record<string, unknown>[])?.[0]?.w || 0),
            overs: Number((m.score as Record<string, unknown>[])?.[0]?.o || 0),
          }],
        },
        team2: {
          innings: [{
            runs: Number((m.score as Record<string, unknown>[])?.[1]?.r || 0),
            wickets: Number((m.score as Record<string, unknown>[])?.[1]?.w || 0),
            overs: Number((m.score as Record<string, unknown>[])?.[1]?.o || 0),
          }],
        },
      },
      result: String(m.status || ""),
    }
  }

  private mapMatchStatus(status: string): Match["status"] {
    const statusLower = (status || "").toLowerCase()
    if (statusLower.includes("live") || statusLower.includes("in progress")) return "live"
    if (statusLower.includes("upcoming") || statusLower.includes("scheduled")) return "upcoming"
    return "completed"
  }

  private transformSeries(data: unknown[]): Series[] {
    if (!Array.isArray(data)) return []
    return data.map(this.transformSeriesItem.bind(this)).filter(Boolean) as Series[]
  }

  private transformSeriesItem(item: unknown): Series | null {
    if (!item || typeof item !== "object") return null
    const s = item as Record<string, unknown>
    
    return {
      id: String(s.id || ""),
      name: String(s.name || ""),
      startDate: String(s.startDate || ""),
      endDate: String(s.endDate || ""),
      matchCount: Number(s.matches || 0),
      status: this.mapSeriesStatus(s),
      category: "international",
    }
  }

  private mapSeriesStatus(s: Record<string, unknown>): Series["status"] {
    const now = new Date()
    const start = new Date(String(s.startDate || ""))
    const end = new Date(String(s.endDate || ""))
    
    if (now < start) return "upcoming"
    if (now > end) return "completed"
    return "live"
  }

  private transformPlayers(data: unknown[]): Player[] {
    if (!Array.isArray(data)) return []
    return data.map(this.transformPlayer).filter(Boolean) as Player[]
  }

  private transformPlayer(item: unknown): Player | null {
    if (!item || typeof item !== "object") return null
    const p = item as Record<string, unknown>
    
    return {
      id: String(p.id || ""),
      name: String(p.name || ""),
      country: String(p.country || ""),
      countryCode: "",
      role: String(p.role || ""),
      battingStyle: String(p.battingStyle || ""),
      bowlingStyle: String(p.bowlingStyle || ""),
      dateOfBirth: String(p.dateOfBirth || ""),
      imageUrl: String(p.playerImg || ""),
    }
  }

  private transformTeams(data: unknown[]): Team[] {
    if (!Array.isArray(data)) return []
    return data.map((item, index) => {
      const t = item as Record<string, unknown>
      return {
        id: String(t.id || index),
        name: String(t.name || ""),
        shortName: String(t.genericName || t.name || "").substring(0, 3).toUpperCase(),
        flag: "",
        ranking: index + 1,
      }
    })
  }
}

// Singleton instance - only created server-side with API key
let cricketDataService: CricketDataService | null = null

export function getCricketDataService(): CricketDataService | null {
  const apiKey = process.env.CRICKET_API_KEY
  
  if (!apiKey) {
    return null
  }

  if (!cricketDataService) {
    cricketDataService = new CricketDataService({ apiKey })
  }

  return cricketDataService
}

export { CricketDataService }
