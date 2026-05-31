"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Newspaper, AlertCircle } from "lucide-react"
import { NewsCard } from "@/components/cricket/news-card"
import { Button } from "@/components/ui/button"
import { useNews } from "@/hooks/use-cricket-data"
import { LoadingNewsCard, ErrorState, EmptyState } from "@/components/ui/states"

export function NewsSection() {
  const { data: news, error, isLoading, mutate, isConfigured } = useNews({ limit: 5 })

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Newspaper className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Latest News</h2>
              <p className="text-sm text-muted-foreground">Stay updated with cricket world</p>
            </div>
          </div>
          <Link href="/news">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              All News
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LoadingNewsCard />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <LoadingNewsCard key={i} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <LoadingNewsCard />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState 
            title="Unable to load news"
            message="We couldn&apos;t fetch the latest news. Please try again."
            onRetry={() => mutate()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && (!news || news.length === 0) && (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No News Available</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {isConfigured 
                ? "Cricket news will appear here once available."
                : "Connect a news API to display the latest cricket news."}
            </p>
            {!isConfigured && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <AlertCircle className="h-4 w-4" />
                <span>News API not configured</span>
              </div>
            )}
          </div>
        )}

        {/* News content */}
        {!isLoading && !error && news && news.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main news grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured article */}
              {news[0] && (
                <Link href={`/news/${news[0].id}`}>
                  <NewsCard article={news[0]} variant="featured" />
                </Link>
              )}

              {/* Regular articles grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {news.slice(1, 5).map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={`/news/${article.id}`}>
                      <NewsCard article={article} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick news sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-4">
                <h3 className="font-semibold mb-4">Quick Updates</h3>
                <div className="space-y-1">
                  {news.slice(0, 4).map((article) => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <NewsCard article={article} variant="compact" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
