import type { Match, MatchDetails, SearchResult } from "@/lib/types"

export interface AIPrediction {
  matchId: string
  title: string
  status: Match["status"]
  provider: "openai" | "cricyug-rules"
  favorite: string
  confidence: "low" | "medium" | "high"
  winProbability: {
    team1: number
    team2: number
  }
  factors: string[]
  disclaimer: string
}

export interface AIMatchPreview {
  matchId: string
  title: string
  provider: "openai" | "cricyug-rules"
  summary: string
  keyFactors: string[]
  watchList: string[]
}

export interface AILiveInsight {
  matchId: string
  title: string
  provider: "openai" | "cricyug-rules"
  momentum: string
  pressure: string
  nextPhase: string
  bullets: string[]
}

export interface AINewsDraft {
  provider: "openai" | "cricyug-rules"
  title: string
  excerpt: string
  content: string
  seoTitle: string
  metaDescription: string
  tags: string[]
}

const DISCLAIMER = "Predictions are informational cricket insights only and must not be used for betting or gambling."

function matchTitle(match: Match) {
  return `${match.team1.team.shortName} vs ${match.team2.team.shortName}`
}

function scoreRuns(score?: string) {
  if (!score) return 0
  const [runs] = score.split("/")
  return Number(runs.replace(/[^\d]/g, "")) || 0
}

function scoreWickets(score?: string) {
  if (!score) return 0
  const [, wickets] = (score || "").split("/")
  return Number(wickets?.replace(/[^\d]/g, "")) || 0
}

