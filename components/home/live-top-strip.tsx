"use client"

import Link from "next/link"
import { Radio } from "lucide-react"
import { useMatches } from "@/hooks/use-cricket-data"
import { useDetectedRegion, useLocalizedMatches } from "@/hooks/use-localized-matches"

export function LiveTopStrip() {
  const region = useDetectedRegion()
  const { data: liveMatches, isLoading } = useMatches({ status: "live", limit: 8, country: region?.code, refreshInterval: 30000 })
  const { matches } = useLocalizedMatches(liveMatches || [])

  if (isLoading || matches.length === 0) return null

  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2">
        <div className="flex shrink-0 items-center gap-2 text-xs font-black uppercase">
          <Radio className="h-4 w-4 animate-live-pulse" />
          Live
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="shrink-0 rounded-md bg-white/14 px-3 py-1 text-xs font-semibold hover:bg-white/22"
            >
              {match.team1.team.shortName} {match.team1.score || "-"} vs {match.team2.team.shortName} {match.team2.score || "-"}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
