"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Search, Globe, AlertCircle } from "lucide-react"
import { useTeams } from "@/hooks/use-cricket-data"
import { LoadingState, ErrorState, EmptyState, LoadingCard } from "@/components/ui/states"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Team } from "@/lib/types"

const formats = ["All Formats", "Test", "ODI", "T20"]

function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-4 transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl font-bold text-primary">
            {team.logo || team.flag ? (
              <img src={team.logo || team.flag} alt={team.name} className="h-9 w-9 object-contain" />
            ) : (
              team.shortName
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {team.ranking && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  #{team.ranking}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{team.shortName}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function TeamsLoadingSkeleton() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
            <div>
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded mt-2 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingCard key={i} className="h-24" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TeamsPageContent() {
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: teams, isLoading, error, mutate, isConfigured } = useTeams()

  if (isLoading) {
    return <TeamsLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <ErrorState
            title="Failed to load teams"
            message={error.message || "Unable to fetch team data. Please try again."}
            onRetry={() => mutate()}
          />
        </div>
      </div>
    )
  }

  const filteredTeams = (teams || []).filter(team => {
    if (!searchQuery) return true
    return team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           team.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const showEmptyState = !teams || teams.length === 0

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-muted-foreground">ICC cricket teams and rankings</p>
            </div>
          </div>

          {/* API Status Banner */}
          {!isConfigured && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">API Not Configured</p>
                <p className="text-xs text-muted-foreground">
                  Add CRICKETDATA_API_KEY environment variable to display live team data.
                </p>
              </div>
            </div>
          )}

          {/* Search and filters */}
          {!showEmptyState && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2 p-1 rounded-lg bg-muted">
                {formats.map((format) => (
                  <Button
                    key={format}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "whitespace-nowrap",
                      selectedFormat === format && "bg-background shadow-sm"
                    )}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {showEmptyState ? (
          <EmptyState
            icon={<Shield className="h-7 w-7 text-muted-foreground" />}
            title="No Teams Available"
            message={
              isConfigured 
                ? "Team data is currently unavailable. Please check back later."
                : "Connect the Cricket API to view team rankings and statistics."
            }
          />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teams?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Teams Available</p>
                </div>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                  <Globe className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Live</p>
                  <p className="text-sm text-muted-foreground">Data Status</p>
                </div>
              </div>
            </div>

            {/* Teams grid */}
            <div>
              <h2 className="text-xl font-bold mb-4">All Teams</h2>
              {filteredTeams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No teams found for &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTeams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <TeamCard team={team} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
