"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePlayers } from "@/hooks/use-cricket-data"
import { LoadingPlayerCard, ErrorState, NoPlayers, NoResults } from "@/components/ui/states"
import type { Player, PlayerRole } from "@/lib/types"

const roles: (PlayerRole | "All")[] = ["All", "Batsman", "Bowler", "All-rounder", "Wicket-keeper"]
const formats = ["All Formats", "Test", "ODI", "T20"]

export function PlayersPageContent() {
  const [selectedRole, setSelectedRole] = useState<PlayerRole | "All">("All")
  const [selectedFormat, setSelectedFormat] = useState("All Formats")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: players, error, isLoading, mutate, message } = usePlayers({
    role: selectedRole === "All" ? undefined : selectedRole,
    search: searchQuery || undefined,
    format: selectedFormat === "All Formats" ? undefined : selectedFormat,
    limit: 24,
  })

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Players</h1>
              <p className="text-muted-foreground">Live CricketData.org player profiles by role</p>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-4 mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
              <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-lg bg-muted p-1">
                {roles.map((role) => (
                  <Button
                    key={role}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "shrink-0 whitespace-nowrap",
                      selectedRole === role && "bg-background shadow-sm"
                    )}
                  >
                    {role}
                  </Button>
                ))}
              </div>
              <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-lg bg-muted p-1">
                {formats.map((format) => (
                  <Button
                    key={format}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "shrink-0 whitespace-nowrap",
                      selectedFormat === format && "bg-background shadow-sm"
                    )}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              {message}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingPlayerCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState 
            title="Unable to load players"
            message="We couldn&apos;t fetch player data. Please try again."
            onRetry={() => mutate()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && (!players || players.length === 0) && (
          searchQuery ? <NoResults query={searchQuery} /> : <NoPlayers message="Featured CricketData.org player profiles will appear here once available." />
        )}

        {/* Players grid */}
        {!isLoading && !error && players && players.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/players/${player.id}`}>
                  <PlayerCard player={player} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-card border border-border p-4 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{player.role}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{player.country}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </motion.div>
  )
}
