"use client"

import { motion } from "framer-motion"
import { Brain, TrendingUp, Target, Zap, BarChart2 } from "lucide-react"
import { EmptyState } from "@/components/ui/states"

interface AnalysisTabProps {
  matchId: string
}

export function AnalysisTab({ matchId }: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      {/* AI Analysis Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-primary/20 via-card to-secondary/20 border border-primary/30 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 mx-auto mb-6">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Match Analysis</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Advanced AI-powered match analysis coming soon. Get real-time win probabilities, player performance predictions, and strategic insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <FeaturePreview icon={TrendingUp} label="Win Probability" />
          <FeaturePreview icon={Target} label="Performance Insights" />
          <FeaturePreview icon={Zap} label="Key Moments" />
        </div>
      </motion.div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisFeatureCard
          icon={TrendingUp}
          title="Momentum Analysis"
          description="Track momentum shifts throughout the match with real-time scoring patterns and pressure indicators."
        />
        <AnalysisFeatureCard
          icon={Target}
          title="Player Impact"
          description="Understand how individual player performances affect overall match outcomes."
        />
        <AnalysisFeatureCard
          icon={Zap}
          title="Pressure Points"
          description="Identify critical moments that could change the course of the match."
        />
        <AnalysisFeatureCard
          icon={BarChart2}
          title="Historical Data"
          description="Compare current match statistics with historical performance data."
        />
      </div>
    </div>
  )
}

function FeaturePreview({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function AnalysisFeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
