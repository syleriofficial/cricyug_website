import type { Metadata } from "next"
import Link from "next/link"
import { Brain, Search } from "lucide-react"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { createAISearchAnswer } from "@/lib/ai-cricket"
import { searchCricYugDb } from "@/lib/db/cricyug-db"

export const metadata: Metadata = {
  title: "AI Cricket Assistant | CricYug",
  description: "Ask CricYug's cricket assistant about players, teams, matches, series and records from the CricYug database.",
}

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = q?.trim() || ""
  const answer = query
    ? await createAISearchAnswer(query, await searchCricYugDb(query, 8))
    : {
        provider: process.env.OPENAI_API_KEY ? "openai" as const : "cricyug-rules" as const,
        answer: "Ask about a player, team, series, record, or match in the CricYug database.",
        results: [],
      }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Cricket Assistant</h1>
              <p className="text-muted-foreground">Hindi + English cricket answers backed by CricYug database content.</p>
            </div>
          </div>

          <form className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row" action="/assistant">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Ask about Virat Kohli, India, IPL records..."
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="h-11">Ask</Button>
          </form>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase text-primary">{answer.provider === "openai" ? "AI answer" : "CricYug rules answer"}</p>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Database-backed</span>
            </div>
            <p className="text-lg leading-8">{answer.answer}</p>
          </div>

          {answer.results.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {answer.results.map((result) => (
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
