import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "CricYug Story",
  description: "Read CricYug cricket analysis and editorial stories.",
}

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await params

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <article className="mx-auto max-w-3xl px-4 py-10 lg:py-16">
          <Link href="/news" className="text-sm text-primary hover:underline">Back to News</Link>
          <div className="mt-6">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Editorial
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Story not published yet</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              CricYug news is ready for manual editorial stories. No live article exists for this URL yet.
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <p className="leading-8 text-muted-foreground">
              Add articles through your future CMS or server-side editorial source. The frontend does not expose any API keys or use fake story content.
            </p>
          </div>
          <Button asChild className="mt-8">
            <Link href="/news">More stories</Link>
          </Button>
        </article>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
