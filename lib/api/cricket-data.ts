import type {
  BatsmanScore,
  BowlerScore,
  CommentaryItem,
  Innings,
  Match,
  MatchDetails,
  MatchFormat,
  Player,
  PlayerRole,
  PointsTableEntry,
  SearchResult,
  Series,
  Team,
  Venue,
} from "@/lib/types"

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

  private async request<T = any>(
    endpoint: string,
    params: Record<string, string> = {},
    options: { revalidate?: number } = {}
  ): Promise<T> {
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
        next: { revalidate: options.revalidate ?? 300 },
      })

      const text = await response.text()

      if (!response.ok) {
        throw new Error(`Cricket API ${response.status}: ${text.slice(0, 300)}`)
      }

      const json = JSON.parse(text)

      if (json?.status === "failure") {
        throw new Error(json.reason || `Cricket API failed for ${endpoint}`)
      }

      return json
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getCurrentMatches(): Promise<Match[]> {
    const result = await this.request("/currentMatches", { offset: "0" }, { revalidate: 30 })
    return this.transformMatches(result?.data || [])
  }

  async getMatches(status?: Match["status"]): Promise<Match[]> {
    if (status === "upcoming") {
      const result = await this.request("/matches", { offset: "0" }, { revalidate: 900 })
      return this.transformMatches(result?.data || []).filter((match) => match.status === "upcoming")
    }

    const currentMatches = await this.getCurrentMatches()

    if (status === "live" || status === "completed") {
      return currentMatches.filter((match) => match.status === status)
    }

    const upcomingResult = await this.request("/matches", { offset: "0" }, { revalidate: 900 }).catch(() => ({ data: [] }))
    const upcomingMatches = this.transformMatches(upcomingResult?.data || []).filter((match) => match.status === "upcoming")

    return this.dedupeMatches([...currentMatches, ...upcomingMatches])
  }

  async getMatchInfo(
    matchId: string,
    options: { includeScorecard?: boolean; includeCommentary?: boolean } = {}
  ): Promise<MatchDetails | null> {
    const [infoResult, scorecardResult, commentaryResult] = await Promise.allSettled([
      this.request("/match_info", { id: matchId }, { revalidate: 60 }),
      options.includeScorecard
        ? this.request("/match_scorecard", { id: matchId }, { revalidate: 300 })
        : Promise.resolve(null),
      options.includeCommentary
        ? this.request("/match_bbb", { id: matchId }, { revalidate: 30 })
        : Promise.resolve(null),
    ])

    const infoData = infoResult.status === "fulfilled" ? infoResult.value?.data : null
    const scorecardData = scorecardResult.status === "fulfilled" ? scorecardResult.value?.data : null
    const commentaryData = commentaryResult.status === "fulfilled" ? commentaryResult.value?.data : null
    const rawMatch = scorecardData || infoData

    const match = this.transformMatches(rawMatch ? [rawMatch] : [])[0]
    if (!match) return null

    return {
      ...match,
      scorecard: this.transformScorecard(scorecardData),
      commentary: this.transformCommentary(commentaryData),
      partnerships: [],
      fallOfWickets: [],
    }
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const result = await this.request("/players", { search: query, offset: "0" }, { revalidate: 86400 })
    const players: any[] = Array.isArray(result?.data) ? result.data : []

    return players.map<Player>((item: any) => ({
      id: String(item.id || item.playerId || item.name || ""),
      name: String(item.name || "Unknown Player"),
      shortName: String(item.name || "Player"),
      country: String(item.country || ""),
      countryCode: String(item.country || "").slice(0, 2).toUpperCase(),
      role: this.mapPlayerRole(item.role),
      image: item.playerImg,
    }))
  }

  async getPlayerInfo(playerId: string): Promise<Player | null> {
    const result = await this.request("/players_info", { id: playerId }, { revalidate: 86400 })
    const player = result?.data
    if (!player) return null

    return {
      id: String(player.id || playerId),
      name: String(player.name || "Unknown Player"),
      shortName: String(player.name || "Player"),
      country: String(player.country || ""),
      countryCode: String(player.country || "").slice(0, 2).toUpperCase(),
      role: this.mapPlayerRole(player.role),
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      dateOfBirth: player.dateOfBirth || player.dob,
      image: player.playerImg,
    }
  }

  async getCountries(): Promise<Team[]> {
    const result = await this.request("/countries", { offset: "0" }, { revalidate: 86400 })
    const countries: any[] = Array.isArray(result?.data) ? result.data : []

    return countries.map<Team>((item: any, index: number) => ({
      id: String(item.id || item.name || index),
      name: String(item.name || "Cricket Team"),
      shortName: String(item.name || "TBA").slice(0, 3).toUpperCase(),
      logo: item.genericFlag,
      flag: item.genericFlag,
      countryCode: String(item.id || item.name || "").toUpperCase(),
      ranking: index + 1,
    }))
  }

  async getSeriesList(type?: string): Promise<Series[]> {
    const result = await this.request("/series", type ? { type, offset: "0" } : { offset: "0" }, { revalidate: 3600 })
    const series: any[] = Array.isArray(result?.data) ? result.data : []

    return series.map<Series>((item: any) => {
      return this.transformSeries(item)
    })
  }

  async getSeriesStandings(_seriesId: string): Promise<PointsTableEntry[]> {
    const result = await this.request("/series_points", { id: _seriesId }, { revalidate: 900 })
    const points: any[] = Array.isArray(result?.data) ? result.data : []

    return points.map<PointsTableEntry>((item: any, index: number) => {
      const teamName = String(item.teamname || item.team || item.name || `Team ${index + 1}`)
      const played = Number(item.matches || item.played || item.p || 0)
      const won = Number(item.wins || item.won || item.w || 0)
      const lost = Number(item.loss || item.lost || item.l || 0)
      const tied = Number(item.ties || item.tied || item.t || 0)
      const noResult = Number(item.nr || item.noresult || item.noResult || 0)

      return {
        position: Number(item.rank || item.position || index + 1),
        team: {
          id: String(item.teamid || item.teamId || teamName),
          name: teamName,
          shortName: this.shortName(teamName),
          logo: item.img || item.teamImg,
          flag: item.img || item.teamImg,
        },
        played,
        won,
        lost,
        tied,
        noResult,
        netRunRate: Number(item.netrr || item.nrr || item.netRunRate || 0),
        points: Number(item.points || item.pts || won * 2 + tied),
        recentForm: this.parseRecentForm(item.form),
      }
    })
  }

  async getSeriesInfo(seriesId: string): Promise<Series | null> {
    const result = await this.request("/series_info", { id: seriesId }, { revalidate: 3600 })
    const info = result?.data?.info
    if (!info) return null

    const series = this.transformSeries(info)
    const matches = this.transformMatches(result?.data?.matchList || [])

    return {
      ...series,
      teams: this.extractTeams(matches),
      totalMatches: matches.length || series.totalMatches,
    }
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
          url: `/players/${player.id}`,
        })),
    ]
  }

  private transformMatches(data: unknown[]): Match[] {
    if (!Array.isArray(data)) return []

    return data.map((item) => {
      const m = item as any
      const teamInfo = Array.isArray(m.teamInfo) ? m.teamInfo : []
      const teams = Array.isArray(m.teams) ? m.teams : []
      const team1 = teamInfo[0] || { name: teams[0] }
      const team2 = teamInfo[1] || { name: teams[1] }
      const score1 = m.score?.[0]
      const score2 = m.score?.[1]
      const format = this.mapFormat(String(m.matchType || m.name || "T20"))
      const seriesName = this.seriesNameFromMatch(String(m.name || "Cricket Match"))

      return {
        id: String(m.id || ""),
        status: this.mapMatchStatus(m),
        format,
        series: {
          id: String(m.series_id || ""),
          name: seriesName,
          type: "bilateral",
          format,
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
            id: String(team1?.id || team1?.name || ""),
            name: String(team1?.name || "TBA"),
            shortName: String(team1?.shortname || this.shortName(team1?.name) || "TBA"),
            logo: String(team1?.img || ""),
            flag: String(team1?.img || ""),
          },
          score: score1 ? `${score1.r}/${score1.w}` : undefined,
          overs: score1 ? String(score1.o || "") : undefined,
          wickets: score1 ? Number(score1.w || 0) : undefined,
        },
        team2: {
          team: {
            id: String(team2?.id || team2?.name || ""),
            name: String(team2?.name || "TBA"),
            shortName: String(team2?.shortname || this.shortName(team2?.name) || "TBA"),
            logo: String(team2?.img || ""),
            flag: String(team2?.img || ""),
          },
          score: score2 ? `${score2.r}/${score2.w}` : undefined,
          overs: score2 ? String(score2.o || "") : undefined,
          wickets: score2 ? Number(score2.w || 0) : undefined,
        },
        result: String(m.status || ""),
        startTime: String(m.dateTimeGMT || m.date || ""),
        toss: m.tossWinner
          ? {
              winner: String(m.tossWinner),
              decision: String(m.tossChoice || "bat").toLowerCase().includes("bowl") ? "bowl" : "bat",
            }
          : undefined,
      }
    })
  }

  private transformScorecard(data: any): Innings[] {
    const scorecard: any[] = Array.isArray(data?.scorecard) ? data.scorecard : []
    const matchTeams = this.transformMatches(data ? [data] : [])[0]

    return scorecard.map<Innings>((inning: any, index: number) => {
      const battingTeamName = this.teamNameFromInning(inning.inning) || (index === 0 ? matchTeams?.team1.team.name : matchTeams?.team2.team.name) || "Batting Team"
      const bowlingTeam = index === 0 ? matchTeams?.team2.team : matchTeams?.team1.team
      const score = Array.isArray(data?.score) ? data.score[index] : null
      const batsmen: any[] = Array.isArray(inning.batting) ? inning.batting : []
      const bowlers: any[] = Array.isArray(inning.bowling) ? inning.bowling : []
      const extras = inning.extras || {}

      return {
        battingTeam: {
          id: battingTeamName,
          name: battingTeamName,
          shortName: this.shortName(battingTeamName),
        },
        bowlingTeam: bowlingTeam || {
          id: "bowling-team",
          name: "Bowling Team",
          shortName: "BOWL",
        },
        batsmen: batsmen.map<BatsmanScore>((row: any) => ({
          player: this.playerFromApi(row.batsman),
          runs: Number(row.r || 0),
          balls: Number(row.b || 0),
          fours: Number(row["4s"] || 0),
          sixes: Number(row["6s"] || 0),
          strikeRate: Number(row.sr || 0),
          dismissal: row["dismissal-text"] || row.dismissal || "not out",
          isNotOut: !row.dismissal,
        })),
        bowlers: bowlers.map<BowlerScore>((row: any) => ({
          player: this.playerFromApi(row.bowler),
          overs: String(row.o || "0"),
          maidens: Number(row.m || 0),
          runs: Number(row.r || 0),
          wickets: Number(row.w || 0),
          economy: Number(row.eco || 0),
          wides: Number(row.wd || 0),
          noBalls: Number(row.nb || 0),
        })),
        extras: {
          byes: Number(extras.b || extras.byes || 0),
          legByes: Number(extras.lb || extras.legByes || 0),
          wides: Number(extras.wd || extras.wides || 0),
          noBalls: Number(extras.nb || extras.noBalls || 0),
          penalty: Number(extras.p || extras.penalty || 0),
          total: Number(extras.total || extras.r || 0),
        },
        total: score ? `${score.r}/${score.w}` : String(inning.totals?.R || ""),
        overs: score ? String(score.o || "") : String(inning.totals?.O || ""),
        runRate: score?.o ? Number(score.r || 0) / Number(score.o || 1) : 0,
      }
    })
  }

  private transformCommentary(data: any): CommentaryItem[] {
    const balls: any[] = Array.isArray(data?.bbb)
      ? data.bbb
      : Array.isArray(data?.commentary)
        ? data.commentary
        : Array.isArray(data)
          ? data
          : []

    return balls.map<CommentaryItem>((ball: any, index: number) => {
      const over = String(ball.over || ball.o || "")
      const runs = Number(ball.runs || ball.r || 0)
      const text = String(ball.commentary || ball.text || ball.comment || ball.event || "")

      return {
        id: String(ball.id || `${over}-${index}`),
        over,
        ball: String(ball.ball || ball.b || ""),
        text,
        runs,
        isWicket: Boolean(ball.wicket || /wicket/i.test(text)),
        isBoundary: runs === 4,
        isSix: runs === 6,
        timestamp: String(ball.timestamp || ball.date || ""),
      }
    })
  }

  private transformSeries(item: any): Series {
    const startDate = String(item.startDate || item.startdate || item.date || "")
    const endDate = this.normalizeEndDate(String(item.endDate || item.enddate || item.date || ""), startDate)
    const now = Date.now()
    const start = startDate ? Date.parse(startDate) : Number.NaN
    const end = endDate ? Date.parse(endDate) : Number.NaN
    const status: Series["status"] =
      Number.isFinite(start) && start > now
        ? "upcoming"
        : Number.isFinite(end) && end < now
          ? "completed"
          : "ongoing"

    return {
      id: String(item.id || item.series_id || item.name || ""),
      name: String(item.name || "Cricket Series"),
      shortName: String(item.name || "Series"),
      type: Number(item.t20 || 0) > 10 ? "league" : "tournament",
      format: this.inferSeriesFormat(item),
      status,
      startDate,
      endDate,
      totalMatches: Number(item.matches || 0),
      teams: [],
    }
  }

  private mapMatchStatus(match: any): Match["status"] {
    if (match.matchStarted && !match.matchEnded) return "live"
    if (!match.matchStarted) return "upcoming"
    return "completed"
  }

  private dedupeMatches(matches: Match[]) {
    const byId = new Map<string, Match>()
    matches.forEach((match) => {
      if (match.id) byId.set(match.id, match)
    })
    return Array.from(byId.values())
  }

  private mapFormat(value: string): MatchFormat {
    const v = value.toLowerCase()
    if (v.includes("test")) return "Test"
    if (v.includes("odi")) return "ODI"
    if (v.includes("t10")) return "T10"
    return "T20"
  }

  private inferSeriesFormat(item: any): MatchFormat {
    if (Number(item.test || 0) > 0) return "Test"
    if (Number(item.odi || 0) > 0) return "ODI"
    return "T20"
  }

  private mapPlayerRole(value: unknown): PlayerRole {
    const role = String(value || "").toLowerCase()
    if (role.includes("bowl")) return "Bowler"
    if (role.includes("all")) return "All-rounder"
    if (role.includes("keeper") || role.includes("wicket")) return "Wicket-keeper"
    return "Batsman"
  }

  private playerFromApi(player: any): Player {
    const name = String(player?.name || "Unknown Player")

    return {
      id: String(player?.id || name),
      name,
      shortName: name,
      country: "",
      countryCode: "",
      role: "Batsman",
    }
  }

  private parseRecentForm(value: unknown): ("W" | "L" | "T" | "NR")[] {
    if (!value) return []
    return String(value)
      .split(/[,\s-]+/)
      .map((item) => item.toUpperCase())
      .filter((item): item is "W" | "L" | "T" | "NR" => ["W", "L", "T", "NR"].includes(item))
  }

  private extractTeams(matches: Match[]): Team[] {
    const teams = new Map<string, Team>()
    matches.forEach((match) => {
      teams.set(match.team1.team.name, match.team1.team)
      teams.set(match.team2.team.name, match.team2.team)
    })
    return Array.from(teams.values())
  }

  private seriesNameFromMatch(matchName: string) {
    const parts = matchName.split(",").map((part) => part.trim()).filter(Boolean)
    return parts.length > 2 ? parts.slice(2).join(", ") : matchName
  }

  private teamNameFromInning(inning: unknown) {
    const value = String(inning || "")
    return value.replace(/\s+Inning.*$/i, "").split(",")[0]?.trim()
  }

  private shortName(value: unknown) {
    const name = String(value || "TBA").trim()
    const words = name.split(/\s+/).filter(Boolean)
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
    return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase()
  }

  private normalizeEndDate(endDate: string, startDate: string) {
    if (!endDate || /\d{4}/.test(endDate)) return endDate
    const year = startDate.match(/\d{4}/)?.[0]
    return year ? `${endDate} ${year}` : endDate
  }
}

export function getCricketDataService() {
  const apiKey = process.env.CRICKETDATA_API_KEY

  if (!apiKey) return null

  return new CricketDataService({
    apiKey,
    timeout: 15000,
  })
}
