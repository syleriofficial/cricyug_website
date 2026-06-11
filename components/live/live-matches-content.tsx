"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Radio, Calendar, Clock, MapPin } from "lucide-react"
import { LiveScoreCard } from "@/components/cricket/live-score-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMatches } from "@/hooks/use-cricket-data"
import { useRegionPreference, useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, ErrorState, NoMatches } from "@/components/ui/states"
import type { Match, MatchStatus, MatchFormat } from "@/lib/types"

type FilterType = "all" | MatchStatus
type FormatType = "all" | "test" | "odi" | "t20"

const statusFilters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
]

const formatFilters: { value: FormatType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "test", label: "Test" },
  { value: "odi", label: "ODI" },
  { value: "t20", label: "T20" },
]

export function LiveMatchesContent() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [format, setFormat] = useState<FormatType>("all")
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const { region: regionForRequest, selectedCode, setRegionCode, options: regionOptions } = useRegionPreference()

  const { data: matches, error, isLoading, mutate, message } = useMatches({
    status: filter === "all" ? undefined : filter,
    format: format === "all" ? undefined : format.toUpperCase() as MatchFormat,
    country: regionForRequest?.code,
  })

  const { matches: localizedMatches, region } = useLocalizedMatches(matches || [])
  const selectedMatch = localizedMatches.find(m => m.id === selectedMatchId) || localizedMatches[0]
  const activeRegionLabel = selectedCode
    ? regionOptions.find((item) => item.code === selectedCode)?.label
    : region?.label
  const selectedFormatLabel = formatFilters.find((item) => item.value === format)?.label || "All"
  const selectedStatusLabel = statusFilters.find((item) => item.value === filter)?.label || "All"

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
                  {activeRegionLabel ? ` • ${activeRegionLabel} priority` : ""}
                </p>
              </div>
              {filter !== "all" || format !== "all" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilter("all")
                    setFormat("all")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(210px,0.8fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
              <label className="min-w-0 space-y-2">
                <span className="flex items-center gap-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </span>
                <select
                  value={selectedCode}
                  onChange={(event) => setRegionCode(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus:border-primary"
                  aria-label="Prioritize matches by region"
                >
                  <option value="">Auto location</option>
                  {regionOptions.map((item) => (
                    <option key={item.code} value={item.code}>{item.label}</option>
                  ))}
                </select>
              </label>

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
