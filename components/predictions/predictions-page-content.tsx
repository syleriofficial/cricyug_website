"use client"

import { motion } from "framer-motion"
import { Brain, Sparkles, BarChart3, Zap, Target, TrendingUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PredictionsPageContent() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Predictions</h1>
              <p className="text-muted-foreground">Machine learning powered cricket analytics</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-secondary/10 border border-primary/20 p-8 md:p-12 text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <Sparkles className="h-4 w-4 text-secondary-foreground" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">AI Predictions Coming Soon</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We&apos;re building advanced machine learning models to provide accurate match predictions, 
            player performance forecasts, and real-time analytics. Stay tuned for the launch.
          </p>
          <Button size="lg" className="gap-2">
            <Lock className="h-4 w-4" />
            Get Early Access
          </Button>
        </motion.div>

        {/* Feature Preview */}
        <h2 className="text-xl font-semibold mb-6">What&apos;s Coming</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <FeatureCard
            icon={Target}
            title="Match Predictions"
            description="Real-time win probability powered by advanced ML models analyzing historical data, player form, and match conditions."
            delay={0.1}
          />
          <FeatureCard
            icon={BarChart3}
            title="Player Analytics"
            description="Deep performance insights, form tracking, and career trajectory analysis for all international players."
            delay={0.2}
          />
          <FeatureCard
            icon={Zap}
            title="Live Insights"
            description="Instant analysis during live matches with momentum shifts, key moments, and tactical recommendations."
            delay={0.3}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Performance Forecasts"
            description="Predict individual player performances based on venue, opposition, and current form metrics."
            delay={0.4}
          />
          <FeatureCard
            icon={Sparkles}
            title="Fantasy Suggestions"
            description="AI-powered recommendations for fantasy cricket teams based on predicted performances."
            delay={0.5}
          />
          <FeatureCard
            icon={Brain}
            title="Match Analysis"
            description="Post-match AI analysis breaking down key decisions, turning points, and tactical insights."
            delay={0.6}
          />
        </div>

        {/* How It Works */}
        <div className="rounded-xl bg-card border border-border p-6 md:p-8 mb-12">
          <h2 className="text-xl font-semibold mb-6">How Our AI Works</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <StepCard
              number={1}
              title="Data Collection"
              description="We gather comprehensive cricket data including match history, player stats, and conditions."
            />
            <StepCard
              number={2}
              title="Model Training"
              description="Our ML models learn patterns from thousands of matches to identify winning factors."
            />
            <StepCard
              number={3}
              title="Real-time Analysis"
              description="During live matches, our system processes data in real-time for instant predictions."
            />
            <StepCard
              number={4}
              title="Continuous Learning"
              description="Models are continuously updated with new match data to improve accuracy."
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl bg-muted/30 border border-border p-4">
          <p className="text-xs text-muted-foreground text-center">
            AI predictions will be based on historical data, current form, and various match factors. 
            Predictions are for informational purposes only and should not be used for betting or gambling.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay 
}: { 
  icon: React.ElementType
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-card border border-border p-6 hover:border-primary/30 transition-colors"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
