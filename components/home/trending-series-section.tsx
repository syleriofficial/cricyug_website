"use client"

import Link from "next/link"
import { ArrowRight, Table2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFeaturedSeries } from "@/hooks/use-cricket-data"
import { LoadingCard } from "@/components/ui/states"

export function TrendingSeriesSection() {
  const { data: series, isLoading, error } = useFeaturedSeries()
  const items = (series || []).slice(0, 6)

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Trending Series</h2>
            <p className="text-sm text-muted-foreground">IPL, ICC, international, domestic and women tournaments</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/matches#series">Series in matches <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {isLoading && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <LoadingCard key={index} />)}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Data temporarily unavailable.</div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr]">
            {items.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/series/${item.id}`} className="rounded-lg border border-border bg-card p-4 hover:border-primary/40">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase text-primary">{item.status}</span>
                </div>
                <h3 className="line-clamp-2 font-semibold">{item.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{item.totalMatches} matches • {item.format}</p>
              </Link>
            ))}
            <Link href="/matches#points" className="rounded-lg border border-primary/20 bg-primary/10 p-4 hover:border-primary/45 md:col-span-2 lg:col-span-1">
              <Table2 className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">Points Table Shortcut</h3>
              <p className="mt-2 text-sm text-muted-foreground">Open standings for active tournaments.</p>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
