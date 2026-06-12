"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Radio } from "lucide-react"
import { LiveScoreCard } from "@/components/cricket/live-score-card"
import { Button } from "@/components/ui/button"
import { useLiveMatches, useUpcomingMatches, useRecentMatches } from "@/hooks/use-cricket-data"
import { useDetectedRegion, useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, ErrorState, NoMatches } from "@/components/ui/states"

export function LiveMatchesSection() {
  const regionForRequest = useDetectedRegion()
  const { data: liveMatches, error: liveError, isLoading: liveLoading } = useLiveMatches(regionForRequest?.code)
  const { data: upcomingMatches, error: upcomingError, isLoading: upcomingLoading } = useUpcomingMatches(4, regionForRequest?.code)
  const { data: recentMatches, error: recentError, isLoading: recentLoading } = useRecentMatches(4, regionForRequest?.code)

  const isLoading = liveLoading || upcomingLoading || recentLoading
  const error = liveError || upcomingError || recentError
  const liveAndUpcoming = [...(liveMatches || []), ...(upcomingMatches || [])]
  const { matches: localizedMatches } = useLocalizedMatches(liveAndUpcoming.length > 0 ? liveAndUpcoming : (recentMatches || []))
  const allMatches = localizedMatches.slice(0, 4)
  const isShowingResults = liveAndUpcoming.length === 0 && allMatches.length > 0

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-live/20">
              <Radio className="h-5 w-5 text-live animate-live-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{isShowingResults ? "Recent Results" : "Live & Upcoming"}</h2>
              <p className="text-sm text-muted-foreground">
                {isShowingResults ? "Latest completed matches" : "Real-time match coverage"}
              </p>
            </div>
          </div>
          <Link href="/live">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingMatchCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState 
            title="Unable to load matches"
            message="We couldn&apos;t fetch the latest match data. Please try again."
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && allMatches.length === 0 && (
          <NoMatches message="No live, upcoming, or recent matches are available right now." />
        )}

        {/* Match cards grid */}
        {!isLoading && !error && allMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/matches/${match.id}`}>
                  <LiveScoreCard match={match} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
