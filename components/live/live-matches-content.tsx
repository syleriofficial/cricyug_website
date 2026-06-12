"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Radio, Calendar, Clock, RefreshCw } from "lucide-react"
import { LiveScoreCard } from "@/components/cricket/live-score-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMatches } from "@/hooks/use-cricket-data"
import { useDetectedRegion, useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, ErrorState, NoMatches } from "@/components/ui/states"
import type { Match, MatchStatus, MatchFormat } from "@/lib/types"

type FilterType = "all" | MatchStatus
type FormatType = "all" | "test" | "odi" | "t20"

const statusFilters: { value: FilterType; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
]

const formatFilters: { value: FormatType; label: string }[] = [
  { value: "test", label: "Test" },
  { value: "odi", label: "ODI" },
  { value: "t20", label: "T20" },
  { value: "all", label: "All" },
]

const AUTO_REFRESH_SECONDS = 30

export function LiveMatchesContent() {
  const [filter, setFilter] = useState<FilterType>("live")
  const [format, setFormat] = useState<FormatType>("all")
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [refreshIn, setRefreshIn] = useState(AUTO_REFRESH_SECONDS)
  const regionForRequest = useDetectedRegion()

  const { data: matches, error, isLoading, mutate, message } = useMatches({
    status: filter === "all" ? undefined : filter,
    format: format === "all" ? undefined : format.toUpperCase() as MatchFormat,
    country: regionForRequest?.code,
    refreshInterval: 0,
  })

  const { matches: localizedMatches } = useLocalizedMatches(matches || [])
  const selectedMatch = localizedMatches.find(m => m.id === selectedMatchId) || localizedMatches[0]
  const selectedFormatLabel = formatFilters.find((item) => item.value === format)?.label || "All"
  const selectedStatusLabel = statusFilters.find((item) => item.value === filter)?.label || "All"

  useEffect(() => {
    setRefreshIn(AUTO_REFRESH_SECONDS)
  }, [filter, format, regionForRequest?.code])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshIn((current) => {
        if (current <= 1) {
          void mutate()
          return AUTO_REFRESH_SECONDS
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [mutate])

  function refreshNow() {
    setRefreshIn(AUTO_REFRESH_SECONDS)
    void mutate()
  }

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
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              {message}
            </div>
          )}

          {/* Filters */}
          <div className="mt-6 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Match Controls</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {localizedMatches.length} matches shown
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNow}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                {filter !== "live" || format !== "all" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilter("live")
                      setFormat("all")
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <FilterGroup label="Status">
                {statusFilters.map((item) => (
                  <Button
                    key={item.value}
                    variant="ghost"
                    size="sm"
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "h-9 shrink-0 rounded-lg px-3 text-sm",
                      filter === item.value
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                        : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                  >
                    {item.value === "live" && <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />}
                    {item.label}
                  </Button>
                ))}
              </FilterGroup>

              <FilterGroup label="Format">
                {formatFilters.map((item) => (
                  <Button
                    key={item.value}
                    variant="ghost"
                    size="sm"
                    aria-pressed={format === item.value}
                    onClick={() => setFormat(item.value)}
                    className={cn(
                      "h-9 shrink-0 rounded-lg px-3 text-sm",
                      format === item.value
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                        : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
              </FilterGroup>
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
              <NoMatches
                message={
                  format !== "all"
                    ? `No ${selectedFormatLabel} ${filter === "all" ? "" : selectedStatusLabel.toLowerCase()} matches are available from CricketData.org right now.`
                    : "There are no matches scheduled at the moment. Check back later for updates."
                }
              />
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
            {selectedMatch && <FocusedMatchPanel match={selectedMatch} />}

            <div className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Today&apos;s Schedule</h3>
              </div>
              <div className="space-y-3">
                {localizedMatches.filter((match) => match.status === "upcoming").slice(0, 4).map((match) => (
                  <Link key={match.id} href={`/matches/${match.id}`} className="block rounded-lg bg-muted/40 p-3 hover:bg-muted">
                    <p className="text-sm font-medium">{match.team1.team.shortName} vs {match.team2.team.shortName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{match.startTime || match.series.name}</p>
                  </Link>
                ))}
                {localizedMatches.filter((match) => match.status === "upcoming").length === 0 && (
                  <div className="py-6 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming matches in this filter</p>
                  </div>
                )}
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

function FocusedMatchPanel({ match }: { match: Match }) {
  const statusLabel = match.status === "completed" ? "RESULT" : match.status === "live" ? "LIVE" : "UPCOMING"

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className={cn(
        "flex items-center justify-between px-4 py-3",
        match.status === "live" ? "bg-live/15" : "bg-muted/50"
      )}>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Featured score</p>
          <p className="mt-0.5 text-sm font-semibold">{match.format} • {match.venue.name || match.series.name}</p>
        </div>
        <span className={cn(
          "rounded-full px-2 py-1 text-xs font-semibold",
          match.status === "live" ? "bg-live/20 text-live" : "bg-primary/15 text-primary"
        )}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <FocusedTeamRow teamScore={match.team1} isLive={match.status === "live"} />
        <FocusedTeamRow teamScore={match.team2} isLive={match.status === "live"} />
        {(match.result || match.startTime) && (
          <p className="border-t border-border pt-3 text-sm font-semibold text-primary">
            {match.result || match.startTime}
          </p>
        )}
      </div>
    </div>
  )
}

function FocusedTeamRow({ teamScore, isLive }: { teamScore: Match["team1"]; isLive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{teamScore.team.name}</p>
        <p className="text-xs text-muted-foreground">{teamScore.team.shortName}</p>
      </div>
      <div className="shrink-0 text-right">
        {teamScore.overs && (
          <p className="text-xs text-muted-foreground">
            ({teamScore.overs} ov{teamScore.runRate ? `, RR ${teamScore.runRate}` : ""})
          </p>
        )}
        <p className={cn("text-xl font-bold", isLive && "text-primary")}>{teamScore.score || "-"}</p>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="px-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-lg bg-muted p-1">
        {children}
      </div>
    </div>
  )
}
