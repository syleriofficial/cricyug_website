import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { searchCricYugDb } from "@/lib/db/cricyug-db"

export const metadata: Metadata = {
  title: "Advanced Cricket Search | CricYug",
  description: "Search CricYug database players, teams, series, matches and records.",
}

const filters = ["all", "player", "team", "series", "match"]

export default async function AdvancedSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q, type } = await searchParams
  const query = q?.trim() || ""
  const activeType = type || "all"
  const allResults = query ? await searchCricYugDb(query, 30) : []
  const results = activeType === "all" ? allResults : allResults.filter((result) => result.type === activeType)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Advanced Search</h1>
              <p className="text-muted-foreground">Search CricYug database knowledge across players, teams, series and matches.</p>
            </div>
          </div>

          <form className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row" action="/search">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search players, teams, series, records..."
              className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input type="hidden" name="type" value={activeType} />
            <Button type="submit" className="h-11">Search</Button>
          </form>

          <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg bg-muted p-1">
            {filters.map((filter) => (
              <Link
                key={filter}
                href={`/search?q=${encodeURIComponent(query)}&type=${filter}`}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${activeType === filter ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
              >
                {filter.toUpperCase()}
              </Link>
            ))}
          </div>

          {query && results.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="text-xl font-semibold">No database results</h2>
              <p className="mt-2 text-sm text-muted-foreground">Add verified CricYug database rows or try a different cricket keyword.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <Link key={`${result.type}-${result.id}`} href={result.url} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <p className="text-xs font-semibold uppercase text-primary">{result.type}</p>
                  <h2 className="mt-1 font-bold">{result.title}</h2>
                  {result.subtitle && <p className="mt-1 text-sm text-muted-foreground">{result.subtitle}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
