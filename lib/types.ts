// CricYug API Types - Production Ready
// Compatible with CricketData.org API structure

export type MatchStatus = "live" | "upcoming" | "completed"
export type MatchFormat = "Test" | "ODI" | "T20" | "T10"
export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"

export interface Team {
  id: string
  name: string
  shortName: string
  logo?: string
  flag?: string
  countryCode?: string
  ranking?: number
}

export interface TeamScore {
  team: Team
  score?: string
  overs?: string
  wickets?: number
  runRate?: number
}

export interface Match {
  id: string
  status: MatchStatus
  format: MatchFormat
  series: Series
  venue: Venue
  team1: TeamScore
  team2: TeamScore
  result?: string
  startTime?: string
  toss?: {
    winner: string
    decision: "bat" | "bowl"
  }
  currentInnings?: number
  dayNumber?: number // For Test matches
}

export interface MatchDetails extends Match {
  scorecard: Innings[]
  commentary: CommentaryItem[]
  partnerships: Partnership[]
  fallOfWickets: FallOfWicket[]
}

export interface Innings {
  battingTeam: Team
  bowlingTeam: Team
  batsmen: BatsmanScore[]
  bowlers: BowlerScore[]
  extras: Extras
  total: string
  overs: string
  runRate: number
  declared?: boolean
}

export interface BatsmanScore {
  player: Player
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: number
  dismissal?: string
  isOnStrike?: boolean
  isNotOut?: boolean
}

export interface BowlerScore {
  player: Player
  overs: string
  maidens: number
  runs: number
  wickets: number
  economy: number
  wides: number
  noBalls: number
}

export interface Extras {
  byes: number
  legByes: number
  wides: number
  noBalls: number
  penalty: number
  total: number
}

export interface CommentaryItem {
  id: string
  over: string
  ball: string
  text: string
  runs?: number
  isWicket?: boolean
  isBoundary?: boolean
  isSix?: boolean
  timestamp: string
}

export interface Partnership {
  batsman1: Player
  batsman2: Player
  runs: number
  balls: number
  wicket: number
}

export interface FallOfWicket {
  player: Player
  score: string
  overs: string
  wicketNumber: number
}

export interface Player {
  id: string
  name: string
  shortName: string
  country: string
  countryCode: string
  role: PlayerRole
  battingStyle?: string
  bowlingStyle?: string
  dateOfBirth?: string
  image?: string
}

export interface PlayerStats {
  player: Player
  format: MatchFormat
  batting: {
    matches: number
    innings: number
    runs: number
    notOuts: number
    highestScore: string
    average: number
    strikeRate: number
    centuries: number
    fifties: number
    fours: number
    sixes: number
  }
  bowling: {
    matches: number
    innings: number
    overs: string
    runs: number
    wickets: number
    bestBowling: string
    average: number
    economy: number
    strikeRate: number
    fiveWickets: number
    tenWickets: number
  }
}

export interface Series {
  id: string
  name: string
  shortName?: string
  type: "bilateral" | "tournament" | "league"
  category?: "international" | "league" | "domestic" | "women"
  format: MatchFormat
  status: "upcoming" | "ongoing" | "completed"
  startDate: string
  endDate: string
  totalMatches: number
  teams: Team[]
}

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  capacity?: number
}

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content?: string
  image?: string
  category: string
  author?: string
  publishedAt: string
  source?: string
  tags?: string[]
}

export interface PointsTableEntry {
  position: number
  team: Team
  played: number
  won: number
  lost: number
  tied: number
  noResult: number
  netRunRate: number
  points: number
  recentForm: ("W" | "L" | "T" | "NR")[]
}

export interface Ranking {
  position: number
  team?: Team
  player?: Player
  rating: number
  previousPosition?: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Search Types
export interface SearchResult {
  type: "match" | "player" | "team" | "series" | "news"
  id: string
  title: string
  subtitle?: string
  image?: string
  url: string
}
