"use client"

import { motion } from "framer-motion"
import useSWR from "swr"
import { Brain, TrendingUp, Target, Zap, BarChart2 } from "lucide-react"
import type { AILiveInsight, AIPrediction } from "@/lib/ai-cricket"

interface AnalysisTabProps {
  matchId: string
}

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

export function AnalysisTab({ matchId }: AnalysisTabProps) {
  const query = `?matchId=${encodeURIComponent(matchId)}`
  const { data: prediction, isLoading: predictionLoading } = useSWR(
    `/api/ai/prediction${query}`,
    (url) => fetchAI<AIPrediction>(url),
    { refreshInterval: 30000 }
  )
  const { data: insight, error: insightError, isLoading: insightLoading } = useSWR(
    `/api/ai/live-insights${query}`,
    (url) => fetchAI<AILiveInsight>(url),
    { refreshInterval: 30000 }
  )

  const predictionData = prediction?.data
  const insightData = insight?.data

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-primary/20 via-card to-secondary/20 border border-primary/30 p-6"
      >
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-primary">AI Match Analysis</p>
            <h2 className="text-2xl font-bold">{predictionData?.title || "Match intelligence"}</h2>
          </div>
        </div>

        {predictionLoading || insightLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : insightError ? (
          <p className="text-sm text-muted-foreground">AI analysis is temporarily unavailable. Please try again.</p>
        ) : (
          <>
            {predictionData && (
              <div className="mb-5 grid gap-3 md:grid-cols-3">
                <MetricCard icon={TrendingUp} label="Favorite" value={predictionData.favorite} />
                <MetricCard icon={Target} label="Confidence" value={predictionData.confidence} />
                <MetricCard icon={Zap} label="Provider" value={predictionData.provider === "openai" ? "AI enhanced" : "CricYug rules"} />
              </div>
            )}

            {insightData && (
              <div className="grid gap-4 md:grid-cols-3">
                <InsightCard title="Momentum" body={insightData.momentum} />
                <InsightCard title="Pressure" body={insightData.pressure} />
                <InsightCard title="Next Phase" body={insightData.nextPhase} />
              </div>
            )}
          </>
        )}
      </motion.div>

      {predictionData && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <BarChart2 className="h-5 w-5 text-primary" />
              Win Probability
            </h3>
            <Probability label="Team 1" value={predictionData.winProbability.team1} />
            <Probability label="Team 2" value={predictionData.winProbability.team2} />
          </div>
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="mb-4 font-semibold">Key Factors</h3>
            <div className="space-y-2">
              {predictionData.factors.map((factor) => (
                <p key={factor} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{factor}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/35 border border-border p-4">
      <Icon className="mb-2 h-5 w-5 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold capitalize">{value}</p>
    </div>
  )
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-card/80 border border-border p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function Probability({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-primary">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
