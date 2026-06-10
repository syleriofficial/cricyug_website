"use client"

import { motion } from "framer-motion"
import { BarChart3, Gauge, Goal, Shield, Zap } from "lucide-react"
import { useMatch } from "@/hooks/use-cricket-data"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states"

interface StatsTabProps {
  matchId: string
}

export function StatsTab({ matchId }: StatsTabProps) {
  const { data: match, error, isLoading, mutate, isConfigured } = useMatch(matchId, { includeScorecard: true })
  const scorecard = match?.scorecard || []

  if (isLoading) return <LoadingState message="Loading match statistics..." />

  if (error) {
    return (
      <ErrorState
        title="Unable to load statistics"
        message="We couldn&apos;t fetch match statistics. Please try again."
        onRetry={() => mutate()}
      />
    )
  }

  if (!isConfigured || !match || scorecard.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-7 w-7 text-muted-foreground" />}
        title="Statistics Not Available"
        message={!isConfigured ? "Connect the Cricket API to view match statistics." : "Official scorecard data is not available for this match yet."}
      />
    )
  }

  const inningsStats = scorecard.map((innings) => {
    const boundaries = innings.batsmen.reduce((sum, batter) => sum + batter.fours + batter.sixes, 0)
    const topBatter = [...innings.batsmen].sort((a, b) => b.runs - a.runs)[0]
    const topBowler = [...innings.bowlers].sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)[0]
    const dotPressure = innings.bowlers.length
      ? innings.bowlers.reduce((sum, bowler) => sum + bowler.maidens, 0)
      : 0

    return {
      team: innings.battingTeam.name,
      total: innings.total,
      overs: innings.overs,
      runRate: innings.runRate,
      boundaries,
      topBatter,
      topBowler,
      dotPressure,
    }
  })

  const bestRunRate = [...inningsStats].sort((a, b) => b.runRate - a.runRate)[0]
  const mostBoundaries = [...inningsStats].sort((a, b) => b.boundaries - a.boundaries)[0]
  const bestBowling = inningsStats
    .map((item) => item.topBowler)
    .filter(Boolean)
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gauge} label="Best Run Rate" value={bestRunRate ? bestRunRate.runRate.toFixed(2) : "-"} detail={bestRunRate?.team || "Official data"} />
        <StatCard icon={Zap} label="Most Boundaries" value={String(mostBoundaries?.boundaries ?? "-")} detail={mostBoundaries?.team || "Official data"} />
        <StatCard icon={Shield} label="Best Bowler" value={bestBowling ? `${bestBowling.wickets}/${bestBowling.runs}` : "-"} detail={bestBowling?.player.name || "Official data"} />
        <StatCard icon={Goal} label="Innings" value={String(scorecard.length)} detail={match.format} />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h3 className="font-semibold">Innings Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="p-3 text-left font-medium">Team</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 text-right font-medium">Overs</th>
                <th className="p-3 text-right font-medium">RR</th>
                <th className="p-3 text-right font-medium">4s/6s</th>
                <th className="p-3 text-left font-medium">Top Batter</th>
              </tr>
            </thead>
            <tbody>
              {inningsStats.map((item) => (
                <tr key={item.team} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{item.team}</td>
                  <td className="p-3 text-right font-bold text-primary">{item.total}</td>
                  <td className="p-3 text-right text-muted-foreground">{item.overs}</td>
                  <td className="p-3 text-right text-muted-foreground">{item.runRate.toFixed(2)}</td>
                  <td className="p-3 text-right text-muted-foreground">{item.boundaries}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {item.topBatter ? `${item.topBatter.player.name} ${item.topBatter.runs} (${item.topBatter.balls})` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4"
    >
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </motion.div>
  )
}
