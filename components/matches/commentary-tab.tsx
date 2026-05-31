"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMatch } from "@/hooks/use-cricket-data"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states"
import { MessageSquare } from "lucide-react"
import type { CommentaryItem } from "@/lib/types"

interface CommentaryTabProps {
  matchId: string
}

export function CommentaryTab({ matchId }: CommentaryTabProps) {
  // Using useMatch to get match details which would include commentary in a real API
  const { data: match, error, isLoading, mutate, isConfigured } = useMatch(matchId)

  // In a production app, this would come from the match details or a separate commentary endpoint
  const commentary: CommentaryItem[] = []

  if (isLoading) {
    return <LoadingState message="Loading commentary..." />
  }

  if (error) {
    return (
      <ErrorState 
        title="Unable to load commentary"
        message="We couldn&apos;t fetch the commentary. Please try again."
        onRetry={() => mutate()}
      />
    )
  }

  if (!isConfigured || !match || commentary.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Commentary Available"
        description={
          !isConfigured 
            ? "Connect the Cricket API to view live ball-by-ball commentary."
            : "Live commentary will appear once the match begins."
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Live update banner */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />
          <span className="text-sm font-semibold text-primary">Live Commentary</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ball-by-ball updates refreshing automatically.
        </p>
      </div>

      {/* Commentary list */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {commentary.map((item, index) => {
            const isHighlight = item.isWicket || item.isBoundary || item.isSix
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "p-4 hover:bg-muted/30 transition-colors",
                  isHighlight && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Over info */}
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <span className="text-sm font-bold">{item.over}.{item.ball}</span>
                    {item.isWicket && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-destructive/20 text-destructive">
                        WICKET
                      </span>
                    )}
                    {item.isSix && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">
                        SIX
                      </span>
                    )}
                    {item.isBoundary && !item.isSix && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary/20 text-secondary">
                        FOUR
                      </span>
                    )}
                  </div>

                  {/* Commentary text */}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      isHighlight ? "font-medium" : "text-muted-foreground"
                    )}>
                      {item.text}
                    </p>
                  </div>

                  {/* Runs */}
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    item.isSix && "bg-primary/20 text-primary",
                    item.isBoundary && !item.isSix && "bg-secondary/20 text-secondary",
                    item.runs === 0 && !item.isWicket && "bg-muted text-muted-foreground",
                    item.isWicket && "bg-destructive/20 text-destructive"
                  )}>
                    {item.isWicket ? "W" : item.runs || 0}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Load more */}
      <div className="text-center">
        <button className="text-sm text-primary hover:underline">
          Load previous overs...
        </button>
      </div>
    </div>
  )
}
