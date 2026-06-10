"use client"

import { useState, use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Brain, 
  BarChart3, 
  Bookmark,
  Share2,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMatch } from "@/hooks/use-cricket-data"
import { LoadingState, ErrorState } from "@/components/ui/states"
import { ScorecardTab } from "./scorecard-tab"
import { CommentaryTab } from "./commentary-tab"
import { AnalysisTab } from "./analysis-tab"
import { StatsTab } from "./stats-tab"

type Tab = "scorecard" | "commentary" | "analysis" | "stats"

const tabs = [
  { id: "scorecard" as const, label: "Scorecard", icon: FileText },
  { id: "commentary" as const, label: "Commentary", icon: MessageSquare },
  { id: "analysis" as const, label: "AI Analysis", icon: Brain },
  { id: "stats" as const, label: "Stats", icon: BarChart3 },
]

export function MatchCenterContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<Tab>("scorecard")
  
  const { data: match, error, isLoading, mutate } = useMatch(id)

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/live">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Matches
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading match details..." />}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState 
            title="Unable to load match"
            message="We couldn&apos;t fetch match details. Please try again."
            onRetry={() => mutate()}
          />
        )}

        {/* Match content */}
        {!isLoading && !error && match && (
          <>
            {/* Match header */}
            <div className="rounded-2xl bg-card border border-border p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                {match.status === "live" && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-live/20 text-live text-sm font-semibold">
                    <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />
                    LIVE
                  </span>
                )}
                <span className="text-sm text-muted-foreground">{match.format} • {match.series.name}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Team 1 */}
                <div className="flex items-center gap-4">
                  {match.team1.team.logo ? (
                    <img src={match.team1.team.logo} alt={match.team1.team.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                      {match.team1.team.shortName.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{match.team1.team.shortName}</h2>
                    <p className="text-sm text-muted-foreground">{match.team1.team.name}</p>
                    {match.team1.score && (
                      <p className="text-2xl font-bold text-primary mt-1">
                        {match.team1.score}
                        {match.team1.overs && (
                          <span className="text-sm text-muted-foreground ml-2">({match.team1.overs} ov)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* VS / Status */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">VS</p>
                  {match.result && (
                    <p className="text-sm text-primary font-medium mt-2">{match.result}</p>
                  )}
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-4 md:flex-row-reverse md:text-right">
                  {match.team2.team.logo ? (
                    <img src={match.team2.team.logo} alt={match.team2.team.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                      {match.team2.team.shortName.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{match.team2.team.shortName}</h2>
                    <p className="text-sm text-muted-foreground">{match.team2.team.name}</p>
                    {match.team2.score && (
                      <p className="text-2xl font-bold mt-1">
                        {match.team2.score}
                        {match.team2.overs && (
                          <span className="text-sm text-muted-foreground ml-2">({match.team2.overs} ov)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {match.venue && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Venue:</span> {match.venue.name}, {match.venue.city}
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-2 p-1 rounded-lg bg-muted overflow-x-auto">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "gap-2 whitespace-nowrap",
                      activeTab === tab.id ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "scorecard" && <ScorecardTab matchId={id} />}
              {activeTab === "commentary" && <CommentaryTab matchId={id} />}
              {activeTab === "analysis" && <AnalysisTab matchId={id} />}
              {activeTab === "stats" && <StatsTab matchId={id} />}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
