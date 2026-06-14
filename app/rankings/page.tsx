import type { Metadata } from "next"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdSlot } from "@/components/ads/ad-slot"
import { Trophy } from "lucide-react"
import { getDbRankings } from "@/lib/db/cricyug-db"

export const metadata: Metadata = {
  title: "ICC Rankings | CricYug",
  description: "ICC cricket rankings hub for teams and players on CricYug.",
}

const rankingTabs = ["Teams", "Batters", "Bowlers", "All-rounders"]

export default async function RankingsPage() {
  const rankings = await getDbRankings({ limit: 50 })

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
              <p className="text-muted-foreground">CricYug database rankings for teams and players.</p>
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

          {rankings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Ranking data temporarily unavailable</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Add official ranking rows to the CricYug database. CricYug does not publish estimated or fake rankings.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border bg-muted/50 p-4">
                <h2 className="font-semibold">Database Rankings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Format</th>
                      <th className="p-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="p-3 font-bold text-primary">{row.position}</td>
                        <td className="p-3 font-semibold">{row.team?.name || row.player?.name || "Unknown"}</td>
                        <td className="p-3 text-muted-foreground">{row.rankingType}</td>
                        <td className="p-3 text-muted-foreground">{row.format}</td>
                        <td className="p-3 text-right font-bold">{row.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
