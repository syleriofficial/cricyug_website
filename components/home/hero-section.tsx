"use client"

import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Brain, Radio, Shield, Sparkles, Trophy, Users, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/70 py-10 lg:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(6,182,212,0.14),transparent_28%),linear-gradient(180deg,rgba(7,20,38,0),rgba(7,20,38,0.86))]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="absolute left-1/2 top-8 -z-10 hidden h-[540px] w-[540px] -translate-x-1/2 rounded-full border border-white/10 bg-emerald-500/5 lg:block">
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/10" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium text-emerald-100">Live scores, news and cricket intelligence</span>
            </div>

            <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              CricYug brings every match pulse to one clean cricket hub.
            </h1>

            <p className="mb-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Follow live scores, upcoming fixtures, team rankings, player form and sharp match analysis without the clutter.
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/live">
                <Button size="lg" className="h-12 gap-2 bg-emerald-500 px-6 text-emerald-950 hover:bg-emerald-400">
                  <Radio className="h-5 w-5" />
                  Follow Live Scores
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="lg" variant="outline" className="h-12 gap-2 border-border bg-background/30 px-6 hover:bg-muted">
                  Match Center
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-3">
              <Stat label="Live updates" value="30s" />
              <Stat label="Coverage" value="Global" />
              <Stat label="AI tools" value="Soon" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/10 bg-card/88 p-5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-300">Featured live</p>
                  <h2 className="mt-1 text-xl font-bold">India vs Australia</h2>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-xs font-bold text-live">
                  <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />
                  LIVE
                </span>
              </div>

              <div className="space-y-4">
                <ScoreRow team="IND" name="India" score="186/4" overs="17.2 ov" tone="text-emerald-300" />
                <ScoreRow team="AUS" name="Australia" score="182/7" overs="20.0 ov" />
              </div>

              <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Win probability</span>
                  <span className="font-semibold text-emerald-300">IND 68%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[68%] rounded-full bg-emerald-400" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">India need 7 runs from 16 balls</p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniMetric icon={Zap} label="RRR" value="2.63" />
                <MiniMetric icon={BarChart3} label="CRR" value="10.73" />
                <MiniMetric icon={Shield} label="Wkts" value="6" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <FeatureCard icon={Radio} label="Live Scores" description="Ball-by-ball pulse" />
          <FeatureCard icon={Users} label="Players" description="Stats & profiles" />
          <FeatureCard icon={Trophy} label="Match Center" description="Schedules & results" />
          <FeatureCard icon={Brain} label="AI Insights" description="Predictions soon" />
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ScoreRow({ team, name, score, overs, tone = "text-foreground" }: { team: string; name: string; score: string; overs: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-background/45 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-sm font-black text-primary">
          {team}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{overs}</p>
        </div>
      </div>
      <p className={`text-2xl font-black ${tone}`}>{score}</p>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
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
    <div className="relative overflow-hidden rounded-xl bg-card/65 border border-border p-4 text-center transition-colors hover:border-emerald-400/35">
      <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
