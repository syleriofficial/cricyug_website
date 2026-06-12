"use client"

import Link from "next/link"
import { CalendarDays, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMatches } from "@/hooks/use-cricket-data"
import { useDetectedRegion, useLocalizedMatches } from "@/hooks/use-localized-matches"
import { LoadingMatchCard, NoMatches } from "@/components/ui/states"
import { MatchCardCompact } from "@/components/cricket/live-score-card"

export function TodayMatchesSection() {
  const region = useDetectedRegion()
  const { data: matches, isLoading, error } = useMatches({ limit: 10, country: region?.code, refreshInterval: 30000 })
  const { matches: localizedMatches } = useLocalizedMatches(matches || [])
  const todayMatches = localizedMatches.slice(0, 6)

  return (
    <section className="border-y border-border bg-muted/60 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
              <CalendarDays className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Today Matches</h2>
              <p className="text-sm text-muted-foreground">Live, upcoming and latest official fixtures</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/matches">Match center <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {isLoading && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <LoadingMatchCard key={index} />)}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Data temporarily unavailable.</div>
        )}

        {!isLoading && !error && todayMatches.length === 0 && (
          <NoMatches message="No official matches are available right now." />
        )}

        {!isLoading && !error && todayMatches.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {todayMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <MatchCardCompact match={match} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
