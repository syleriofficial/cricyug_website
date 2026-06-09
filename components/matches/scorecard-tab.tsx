"use client"

import { cn } from "@/lib/utils"
import { useMatch } from "@/hooks/use-cricket-data"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states"
import { FileText } from "lucide-react"
import type { Innings } from "@/lib/types"

interface ScorecardTabProps {
  matchId: string
}

export function ScorecardTab({ matchId }: ScorecardTabProps) {
  // Using useMatch to get match details which would include scorecard in a real API
  const { data: match, error, isLoading, mutate, isConfigured } = useMatch(matchId)

  // In a production app, this would come from the match details or a separate scorecard endpoint
  const scorecard: Innings[] = []

  if (isLoading) {
    return <LoadingState message="Loading scorecard..." />
  }

  if (error) {
    return (
      <ErrorState 
        title="Unable to load scorecard"
        message="We couldn&apos;t fetch the scorecard. Please try again."
        onRetry={() => mutate()}
      />
    )
  }

  if (!isConfigured || !match || scorecard.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-7 w-7 text-muted-foreground" />}
        title="No Scorecard Available"
        message={
          !isConfigured 
            ? "Connect the Cricket API to view detailed scorecards."
            : "Detailed scorecards are not available from the current data source for this match yet."
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {scorecard.map((innings, index) => (
        <div key={index} className="space-y-4">
          {/* Batting */}
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold">{innings.battingTeam.name} - Batting</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="text-left p-3 font-medium">Batter</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Dismissal</th>
                    <th className="text-right p-3 font-medium">R</th>
                    <th className="text-right p-3 font-medium">B</th>
                    <th className="text-right p-3 font-medium">4s</th>
                    <th className="text-right p-3 font-medium">6s</th>
                    <th className="text-right p-3 font-medium">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {innings.batsmen.map((batter, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{batter.player.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{batter.dismissal || "not out"}</p>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{batter.dismissal || "not out"}</td>
                      <td className={cn("p-3 text-right font-bold", batter.runs >= 50 && "text-primary")}>{batter.runs}</td>
                      <td className="p-3 text-right text-muted-foreground">{batter.balls}</td>
                      <td className="p-3 text-right text-muted-foreground">{batter.fours}</td>
                      <td className="p-3 text-right text-muted-foreground">{batter.sixes}</td>
                      <td className="p-3 text-right text-muted-foreground">{batter.strikeRate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex flex-wrap gap-4 text-sm">
                <span><strong>Extras:</strong> {innings.extras.total}</span>
                <span><strong>Total:</strong> {innings.total} ({innings.overs} ov)</span>
              </div>
            </div>
          </div>

          {/* Bowling */}
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold">{innings.bowlingTeam.name} - Bowling</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="text-left p-3 font-medium">Bowler</th>
                    <th className="text-right p-3 font-medium">O</th>
                    <th className="text-right p-3 font-medium">M</th>
                    <th className="text-right p-3 font-medium">R</th>
                    <th className="text-right p-3 font-medium">W</th>
                    <th className="text-right p-3 font-medium">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {innings.bowlers.map((bowler, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{bowler.player.name}</td>
                      <td className="p-3 text-right text-muted-foreground">{bowler.overs}</td>
                      <td className="p-3 text-right text-muted-foreground">{bowler.maidens}</td>
                      <td className="p-3 text-right text-muted-foreground">{bowler.runs}</td>
                      <td className={cn("p-3 text-right font-bold", bowler.wickets > 0 && "text-primary")}>{bowler.wickets}</td>
                      <td className={cn(
                        "p-3 text-right",
                        bowler.economy < 8 ? "text-success" : bowler.economy > 10 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {bowler.economy.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
