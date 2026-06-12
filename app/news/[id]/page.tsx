import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getManualNewsArticle } from "@/lib/news"
import { AdSlot } from "@/components/ads/ad-slot"
import { JsonLd } from "@/components/seo/json-ld"
import { articleSchema, breadcrumbSchema } from "@/lib/seo-schema"

type NewsPageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { id } = await params
  const article = getManualNewsArticle(id)

  if (!article) {
    return {
      title: "CricYug Story",
      description: "Read CricYug cricket analysis and editorial stories.",
    }
  }

  return {
    title: `${article.title} | CricYug`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author || "CricYug Desk"],
      images: article.image ? [article.image] : undefined,
    },
  }
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const { id } = await params
  const article = getManualNewsArticle(id)
  if (!article) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd
        data={[
          articleSchema(article),
          breadcrumbSchema([
            { name: "Home", url: "https://cricyug.netlify.app" },
            { name: "News", url: "https://cricyug.netlify.app/news" },
            { name: article.title, url: `https://cricyug.netlify.app/news/${article.id}` },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <article className="mx-auto max-w-3xl px-4 py-10 lg:py-16">
          <Link href="/news" className="text-sm text-primary hover:underline">Back to News</Link>
          <div className="mt-6">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {article.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              {article.author || "CricYug Desk"} • {new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>
          <AdSlot id="news-in-article" label="In-article ad" className="mt-8" minHeight="min-h-28" />
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <p className="leading-8 text-muted-foreground">
              {article.content}
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Related Articles</h2>
            <p className="mt-2 text-sm text-muted-foreground">More related CricYug stories will appear as your editorial desk publishes articles in this category.</p>
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
