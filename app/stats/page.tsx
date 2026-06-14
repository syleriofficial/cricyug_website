import type { Metadata } from "next"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdSlot } from "@/components/ads/ad-slot"
import { getDbRecords } from "@/lib/db/cricyug-db"

export const metadata: Metadata = {
  title: "Cricket Stats & Records | CricYug",
  description: "CricYug database cricket records, most runs, wickets, strike rate and economy tables.",
}

export default async function StatsPage() {
  const records = await getDbRecords({ limit: 50 })

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
              <p className="text-muted-foreground">Historical records from the CricYug database</p>
            </div>
          </div>

          <AdSlot id="stats-top-banner" label="Stats top banner ad" className="mb-6" minHeight="min-h-20" />

          {records.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Records data temporarily unavailable</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Add verified rows to the CricYug records table. CricYug will not show estimated or fake records.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border bg-muted/50 p-4">
                <h2 className="font-semibold">Historical Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="p-3 text-left">Team</th>
                      <th className="p-3 text-left">Record</th>
                      <th className="p-3 text-left">Format</th>
                      <th className="p-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="p-3 font-semibold">{row.player?.name || row.team?.name || "CricYug"}</td>
                        <td className="p-3">
                          <Link href={`/stats#${row.id}`} className="text-sm text-secondary hover:underline">
                            {row.title}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.format}</td>
                        <td className="p-3 text-right font-bold text-primary">{row.value}</td>
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
