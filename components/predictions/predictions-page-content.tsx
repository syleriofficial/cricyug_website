"use client"

import { motion } from "framer-motion"
import useSWR from "swr"
import Link from "next/link"
import { Brain, Sparkles, BarChart3, Zap, Target, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMatches } from "@/hooks/use-cricket-data"
import type { AILiveInsight, AIMatchPreview, AIPrediction } from "@/lib/ai-cricket"
import type { Match } from "@/lib/types"

interface AIResponse<T> {
  data: T | null
  meta: {
    configured: boolean
    aiConfigured: boolean
    message?: string
    error?: string
  }
}

async function fetchAI<T>(url: string) {
  const response = await fetch(url)
  const json: AIResponse<T> = await response.json()
  if (!response.ok) throw new Error(json.meta?.error || json.meta?.message || "AI request failed")
  return json
}

export function PredictionsPageContent() {
  const { data: matches, isLoading: matchesLoading } = useMatches({ limit: 6 })
  const selectedMatch = matches.find((match) => match.status === "live") || matches.find((match) => match.status === "upcoming") || matches[0]
  const matchQuery = selectedMatch ? `?matchId=${encodeURIComponent(selectedMatch.id)}` : ""

  const { data: prediction, error: predictionError, isLoading: predictionLoading } = useSWR(
    selectedMatch ? `/api/ai/prediction${matchQuery}` : null,
    (url) => fetchAI<AIPrediction>(url),
    { refreshInterval: selectedMatch?.status === "live" ? 30000 : 120000 }
  )
  const { data: preview } = useSWR(
    selectedMatch ? `/api/ai/preview${matchQuery}` : null,
    (url) => fetchAI<AIMatchPreview>(url)
  )
  const { data: insight } = useSWR(
    selectedMatch ? `/api/ai/live-insights${matchQuery}` : null,
    (url) => fetchAI<AILiveInsight>(url),
    { refreshInterval: selectedMatch?.status === "live" ? 30000 : 120000 }
  )

  const predictionData = prediction?.data
  const previewData = preview?.data
  const insightData = insight?.data

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Predictions</h1>
              <p className="text-muted-foreground">Live cricket prediction, preview and match intelligence</p>
            </div>
          </div>
          {prediction && !prediction.meta.aiConfigured && (
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                AI provider key is not configured, so CricYug is using server-side cricket rules on official match data. Add OPENAI_API_KEY to enable language-model enhanced analysis.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Featured prediction</p>
                <h2 className="mt-1 text-2xl font-bold">{predictionData?.title || selectedMatchTitle(selectedMatch)}</h2>
              </div>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            {matchesLoading || predictionLoading ? (
              <div className="space-y-3">
                <div className="h-8 animate-pulse rounded bg-muted" />
                <div className="h-28 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : predictionError ? (
              <p className="text-sm text-muted-foreground">AI prediction is temporarily unavailable. Please try again in a moment.</p>
            ) : predictionData ? (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <ProbabilityCard label={selectedMatch?.team1.team.shortName || "Team 1"} value={predictionData.winProbability.team1} />
                  <ProbabilityCard label={selectedMatch?.team2.team.shortName || "Team 2"} value={predictionData.winProbability.team2} />
                </div>
                <div className="rounded-xl border border-border bg-background/35 p-4">
                  <p className="text-sm text-muted-foreground">Favorite</p>
                  <p className="mt-1 text-xl font-bold text-primary">{predictionData.favorite}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Confidence: {predictionData.confidence}</p>
                </div>
                <div className="mt-5 space-y-2">
                  {predictionData.factors.map((factor) => (
                    <p key={factor} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{factor}</p>
                  ))}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">{predictionData.disclaimer}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No match is available for AI prediction right now.</p>
            )}
          </motion.div>

          <div className="space-y-6">
            <InfoPanel icon={Target} title="AI Match Preview">
              <p className="text-sm text-muted-foreground">{previewData?.summary || "Preview will appear when match data is available."}</p>
              {previewData && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewData.keyFactors.map((item) => (
                    <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{item}</span>
                  ))}
                </div>
              )}
            </InfoPanel>

            <InfoPanel icon={Zap} title="Live Insight">
              <p className="text-sm text-muted-foreground">{insightData?.momentum || "Live insight will update once score data is available."}</p>
              {insightData && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Pressure:</span> {insightData.pressure}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Next phase:</span> {insightData.nextPhase}</p>
                </div>
              )}
            </InfoPanel>
          </div>
        </div>

        <h2 className="mb-4 mt-10 text-xl font-semibold">AI Tools Active</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ToolCard icon={TrendingUp} title="Prediction API" description="/api/ai/prediction returns win probability and factors." />
          <ToolCard icon={BarChart3} title="Preview API" description="/api/ai/preview creates match previews from official data." />
          <ToolCard icon={Brain} title="News Draft API" description="/api/ai/news-draft helps you write CricYug articles." />
        </div>

        {selectedMatch && (
          <div className="mt-8">
            <Link href={`/matches/${selectedMatch.id}`}>
              <Button className="gap-2">
                Open Match AI Analysis
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function selectedMatchTitle(match?: Match) {
  if (!match) return "No match selected"
  return `${match.team1.team.shortName} vs ${match.team2.team.shortName}`
}

function ProbabilityCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <p className="text-2xl font-black text-primary">{value}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function InfoPanel({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ToolCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
