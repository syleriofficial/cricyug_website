"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Trophy, MapPin, ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSeries, useFeaturedSeries } from "@/hooks/use-cricket-data"
import { LoadingCard, ErrorState, EmptyState } from "@/components/ui/states"
import type { Series } from "@/lib/types"

const seriesCategories = ["All", "International", "T20 Leagues", "Domestic", "Women"]

export function SeriesPageContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const { data: allSeries, error, isLoading, mutate } = useSeries()
  const { data: featuredSeries } = useFeaturedSeries()

  const filteredSeries = allSeries?.filter(
    (series) => activeCategory === "All" || series.type === activeCategory.toLowerCase()
  ) || []

  const liveSeries = filteredSeries.filter((s) => s.status === "ongoing")
  const upcomingSeries = filteredSeries.filter((s) => s.status === "upcoming")
  const completedSeries = filteredSeries.filter((s) => s.status === "completed")

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
              <h1 className="text-3xl font-bold">Series</h1>
              <p className="text-muted-foreground">Cricket tournaments and series</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {seriesCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorState 
              title="Unable to load series"
              message="We couldn&apos;t fetch series data. Please try again."
              onRetry={() => mutate()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredSeries.length === 0 && (
            <EmptyState
              icon={<Trophy className="h-7 w-7 text-muted-foreground" />}
              title="No Series Found"
              message="There are no series matching your criteria."
            />
          )}

          {/* Series Content */}
          {!isLoading && !error && filteredSeries.length > 0 && (
            <>
              {/* Featured Series */}
              {activeCategory === "All" && featuredSeries && featuredSeries.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-secondary" />
                    Featured Series
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredSeries.map((series, index) => (
                      <FeaturedSeriesCard key={series.id} series={series} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* Live Series */}
              {liveSeries.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-live animate-live-pulse" />
                    Live Series
                  </h2>
                  <div className="space-y-3">
                    {liveSeries.map((series, index) => (
                      <SeriesCard key={series.id} series={series} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Series */}
              {upcomingSeries.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Upcoming Series</h2>
                  <div className="space-y-3">
                    {upcomingSeries.map((series, index) => (
                      <SeriesCard key={series.id} series={series} index={index} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Series */}
              {completedSeries.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Completed Series</h2>
                  <div className="space-y-3">
                    {completedSeries.map((series, index) => (
                      <SeriesCard key={series.id} series={series} index={index} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FeaturedSeriesCard({ series, index }: { series: Series; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/series/${series.id}`}>
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-card to-secondary/10 border border-primary/20 p-5 hover:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            {series.status === "ongoing" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-live/20 text-live text-xs font-medium mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-live animate-live-pulse" />
                LIVE
              </span>
            )}
            {series.status === "upcoming" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium mb-3">
                UPCOMING
              </span>
            )}
            
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {series.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {series.startDate}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{series.totalMatches}</span> Matches
                </span>
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{series.teams.length}</span> Teams
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SeriesCard({ series, index }: { series: Series; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/series/${series.id}`}>
        <div className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {series.name}
                </h3>
                {series.status === "ongoing" && (
                  <span className="flex h-2 w-2 rounded-full bg-live animate-live-pulse" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{series.startDate} - {series.endDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              <span>{series.totalMatches} Matches</span>
              <span>{series.teams.length} Teams</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
