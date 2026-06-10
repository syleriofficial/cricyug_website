"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Radio, Calendar, Clock, MapPin } from "lucide-react"
import { LiveScoreCard } from "@/components/cricket/live-score-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMatches } from "@/hooks/use-cricket-data"
import { useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, ErrorState, NoMatches } from "@/components/ui/states"
import type { Match, MatchStatus, MatchFormat } from "@/lib/types"

type FilterType = "all" | MatchStatus
type FormatType = "all" | "test" | "odi" | "t20"

export function LiveMatchesContent() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [format, setFormat] = useState<FormatType>("all")
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const { data: matches, error, isLoading, mutate } = useMatches({
    status: filter === "all" ? undefined : filter,
    format: format === "all" ? undefined : format.toUpperCase() as MatchFormat,
  })

  const { matches: localizedMatches, region } = useLocalizedMatches(matches || [])
  const selectedMatch = localizedMatches.find(m => m.id === selectedMatchId) || localizedMatches[0]

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-live/20">
              <Radio className="h-6 w-6 text-live animate-live-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Live Matches</h1>
              <p className="text-muted-foreground">Real-time cricket scores and updates</p>
              {region && (
                <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                  <MapPin className="h-4 w-4" />
                  {region.label} matches are prioritized from your device locale
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2 p-1 rounded-lg bg-muted">
              {(["all", "live", "upcoming", "completed"] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "capitalize",
                    filter === f ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  {f === "live" && <span className="h-2 w-2 rounded-full bg-live animate-live-pulse mr-1.5" />}
                  {f}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-1 rounded-lg bg-muted">
              {(["all", "test", "odi", "t20"] as FormatType[]).map((f) => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "uppercase",
                    format === f ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <LoadingMatchCard key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <ErrorState 
                title="Unable to load matches"
                message="We couldn&apos;t fetch match data. Please try again."
                onRetry={() => mutate()}
              />
            )}

            {/* Empty State */}
            {!isLoading && !error && localizedMatches.length === 0 && (
              <NoMatches />
            )}

            {/* Matches List */}
            <AnimatePresence mode="popLayout">
              {!isLoading && !error && localizedMatches.length > 0 && 
                localizedMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedMatchId(match.id)}
                    className={cn(
                      "cursor-pointer",
                      selectedMatchId === match.id && "ring-2 ring-primary rounded-xl"
                    )}
                  >
                    <Link href={`/matches/${match.id}`}>
                      <LiveScoreCard match={match} />
                    </Link>
                  </motion.div>
                ))
              }
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Match schedule placeholder */}
            <div className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Today&apos;s Schedule</h3>
              </div>
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming matches scheduled</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl bg-card border border-border p-4">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-live/10">
                  <p className="text-2xl font-bold text-live">
                    {matches?.filter(m => m.status === "live").length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Live Now</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">
                    {matches?.filter(m => m.status === "upcoming").length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
