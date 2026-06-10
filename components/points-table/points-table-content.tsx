"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, ChevronDown, Table, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeaturedSeries, usePointsTable } from "@/hooks/use-cricket-data"
import { LoadingTable, ErrorState, EmptyState } from "@/components/ui/states"
import type { PointsTableEntry } from "@/lib/types"

export function PointsTableContent() {
  const { data: series, isLoading: seriesLoading } = useFeaturedSeries()
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentSeriesId = selectedSeriesId || series?.[0]?.id || null
  const { data: standings, error, isLoading: standingsLoading, mutate } = usePointsTable(currentSeriesId)

  const selectedSeries = series?.find(s => s.id === currentSeriesId)
  const isLoading = seriesLoading || standingsLoading

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Table className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Points Table</h1>
              <p className="text-muted-foreground">Tournament standings and team rankings</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tournament Selector */}
          {series && series.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full min-w-0 items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors sm:w-auto sm:min-w-[280px] sm:max-w-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-medium">{selectedSeries?.name || "Select Tournament"}</p>
                    <p className="text-sm text-muted-foreground">{selectedSeries?.format} Tournament</p>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
              </button>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 sm:right-auto mt-2 z-10 max-w-full rounded-xl bg-card border border-border shadow-xl overflow-hidden sm:w-[420px]"
                >
                  {series.map((tournament) => (
                    <button
                      key={tournament.id}
                      onClick={() => {
                        setSelectedSeriesId(tournament.id)
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                        currentSeriesId === tournament.id && "bg-primary/10"
                      )}
                    >
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate font-medium">{tournament.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{tournament.format}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingTable rows={8} />}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorState 
              title="Unable to load standings"
              message="We couldn&apos;t fetch the points table. Please try again."
              onRetry={() => mutate()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && (!standings || standings.length === 0) && (
            <div className="overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
              <EmptyState
                icon={<Table className="h-7 w-7 text-muted-foreground" />}
                title="Official Table Not Available"
                message={
                  selectedSeries
                    ? `CricketData.org has not published standings for ${selectedSeries.name} yet. Try another tournament from the selector.`
                    : "Select a tournament to check whether official standings are available."
                }
                className="py-8"
              />
              {selectedSeries && (
                <div className="mt-2 grid min-w-0 gap-3 sm:grid-cols-3">
                  <InfoPill label="Series" value={selectedSeries.name} />
                  <InfoPill label="Format" value={selectedSeries.format} />
                  <InfoPill label="Status" value={selectedSeries.status} />
                </div>
              )}
            </div>
          )}

          {/* Points Table */}
          {!isLoading && !error && standings && standings.length > 0 && (
            <>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-success" />
                  Playoff Qualified
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Team</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-muted-foreground">P</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-muted-foreground">W</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-muted-foreground">L</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-muted-foreground">NRR</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-muted-foreground">Pts</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Form</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((entry, index) => (
                        <StandingsRow key={entry.team.id} entry={entry} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex min-w-0 items-center gap-2 text-xs uppercase text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate font-medium capitalize">{value}</p>
    </div>
  )
}

function StandingsRow({ entry, index }: { entry: PointsTableEntry; index: number }) {
  const isQualified = entry.position <= 4
  
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "border-t border-border hover:bg-muted/30 transition-colors",
        isQualified && "bg-success/5"
      )}
    >
      <td className="px-4 py-4">
        <span className={cn("font-medium", isQualified && "text-success")}>
          {entry.position}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {entry.team.logo ? (
            <img src={entry.team.logo} alt={entry.team.name} className="h-8 w-8 object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {entry.team.shortName.slice(0, 2)}
            </div>
          )}
          <span className="font-medium hidden sm:inline">{entry.team.name}</span>
          <span className="font-medium sm:hidden">{entry.team.shortName}</span>
        </div>
      </td>
      <td className="text-center px-3 py-4 text-muted-foreground">{entry.played}</td>
      <td className="text-center px-3 py-4 text-success font-medium">{entry.won}</td>
      <td className="text-center px-3 py-4 text-destructive font-medium">{entry.lost}</td>
      <td className={cn(
        "text-center px-3 py-4 font-medium",
        entry.netRunRate >= 0 ? "text-success" : "text-destructive"
      )}>
        {entry.netRunRate >= 0 ? "+" : ""}{entry.netRunRate.toFixed(3)}
      </td>
      <td className="text-center px-3 py-4">
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 font-bold text-primary">
          {entry.points}
        </span>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <div className="flex items-center gap-1 justify-center">
          {entry.recentForm.slice(0, 5).map((result, i) => (
            <span
              key={i}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
                result === "W" ? "bg-success/20 text-success" : 
                result === "L" ? "bg-destructive/20 text-destructive" :
                "bg-muted text-muted-foreground"
              )}
            >
              {result}
            </span>
          ))}
        </div>
      </td>
    </motion.tr>
  )
}
