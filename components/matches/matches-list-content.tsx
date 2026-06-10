"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Trophy, Filter, AlertCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMatches, useSeries } from "@/hooks/use-cricket-data"
import { useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, ErrorState, EmptyState } from "@/components/ui/states"
import type { Match } from "@/lib/types"

export function MatchesListContent({ initialFormat }: { initialFormat?: string }) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)
  const formatParam = initialFormat
  
  const { data: matches, error, isLoading, mutate, isConfigured } = useMatches()
  const { data: series } = useSeries({ limit: 10 })

  // Filter matches by series if selected
  const filteredMatches = selectedSeriesId 
    ? matches?.filter(m => m.series?.id === selectedSeriesId)
    : matches?.filter((match) => {
        if (!formatParam || formatParam === "ipl") return true
        return match.format.toLowerCase() === formatParam.toLowerCase()
      })
  const { matches: localizedMatches, region } = useLocalizedMatches(filteredMatches || [])

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">All Matches</h1>
              <p className="text-muted-foreground">Browse cricket matches worldwide</p>
              {region && (
                <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                  <MapPin className="h-4 w-4" />
                  {region.label} relevant matches are shown first
                </p>
              )}
            </div>
          </div>

          {/* API Status Banner */}
          {!isConfigured && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">API Not Configured</p>
                <p className="text-xs text-muted-foreground">
                  Add CRICKETDATA_API_KEY environment variable to display live match data.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Series filter sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-card border border-border p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Filter by Series</h3>
              </div>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    !selectedSeriesId && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setSelectedSeriesId(null)}
                >
                  All Matches
                </Button>
                {series?.map((s) => (
                  <Button
                    key={s.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left",
                      selectedSeriesId === s.id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => setSelectedSeriesId(s.id)}
                  >
                    <div className="truncate">
                      <span>{s.name}</span>
                      {s.status === "ongoing" && (
                        <span className="ml-2 h-2 w-2 inline-block rounded-full bg-live animate-live-pulse" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Matches grid */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
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
              <EmptyState 
                icon={<Trophy className="h-7 w-7 text-muted-foreground" />}
                title="No Matches Available"
                message={isConfigured ? "Match data will appear here once available." : "Connect the Cricket API to view live and upcoming matches."}
              />
            )}

            {/* Matches */}
            {!isLoading && !error && localizedMatches.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {localizedMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/matches/${match.id}`}>
                        <MatchCard match={match} />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-card border border-border p-4 cursor-pointer group"
    >
      {/* Live indicator */}
      {match.status === "live" && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-live/20 text-live text-xs font-semibold w-fit mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-live-pulse" />
          LIVE
        </div>
      )}

      {/* Match info */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground">{match.series?.name || "Cricket Match"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {match.format} {match.venue && `• ${match.venue.name}`}
        </p>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.team1.team.logo ? (
              <img src={match.team1.team.logo} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {match.team1.team.shortName.slice(0, 2)}
              </div>
            )}
            <span className="font-medium">{match.team1.team.shortName}</span>
          </div>
          {match.team1.score && (
            <span className={cn("text-lg font-bold", match.status === "live" && "text-primary")}>
              {match.team1.score}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.team2.team.logo ? (
              <img src={match.team2.team.logo} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {match.team2.team.shortName.slice(0, 2)}
              </div>
            )}
            <span className="font-medium">{match.team2.team.shortName}</span>
          </div>
          {match.team2.score && (
            <span className="text-lg font-bold">{match.team2.score}</span>
          )}
        </div>
      </div>

      {/* Result or status */}
      {(match.result || match.startTime) && (
        <div className="mt-3 pt-3 border-t border-border">
          {match.result ? (
            <p className="text-sm text-primary font-medium">{match.result}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{match.startTime}</p>
          )}
        </div>
      )}
    </motion.div>
  )
}
