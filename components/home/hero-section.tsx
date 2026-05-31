"use client"

import { motion } from "framer-motion"
import { ArrowRight, Brain, Radio, Trophy, Sparkles, Users, Newspaper } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-20">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[128px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Premium Cricket Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="text-balance">Experience Cricket Like </span>
            <span className="text-gradient-brand">Never Before</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty"
          >
            Real-time scores, comprehensive coverage, player statistics, and in-depth analysis of cricket matches worldwide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="/live">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-6">
                <Radio className="h-5 w-5" />
                Watch Live Matches
              </Button>
            </Link>
            <Link href="/news">
              <Button size="lg" variant="outline" className="gap-2 h-12 px-6 border-border hover:bg-muted">
                <Newspaper className="h-5 w-5" />
                Latest News
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <FeatureCard icon={Radio} label="Live Scores" description="Real-time updates" />
            <FeatureCard icon={Users} label="Players" description="Stats & profiles" />
            <FeatureCard icon={Trophy} label="Matches" description="Full coverage" />
            <FeatureCard icon={Brain} label="AI Insights" description="Coming soon" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ 
  icon: Icon, 
  label,
  description
}: { 
  icon: React.ElementType
  label: string
  description: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card/50 border border-border p-4 text-center hover:border-primary/30 transition-colors">
      <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
