"use client"

import Link from "next/link"
import { Bell, Bookmark, Calendar, Shield, Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProfilePageContent() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 p-6">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase text-primary">Account Center</p>
            <h1 className="mt-1 text-3xl font-bold">Profile features are coming soon</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              CricYug accounts will support saved teams, match alerts, bookmarks and personalized cricket feeds. Until login is ready, this page stays transparent instead of showing fake user data.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PreviewCard icon={Bell} title="Match Alerts" body="Follow live and upcoming matches." />
        <PreviewCard icon={Bookmark} title="Bookmarks" body="Save stories and scorecards." />
        <PreviewCard icon={Shield} title="Favorite Teams" body="Personalize team coverage." />
        <PreviewCard icon={Trophy} title="Predictions" body="Track AI insights when launched." />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Explore CricYug</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLink href="/matches" icon={Trophy} label="Match Center" />
          <QuickLink href="/news" icon={Calendar} label="Manual News Desk" />
          <QuickLink href="/teams" icon={Shield} label="Teams" />
          <QuickLink href="/predictions" icon={Trophy} label="AI Predictions" />
        </div>
      </section>
    </div>
  )
}

function PreviewCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start gap-3 p-4">
      <Link href={href}>
        <Icon className="h-5 w-5 text-primary" />
        {label}
      </Link>
    </Button>
  )
}
