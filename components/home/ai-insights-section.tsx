"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Cpu, Sparkles, BarChart3, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIInsightsSection() {
  return (
    <section className="py-10 lg:py-12 bg-muted/60">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Syleri Technology Insights</h2>
              <p className="text-sm text-muted-foreground">Predictions, previews and live match intelligence</p>
            </div>
          </div>
          <Link href="/predictions">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              Open Syleri
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Syleri features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-primary/20 p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Match Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Server-side win probability based on live score, format, wickets and official match state.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-gradient-to-br from-secondary/10 via-card to-primary/10 border border-secondary/20 p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 mb-4">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Player Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Syleri-ready analysis layer for player impact, form notes and matchup context.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-gradient-to-br from-live/10 via-card to-primary/10 border border-live/20 p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-live/20 mb-4">
              <Zap className="h-6 w-6 text-live" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Live Insights</h3>
            <p className="text-sm text-muted-foreground">
              Instant read on momentum, pressure and next phase during live matches.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-xl bg-card border border-border p-5 text-center"
        >
          <Cpu className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Syleri Technology Is Live</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            CricYug now exposes prediction, preview, live insight, news draft and smart search routes behind server-only keys.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