function oversValue(overs?: string) {
  if (!overs) return 0
  const [whole = 0, balls = 0] = overs.split(".").map((part) => Number(part) || 0)
  return whole + Math.min(balls, 5) / 6
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function roundProbability(team1: number) {
  const safeInput = Number.isFinite(team1) ? team1 : 50
  const safeTeam1 = Math.round(clamp(safeInput, 12, 88))
  return { team1: safeTeam1, team2: 100 - safeTeam1 }
}

function normalizePrediction(candidate: Partial<AIPrediction> | null, fallback: AIPrediction): AIPrediction {
  if (!candidate) return fallback
  const rawTeam1 = Number(candidate.winProbability?.team1)
  const probabilities = roundProbability(Number.isFinite(rawTeam1) ? rawTeam1 : fallback.winProbability.team1)
  const favorite =
    typeof candidate.favorite === "string" && candidate.favorite.trim()
      ? candidate.favorite
      : probabilities.team1 >= probabilities.team2
        ? fallback.favorite
        : fallback.favorite

  return {
    ...fallback,
    ...candidate,
    favorite,
    confidence: candidate.confidence === "high" || candidate.confidence === "medium" || candidate.confidence === "low"
      ? candidate.confidence
      : fallback.confidence,
    provider: candidate.provider === "openai" ? "openai" : fallback.provider,
    winProbability: probabilities,
    factors: Array.isArray(candidate.factors) && candidate.factors.length > 0 ? candidate.factors : fallback.factors,
    disclaimer: DISCLAIMER,
  }
}

function fallbackPrediction(match: Match): AIPrediction {
  const title = matchTitle(match)
  const team1Runs = scoreRuns(match.team1.score)
  const team2Runs = scoreRuns(match.team2.score)
  const team1Overs = oversValue(match.team1.overs)
  const team2Overs = oversValue(match.team2.overs)
  const team1Wickets = scoreWickets(match.team1.score)
  const team2Wickets = scoreWickets(match.team2.score)

  let team1Probability = 50
  const factors = [
    `${match.format} format changes scoring risk and chase pressure.`,
    match.venue?.name ? `Venue context: ${match.venue.name}.` : "Venue data is limited for this match.",
  ]

  if (match.status === "live" && (team1Runs || team2Runs)) {
    const runDiff = team1Runs - team2Runs
    const wicketDiff = team2Wickets - team1Wickets
    const overDiff = team2Overs - team1Overs
    team1Probability = 50 + runDiff * 0.16 + wicketDiff * 3 - overDiff * 1.2
    factors.push(`Current score impact: ${match.team1.team.shortName} ${match.team1.score || "yet to bat"} vs ${match.team2.team.shortName} ${match.team2.score || "yet to bat"}.`)
    if (match.team1.overs || match.team2.overs) factors.push("Overs used and wickets in hand are driving the live probability.")
  } else if (match.status === "completed" && match.result) {
    const team1Won = match.result.toLowerCase().includes(match.team1.team.name.toLowerCase()) || match.result.toLowerCase().includes(match.team1.team.shortName.toLowerCase())
    const team2Won = match.result.toLowerCase().includes(match.team2.team.name.toLowerCase()) || match.result.toLowerCase().includes(match.team2.team.shortName.toLowerCase())
    team1Probability = team1Won ? 82 : team2Won ? 18 : 50
    factors.push(match.result)
  } else {
    factors.push("Pre-match prediction is balanced because detailed player form and pitch data are not available from the provider yet.")
    if (match.toss) factors.push(`${match.toss.winner} won the toss and chose to ${match.toss.decision}.`)
  }

  const probabilities = roundProbability(team1Probability)
  const favorite = probabilities.team1 >= probabilities.team2 ? match.team1.team.name : match.team2.team.name
  const confidence: AIPrediction["confidence"] =
    Math.abs(probabilities.team1 - probabilities.team2) >= 34 ? "high" : Math.abs(probabilities.team1 - probabilities.team2) >= 16 ? "medium" : "low"

  return {
    matchId: match.id,
    title,
    status: match.status,
    provider: "cricyug-rules",
    favorite,
    confidence,
    winProbability: probabilities,
    factors,
    disclaimer: DISCLAIMER,
  }
}

function fallbackPreview(match: Match): AIMatchPreview {
  const title = matchTitle(match)
  const timing =
    match.status === "live"
      ? "is live now"
      : match.status === "upcoming"
        ? `starts ${match.startTime || "soon"}`
        : "has finished"

  return {
    matchId: match.id,
    title,
    provider: "cricyug-rules",
    summary: `${title} ${timing} in the ${match.series.name}. CricYug will track the score, venue context and innings pressure as official data updates.`,
    keyFactors: [
      `${match.format} match tempo`,
      match.venue?.name ? `Conditions at ${match.venue.name}` : "Venue and pitch data when available",
      match.status === "live" ? "Wickets in hand and scoring rate" : "Toss, batting order and early powerplay control",
    ],
    watchList: [match.team1.team.name, match.team2.team.name],
  }
}

function fallbackLiveInsight(match: Match | MatchDetails): AILiveInsight {
  const title = matchTitle(match)
  const team1Runs = scoreRuns(match.team1.score)
  const team2Runs = scoreRuns(match.team2.score)
  const runGap = Math.abs(team1Runs - team2Runs)
  const hasScores = Boolean(match.team1.score || match.team2.score)

  return {
    matchId: match.id,
    title,
    provider: "cricyug-rules",
    momentum: hasScores
      ? runGap < 15
        ? "Momentum is close because the score gap is narrow."
        : `${team1Runs >= team2Runs ? match.team1.team.shortName : match.team2.team.shortName} currently has the scoreboard edge.`
      : "Momentum will appear once official scoring begins.",
    pressure:
      match.status === "live"
        ? "Pressure depends on wickets in hand, required rate and the next two overs."
        : "Pressure read is limited until the match is live.",
    nextPhase:
      match.status === "live"
        ? "Watch the next bowling change and boundary frequency for a momentum shift."
        : "Watch toss, playing XI and first innings start for stronger insight.",
    bullets: [
      match.team1.score ? `${match.team1.team.shortName}: ${match.team1.score}${match.team1.overs ? ` in ${match.team1.overs} ov` : ""}` : `${match.team1.team.shortName}: yet to bat`,
      match.team2.score ? `${match.team2.team.shortName}: ${match.team2.score}${match.team2.overs ? ` in ${match.team2.overs} ov` : ""}` : `${match.team2.team.shortName}: yet to bat`,
      match.result || `${match.format} match in ${match.series.name}`,
    ],
  }
}

function fallbackNewsDraft(input: { headline?: string; notes?: string; category?: string }): AINewsDraft {
  const title = input.headline?.trim() || "Cricket update from CricYug"
  const notes = input.notes?.trim() || "Add match details, team context and key moments before publishing."
  const category = input.category?.trim() || "Analysis"

  return {
    provider: "cricyug-rules",
    title,
    excerpt: notes.length > 150 ? `${notes.slice(0, 147)}...` : notes,
    content: `${title}\n\n${notes}\n\nCricYug Desk will update this story with confirmed team news, official score details and post-match reaction as they become available.`,
    seoTitle: `${title} | CricYug`,
    metaDescription: notes.length > 155 ? notes.slice(0, 152) + "..." : notes,
    tags: [category, "Cricket", "CricYug"].filter(Boolean),
  }
}

async function openAIJson<T>(system: string, user: string): Promise<T | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      next: { revalidate: 0 },
    })

    if (!response.ok) return null
    const json = await response.json()
    const content = json?.choices?.[0]?.message?.content
    if (!content) return null
    return JSON.parse(content) as T
  } catch (error) {
    console.error("[CricYug] AI provider failed:", error)
    return null
  }
}

