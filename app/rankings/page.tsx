import type { Metadata } from "next"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdSlot } from "@/components/ads/ad-slot"
import { Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "ICC Rankings | CricYug",
  description: "ICC cricket rankings hub for teams and players on CricYug.",
}

const rankingTabs = ["Teams", "Batters", "Bowlers", "All-rounders"]

export default function RankingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ICC Rankings</h1>
              <p className="text-muted-foreground">Official rankings will appear when the connected cricket API provides ranking data.</p>
            </div>
          </div>

          <AdSlot id="rankings-top-banner" label="Rankings top banner ad" className="mb-6" minHeight="min-h-20" />

          <div className="mb-5 flex gap-2 overflow-x-auto rounded-lg bg-muted p-1">
            {rankingTabs.map((tab) => (
              <button key={tab} className="shrink-0 rounded-md bg-background px-4 py-2 text-sm font-semibold shadow-sm">
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Trophy className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Ranking data temporarily unavailable</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              CricYug does not publish estimated or fake ICC rankings. Connect an official rankings endpoint to populate teams,
              batters, bowlers and all-rounders here.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
