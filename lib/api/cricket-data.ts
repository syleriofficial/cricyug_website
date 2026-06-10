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
    const result = await this.request("/currentMatches", { offset: "0" }, { revalidate: 15 })
    return this.transformMatches(result?.data || [])
  }

  async getMatches(status?: Match["status"]): Promise<Match[]> {
    if (status === "upcoming") {
      const result = await this.request("/matches", { offset: "0" }, { revalidate: 60 })
      return this.transformMatches(result?.data || []).filter((match) => match.status === "upcoming")
    }

    const currentMatches = await this.getCurrentMatches()

    if (status === "live" || status === "completed") {
      return currentMatches.filter((match) => match.status === status)
    }

    const upcomingResult = await this.request("/matches", { offset: "0" }, { revalidate: 60 }).catch(() => ({ data: [] }))
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

    return players.map<Player>((item: any) => {
      const name = String(item.name || "Unknown Player")
      const country = this.knownPlayerCountry(name) || String(item.country || "")
      return {
        id: String(item.id || item.playerId || name || ""),
        name,
        shortName: name,
        country,
        countryCode: this.countryCode(country),
        role: this.knownPlayerRole(name) || this.mapPlayerRole(item.role),
        image: item.playerImg,
      }
    })
  }

  async getFeaturedPlayers(role?: PlayerRole): Promise<Player[]> {
    const seedsByRole: Record<PlayerRole, string[]> = {
      Batsman: ["Virat Kohli", "Rohit Sharma", "Babar Azam", "Steve Smith", "Kane Williamson", "Joe Root"],
      Bowler: ["Jasprit Bumrah", "Mitchell Starc", "Shaheen Afridi", "Rashid Khan", "Pat Cummins", "Trent Boult"],
      "All-rounder": ["Hardik Pandya", "Ben Stokes", "Shakib Al Hasan", "Ravindra Jadeja", "Glenn Maxwell", "Wanindu Hasaranga"],
      "Wicket-keeper": ["MS Dhoni", "Rishabh Pant", "Jos Buttler", "Mohammad Rizwan", "Quinton de Kock", "Sanju Samson"],
    }
    const seeds = role ? seedsByRole[role] : Object.values(seedsByRole).flat()
    const results = await Promise.all(seeds.map((seed) => this.searchPlayers(seed).catch(() => [])))
    const players = this.dedupePlayers(results.flat())
    return role ? players.filter((player) => player.role === role) : players
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
    const offsets = ["0", "25", "50", "75", "100", "125"]
    const results = await Promise.all(
      offsets.map((offset) => this.request("/countries", { offset }, { revalidate: 86400 }).catch(() => ({ data: [] })))
    )
    const countries: any[] = results.flatMap((result) => (Array.isArray(result?.data) ? result.data : []))
    const priority = [
      "India",
      "Australia",
      "England",
      "South Africa",
      "New Zealand",
      "Pakistan",
      "Sri Lanka",
      "Bangladesh",
      "West Indies",
      "Afghanistan",
      "Ireland",
      "Zimbabwe",
      "Netherlands",
      "Scotland",
      "United States of America",
      "Canada",
      "Nepal",
      "Namibia",
      "United Arab Emirates",
    ]

    const providerTeams = countries.map<Team>((item: any, index: number) => ({
      id: String(item.id || item.name || index),
      name: String(item.name || "Cricket Team"),
      shortName: this.teamShortName(String(item.name || "TBA")),
      logo: item.genericFlag,
      flag: item.genericFlag,
      countryCode: String(item.id || item.name || "").toUpperCase(),
    }))
    const teams = this.dedupeTeams([...this.curatedCricketTeams(), ...providerTeams])

    return teams.sort((a, b) => {
      const aPriority = priority.indexOf(a.name)
      const bPriority = priority.indexOf(b.name)
      if (aPriority !== -1 || bPriority !== -1) {
        return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority)
      }
      return a.name.localeCompare(b.name)
    })
  }

  async getSeriesList(type?: string): Promise<Series[]> {
    const offsets = ["0", "25", "50", "75", "100", "150", "200"]
    const results = await Promise.all(
      offsets.map((offset) =>
        this.request("/series", type ? { type, offset } : { offset }, { revalidate: 3600 }).catch(() => ({ data: [] }))
      )
    )
    const series: any[] = results.flatMap((result) => (Array.isArray(result?.data) ? result.data : []))

    return this.dedupeSeries(series.map<Series>((item: any) => this.transformSeries(item)))
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

      const team1Name = String(team1?.name || "TBA")
      const team2Name = String(team2?.name || "TBA")
      const team1ScoreText = score1 ? `${score1.r}/${score1.w}` : undefined
      const team2ScoreText = score2 ? `${score2.r}/${score2.w}` : undefined

      return {
        id: String(m.id || ""),
        status: this.mapMatchStatus(m),
        format,
        series: {
          id: String(m.series_id || ""),
          name: seriesName,
          type: "bilateral",
          category: this.inferSeriesCategory(seriesName),
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
            name: team1Name,
            shortName: String(team1?.shortname || this.shortName(team1?.name) || "TBA"),
            logo: String(team1?.img || ""),
            flag: String(team1?.img || ""),
          },
          score: team1ScoreText,
          overs: score1 ? String(score1.o || "") : undefined,
          wickets: score1 ? Number(score1.w || 0) : undefined,
        },
        team2: {
          team: {
            id: String(team2?.id || team2?.name || ""),
            name: team2Name,
            shortName: String(team2?.shortname || this.shortName(team2?.name) || "TBA"),
            logo: String(team2?.img || ""),
            flag: String(team2?.img || ""),
          },
          score: team2ScoreText,
          overs: score2 ? String(score2.o || "") : undefined,
          wickets: score2 ? Number(score2.w || 0) : undefined,
        },
        result: this.normalizeMatchResult(String(m.status || ""), {
          status: this.mapMatchStatus(m),
          team1Name,
          team2Name,
          score1,
          score2,
        }),
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
      category: this.inferSeriesCategory(String(item.name || "")),
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

  private dedupeSeries(series: Series[]) {
    const byId = new Map<string, Series>()
    series.forEach((item) => {
      if (item.id) byId.set(item.id, item)
    })
    return Array.from(byId.values())
  }

  private dedupeTeams(teams: Team[]) {
    const byId = new Map<string, Team>()
    teams.forEach((team) => {
      const key = team.id || team.countryCode || team.name
      if (key) byId.set(key.toLowerCase(), team)
    })
    return Array.from(byId.values())
  }

  private dedupePlayers(players: Player[]) {
    const byId = new Map<string, Player>()
    players.forEach((player) => {
      const key = player.name || player.id
      if (key) byId.set(key.toLowerCase(), player)
    })
    return Array.from(byId.values())
  }

  private teamShortName(name: string) {
    const known: Record<string, string> = {
      Afghanistan: "AFG",
      Australia: "AUS",
      Bangladesh: "BAN",
      England: "ENG",
      India: "IND",
      Ireland: "IRE",
      "New Zealand": "NZ",
      Pakistan: "PAK",
      "South Africa": "SA",
      "Sri Lanka": "SL",
      "West Indies": "WI",
      Zimbabwe: "ZIM",
      Netherlands: "NED",
      Scotland: "SCO",
      "United States of America": "USA",
      "United Arab Emirates": "UAE",
    }
    return known[name] || this.shortName(name)
  }

  private curatedCricketTeams(): Team[] {
    const teams = [
      ["af", "Afghanistan", "AFG", "AF"],
      ["au", "Australia", "AUS", "AU"],
      ["bd", "Bangladesh", "BAN", "BD"],
      ["eng", "England", "ENG", "ENG"],
      ["in", "India", "IND", "IN"],
      ["ie", "Ireland", "IRE", "IE"],
      ["nz", "New Zealand", "NZ", "NZ"],
      ["pk", "Pakistan", "PAK", "PK"],
      ["za", "South Africa", "SA", "ZA"],
      ["lk", "Sri Lanka", "SL", "LK"],
      ["wi", "West Indies", "WI", "WI"],
      ["zw", "Zimbabwe", "ZIM", "ZW"],
    ]

    return teams.map(([id, name, shortName, countryCode]) => ({
      id,
      name,
      shortName,
      countryCode,
      logo: id === "wi" || id === "eng" ? undefined : `https://cdorg.b-cdn.net/flags/generic/${countryCode}.svg`,
      flag: id === "wi" || id === "eng" ? undefined : `https://cdorg.b-cdn.net/flags/generic/${countryCode}.svg`,
    }))
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

  private inferSeriesCategory(name: string): Series["category"] {
    const value = name.toLowerCase()
    if (value.includes("women") || /\bw\b/.test(value)) return "women"
    if (
      value.includes("premier league") ||
      value.includes("big bash") ||
      value.includes("hundred") ||
      value.includes("sa20") ||
      value.includes("ilt20") ||
      value.includes("psl") ||
      value.includes("bpl") ||
      value.includes("lpl") ||
      value.includes("mlc") ||
      value.includes("super smash") ||
      value.includes("t20 blast") ||
      value.includes("maharaja trophy") ||
      value.includes("global super league") ||
      value.includes("legends")
    ) {
      return "league"
    }
    if (
      value.includes("ranji") ||
      value.includes("county") ||
      value.includes("domestic") ||
      value.includes("trophy") ||
      value.includes("cup") ||
      value.includes("shield")
    ) {
      return "domestic"
    }
    return "international"
  }

  private normalizeMatchResult(
    providerResult: string,
    context: {
      status: Match["status"]
      team1Name: string
      team2Name: string
      score1?: { r?: number | string; w?: number | string }
      score2?: { r?: number | string; w?: number | string }
    }
  ) {
    if (context.status !== "completed" || !context.score1 || !context.score2) return providerResult

    const team1Runs = Number(context.score1.r || 0)
    const team2Runs = Number(context.score2.r || 0)
    const team2Wickets = Number(context.score2.w || 0)
    if (!Number.isFinite(team1Runs) || !Number.isFinite(team2Runs) || team1Runs === team2Runs) return providerResult

    const inferredWinner = team1Runs > team2Runs ? context.team1Name : context.team2Name
    const losingTeam = team1Runs > team2Runs ? context.team2Name : context.team1Name
    const providerLower = providerResult.toLowerCase()
    const contradictsScore =
      providerLower.includes(losingTeam.toLowerCase()) &&
      !providerLower.includes(inferredWinner.toLowerCase())

    if (!contradictsScore) return providerResult
    if (team1Runs > team2Runs) return `${context.team1Name} won by ${team1Runs - team2Runs} runs`
    return `${context.team2Name} won by ${Math.max(10 - team2Wickets, 0)} wickets`
  }

  private mapPlayerRole(value: unknown): PlayerRole {
    const role = String(value || "").toLowerCase()
    if (role.includes("bowl")) return "Bowler"
    if (role.includes("all")) return "All-rounder"
    if (role.includes("keeper") || role.includes("wicket")) return "Wicket-keeper"
    return "Batsman"
  }

  private knownPlayerRole(name: string): PlayerRole | null {
    const normalized = name.toLowerCase()
    const roles: Array<[PlayerRole, string[]]> = [
      ["Wicket-keeper", ["dhoni", "rishabh pant", "buttler", "rizwan", "de kock", "sanju samson", "kl rahul", "jonny bairstow"]],
      ["All-rounder", ["hardik", "ben stokes", "shakib", "jadeja", "glenn maxwell", "hasaranga", "marsh", "moin ali", "moeen ali", "sam curran"]],
      ["Bowler", ["bumrah", "starc", "shaheen", "rashid khan", "pat cummins", "trent boult", "rabada", "archer", "shami", "siraj"]],
      ["Batsman", ["virat", "rohit", "babar", "steve smith", "kane williamson", "joe root", "warner", "gill", "suryakumar"]],
    ]

    return roles.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0] || null
  }

  private knownPlayerCountry(name: string) {
    const normalized = name.toLowerCase()
    const countries: Array<[string, string[]]> = [
      ["India", ["virat", "rohit", "bumrah", "hardik", "rishabh pant", "dhoni", "jadeja", "sanju samson"]],
      ["Pakistan", ["babar", "shaheen", "rizwan"]],
      ["Afghanistan", ["rashid khan"]],
      ["Australia", ["steve smith", "starc", "pat cummins", "glenn maxwell", "warner"]],
      ["England", ["joe root", "ben stokes", "jos buttler"]],
      ["New Zealand", ["kane williamson", "trent boult"]],
      ["Bangladesh", ["shakib"]],
      ["Sri Lanka", ["hasaranga"]],
      ["South Africa", ["de kock", "rabada"]],
    ]
    return countries.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0]
  }

  private countryCode(country: string) {
    const known: Record<string, string> = {
      Afghanistan: "AFG",
      Australia: "AUS",
      Bangladesh: "BAN",
      England: "ENG",
      India: "IND",
      Ireland: "IRE",
      "New Zealand": "NZ",
      Pakistan: "PAK",
      "South Africa": "SA",
      "Sri Lanka": "SL",
      "West Indies": "WI",
      Zimbabwe: "ZIM",
      Netherlands: "NED",
      Nepal: "NEP",
    }
    return known[country] || country.slice(0, 2).toUpperCase()
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
