import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { demoNews } from "@/lib/demo-data"

export const metadata = {
  title: "CricYug Story",
  description: "Read CricYug cricket analysis and editorial stories.",
}

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = demoNews.find((item) => item.id === id) || demoNews[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <article className="mx-auto max-w-3xl px-4 py-10 lg:py-16">
          <Link href="/news" className="text-sm text-primary hover:underline">Back to News</Link>
          <div className="mt-6">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {article.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">{article.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              {article.author || "CricYug Desk"} • {new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <p className="leading-8 text-muted-foreground">
              {article.content ||
                "This manual CricYug story is ready for your editorial team to expand. Add full article copy in the manual news data source or connect a future CMS when you are ready."}
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