export async function createPrediction(match: Match): Promise<AIPrediction> {
  const fallback = fallbackPrediction(match)
  const enhanced = await openAIJson<AIPrediction>(
    "You are CricYug's cricket analyst. Return strict JSON matching the provided object shape. Do not mention betting. Keep probabilities realistic and based only on given data.",
    JSON.stringify({ task: "match_prediction", fallback, match })
  )

  return enhanced ? normalizePrediction({ ...enhanced, provider: "openai" }, fallback) : fallback
}

export async function createMatchPreview(match: Match): Promise<AIMatchPreview> {
  const fallback = fallbackPreview(match)
  const enhanced = await openAIJson<AIMatchPreview>(
    "You are CricYug's cricket preview writer. Return strict JSON matching the fallback object shape. Use only supplied match data.",
    JSON.stringify({ task: "match_preview", fallback, match })
  )

  return enhanced ? { ...fallback, ...enhanced, provider: "openai" } : fallback
}

export async function createLiveInsight(match: Match | MatchDetails): Promise<AILiveInsight> {
  const fallback = fallbackLiveInsight(match)
  const enhanced = await openAIJson<AILiveInsight>(
    "You are CricYug's live cricket analyst. Return strict JSON matching the fallback object shape. Be concise and factual.",
    JSON.stringify({ task: "live_insight", fallback, match })
  )

  return enhanced ? { ...fallback, ...enhanced, provider: "openai" } : fallback
}

export async function createNewsDraft(input: { headline?: string; notes?: string; category?: string }): Promise<AINewsDraft> {
  const fallback = fallbackNewsDraft(input)
  const enhanced = await openAIJson<AINewsDraft>(
    "You are CricYug's editorial assistant. Return strict JSON matching the fallback object shape. Do not invent scores or quotes. Use only user notes.",
    JSON.stringify({ task: "news_draft", fallback, input })
  )

  return enhanced ? { ...fallback, ...enhanced, provider: "openai" } : fallback
}

export async function createAISearchAnswer(query: string, results: SearchResult[]) {
  const fallback = {
    provider: "cricyug-rules" as const,
    answer: results.length
      ? `I found ${results.length} CricYug result${results.length === 1 ? "" : "s"} for "${query}". Open the best match below for details.`
      : `No CricYug result matched "${query}" yet. Try a team, player, series, or match name.`,
    results,
  }

  const enhanced = await openAIJson<typeof fallback>(
    "You are CricYug's search assistant. Return strict JSON with provider, answer, and results. Use only supplied results.",
    JSON.stringify({ task: "search_answer", query, results, fallback })
  )

  return enhanced ? { ...fallback, ...enhanced, provider: "openai" as const } : fallback
}
