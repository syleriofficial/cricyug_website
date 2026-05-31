"use client"

import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/ui/states"

interface StatsTabProps {
  matchId: string
}

export function StatsTab({ matchId }: StatsTabProps) {
  // In production, this would use useMatchStats(matchId) hook
  // For now, show a "coming soon" state since we don't have real data
  
  return (
    <div className="space-y-6">
      {/* Stats Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-secondary/20 via-card to-primary/20 border border-secondary/30 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20 mx-auto mb-6">
          <BarChart3 className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Match Statistics</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Detailed match statistics including run rates, partnerships, and phase analysis will be available once the match data is connected.
        </p>
      </motion.div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsFeatureCard
          title="Run Rate Comparison"
          description="Compare run rates across powerplay, middle overs, and death overs."
        />
        <StatsFeatureCard
          title="Partnership Analysis"
          description="Track partnerships and their contributions to the total score."
        />
        <StatsFeatureCard
          title="Over-by-Over Breakdown"
          description="Visual representation of runs scored in each over."
        />
        <StatsFeatureCard
          title="Boundary Count"
          description="Track fours and sixes hit by each team."
        />
        <StatsFeatureCard
          title="Dot Ball Percentage"
          description="Analyze pressure through dot ball statistics."
        />
        <StatsFeatureCard
          title="Phase Comparison"
          description="Compare team performance across different match phases."
        />
      </div>
    </div>
  )
}

function StatsFeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4"
    >
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}
