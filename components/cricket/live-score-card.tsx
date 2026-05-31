"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Match, TeamScore } from "@/lib/types"

interface LiveScoreCardProps {
  match: Match
  className?: string
}

export function LiveScoreCard({ match, className }: LiveScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border p-4 cursor-pointer group",
        className
      )}
    >
      {/* Live indicator */}
      {match.status === "live" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-live/20 text-live text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-live-pulse" />
          LIVE
        </div>
      )}

      {/* Match info */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground">{match.series.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {match.format} {match.venue && `• ${match.venue.name}`}
        </p>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <TeamScoreRow teamScore={match.team1} isLive={match.status === "live"} />
        <TeamScoreRow teamScore={match.team2} isLive={match.status === "live"} />
      </div>

      {/* Result or status */}
      <div className="mt-3 pt-3 border-t border-border">
        {match.result ? (
          <p className="text-sm text-primary font-medium">{match.result}</p>
        ) : match.startTime ? (
          <p className="text-sm text-muted-foreground">{match.startTime}</p>
        ) : null}
      </div>

      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </motion.div>
  )
}

function TeamScoreRow({ teamScore, isLive }: { teamScore: TeamScore; isLive: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {teamScore.team.logo ? (
          <img 
            src={teamScore.team.logo} 
            alt={teamScore.team.name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {teamScore.team.shortName.slice(0, 2)}
          </div>
        )}
        <span className="font-medium">{teamScore.team.shortName}</span>
      </div>
      {teamScore.score && (
        <div className="text-right">
          <span className={cn("text-lg font-bold", isLive && "text-primary")}>
            {teamScore.score}
          </span>
          {teamScore.overs && (
            <span className="text-sm text-muted-foreground ml-1">
              ({teamScore.overs} ov)
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface MatchCardCompactProps {
  match: Match
}

export function MatchCardCompact({ match }: MatchCardCompactProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {match.team1.team.logo ? (
          <img src={match.team1.team.logo} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <span className="text-xs font-bold">{match.team1.team.shortName.slice(0, 2)}</span>
        )}
        <span className="font-medium truncate">{match.team1.team.shortName}</span>
        {match.team1.score && (
          <span className="text-sm text-muted-foreground">{match.team1.score}</span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">vs</span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {match.team2.score && (
          <span className="text-sm text-muted-foreground">{match.team2.score}</span>
        )}
        <span className="font-medium truncate">{match.team2.team.shortName}</span>
        {match.team2.team.logo ? (
          <img src={match.team2.team.logo} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <span className="text-xs font-bold">{match.team2.team.shortName.slice(0, 2)}</span>
        )}
      </div>
      {match.status === "live" && (
        <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />
      )}
    </motion.div>
  )
}
