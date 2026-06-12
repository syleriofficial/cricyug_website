"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Newspaper, Search } from "lucide-react"
import { NewsCard } from "@/components/cricket/news-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNews } from "@/hooks/use-cricket-data"
import { LoadingNewsCard, ErrorState, NoNews, NoResults } from "@/components/ui/states"
import Link from "next/link"
import { AdSlot } from "@/components/ads/ad-slot"

const categories = ["All", "India", "IPL", "World Cricket", "Fantasy", "Analysis"]

export function NewsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: news, error, isLoading, mutate } = useNews({
    category: selectedCategory,
  })

  // Filter by search query on client side
  const filteredNews = news?.filter(article => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return article.title.toLowerCase().includes(query) ||
           article.excerpt.toLowerCase().includes(query)
  })

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
              <Newspaper className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cricket News</h1>
              <p className="text-muted-foreground">Manual CricYug editorial updates and analysis</p>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category === "All" ? undefined : category)}
                  className={cn(
                    "whitespace-nowrap",
                    (category === "All" && !selectedCategory) || selectedCategory === category
                      ? "bg-primary/10 text-primary"
                      : ""
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading State */}
            {isLoading && (
              <>
                <LoadingNewsCard />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <LoadingNewsCard key={i} />
                  ))}
                </div>
              </>
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
            {!isLoading && !error && (!filteredNews || filteredNews.length === 0) && (
              searchQuery ? <NoResults query={searchQuery} /> : <NoNews />
            )}

            {/* News content */}
            {!isLoading && !error && filteredNews && filteredNews.length > 0 && (
              <>
                {/* Featured article */}
                <Link href={`/news/${filteredNews[0].id}`}>
                  <NewsCard article={filteredNews[0]} variant="featured" />
                </Link>

                {/* Regular articles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredNews.slice(1).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/news/${article.id}`}>
                        <NewsCard article={article} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdSlot id="news-sidebar" label="News sidebar ad" minHeight="min-h-64" />

            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 p-6">
              <h3 className="font-bold text-lg mb-2">Publish CricYug News</h3>
              <p className="text-sm text-muted-foreground mb-4">
                News is manually controlled. Draft articles with Syleri tools, then publish approved stories through the manual news file.
              </p>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/predictions">Open Syleri Tools</Link>
              </Button>
            </div>

            {/* Editor's picks */}
            {filteredNews && filteredNews.length > 0 && (
              <div className="rounded-xl bg-card border border-border p-4">
                <h3 className="font-semibold mb-4">Editor&apos;s Picks</h3>
                <div className="space-y-1">
                  {filteredNews.slice(0, 3).map((article) => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <NewsCard article={article} variant="compact" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-card border border-border p-4">
              <h3 className="font-semibold mb-2">Manual News Desk</h3>
              <p className="text-sm text-muted-foreground">
                CricYug stories are curated manually by your editorial team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
