"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Users, Shield, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlayers, useTeams } from "@/hooks/use-cricket-data"
import { LoadingPlayerCard, ErrorState, EmptyState } from "@/components/ui/states"
import type { Player, Team } from "@/lib/types"

export function TopPlayersSection() {
  const { data: players, error: playersError, isLoading: playersLoading, mutate: mutatePlayers, isConfigured: playersConfigured } = usePlayers({ limit: 4 })
  const { data: teams, error: teamsError, isLoading: teamsLoading, mutate: mutateTeams, isConfigured: teamsConfigured } = useTeams({ limit: 4 })

  const isConfigured = playersConfigured && teamsConfigured

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        {/* API Status Banner */}
        {!isConfigured && (
          <div className="mb-8 flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">API Not Configured</p>
              <p className="text-xs text-muted-foreground">
                Add CRICKETDATA_API_KEY environment variable to display live player and team data.
              </p>
            </div>
          </div>
        )}

        {/* Top Players */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Top Players</h2>
                <p className="text-sm text-muted-foreground">Player profiles from CricketData</p>
              </div>
            </div>
            <Link href="/players">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                All Players
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {playersLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingPlayerCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {playersError && !playersLoading && (
            <ErrorState 
              title="Unable to load players"
              message="We couldn&apos;t fetch player profiles. Please try again."
              onRetry={() => mutatePlayers()}
            />
          )}

          {/* Empty State */}
          {!playersLoading && !playersError && (!players || players.length === 0) && (
            <EmptyState 
              icon={<User className="h-7 w-7 text-muted-foreground" />}
              title="No Players Available"
              message={isConfigured ? "Player profiles will appear here once available." : "Connect the Cricket API to view player profiles."}
            />
          )}

          {/* Player cards grid */}
          {!playersLoading && !playersError && players && players.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/players/${player.id}`}>
                    <PlayerCard player={player} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Top Teams */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cricket Teams</h2>
                <p className="text-sm text-muted-foreground">International team profiles</p>
              </div>
            </div>
            <Link href="/teams">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                All Teams
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {teamsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingPlayerCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {teamsError && !teamsLoading && (
            <ErrorState 
              title="Unable to load teams"
              message="We couldn&apos;t fetch team profiles. Please try again."
              onRetry={() => mutateTeams()}
            />
          )}

          {/* Empty State */}
          {!teamsLoading && !teamsError && (!teams || teams.length === 0) && (
            <EmptyState 
              icon={<Shield className="h-7 w-7 text-muted-foreground" />}
              title="No Teams Available"
              message={isConfigured ? "Team profiles will appear here once available." : "Connect the Cricket API to view team profiles."}
            />
          )}

          {/* Team cards grid */}
          {!teamsLoading && !teamsError && teams && teams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/teams/${team.id}`}>
                    <TeamCard team={team} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
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

function TeamCard({ team }: { team: Team }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-card border border-border p-4 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
          {team.shortName.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{team.name}</h3>
          <p className="text-sm text-muted-foreground">{team.shortName}</p>
        </div>
        {team.logo && (
          <img 
            src={team.logo} 
            alt={team.name}
            className="h-10 w-10 object-contain"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </motion.div>
  )
}
