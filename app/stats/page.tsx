import type { Metadata } from "next"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdSlot } from "@/components/ads/ad-slot"
import { getCricketDataService } from "@/lib/api/cricket-data"

export const metadata: Metadata = {
  title: "Cricket Stats & Records | CricYug",
  description: "Live cricket stats, records and scoring snapshots from official match data.",
}

export default async function StatsPage() {
  const service = getCricketDataService()
  const matches = service ? await service.getMatches().catch(() => []) : []
  const scoringRows = matches
    .flatMap((match) => [
      { match, team: match.team1.team, score: match.team1.score, overs: match.team1.overs, runRate: match.team1.runRate },
      { match, team: match.team2.team, score: match.team2.score, overs: match.team2.overs, runRate: match.team2.runRate },
    ])
    .filter((row) => row.score)
    .slice(0, 20)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Stats & Records</h1>
              <p className="text-muted-foreground">Official live match scoring snapshots and records hub</p>
            </div>
          </div>

          <AdSlot id="stats-top-banner" label="Stats top banner ad" className="mb-6" minHeight="min-h-20" />

          {scoringRows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Stats data temporarily unavailable</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Official match score data is not available right now. CricYug will not show estimated records.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border bg-muted/50 p-4">
                <h2 className="font-semibold">Current Scoring Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="p-3 text-left">Team</th>
                      <th className="p-3 text-right">Score</th>
                      <th className="p-3 text-right">Overs</th>
                      <th className="p-3 text-left">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoringRows.map((row) => (
                      <tr key={`${row.match.id}-${row.team.id}`} className="border-b border-border last:border-0">
                        <td className="p-3 font-semibold">{row.team.name}</td>
                        <td className="p-3 text-right font-bold text-primary">{row.score}</td>
                        <td className="p-3 text-right text-muted-foreground">{row.overs || "-"}</td>
                        <td className="p-3">
                          <Link href={`/matches/${row.match.id}`} className="text-sm text-secondary hover:underline">
                            {row.match.team1.team.shortName} vs {row.match.team2.team.shortName}
                          </Link>
                        </td>
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
