import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getDbSeriesById } from "@/lib/db/cricyug-db"

export const metadata = {
  title: "Series Detail | CricYug",
  description: "View cricket series details on CricYug.",
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const series = await getDbSeriesById(id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="mx-auto max-w-4xl px-4 py-10 lg:py-16">
          <Link href="/matches#series" className="text-sm text-primary hover:underline">Back to Matches</Link>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            {series ? (
              <>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {series.status.toUpperCase()}
                </span>
                <h1 className="mt-4 text-4xl font-bold">{series.name}</h1>
                <p className="mt-3 text-muted-foreground">{series.format} • {series.type}</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <Info label="Start" value={series.startDate || "TBA"} />
                  <Info label="End" value={series.endDate || "TBA"} />
                  <Info label="Matches" value={String(series.totalMatches || "TBA")} />
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-3xl font-bold">Series unavailable</h1>
                <p className="mt-3 text-muted-foreground">
                  This series has not been published in the CricYug database yet.
                </p>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/matches#series">All series</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/matches#points">Points table</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}
