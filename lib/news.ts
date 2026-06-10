import { manualNews } from "@/content/news"
import type { NewsArticle } from "@/lib/types"

export function getManualNews(params?: { category?: string; limit?: number; offset?: number }): NewsArticle[] {
  const category = params?.category?.toLowerCase()
  const offset = params?.offset || 0
  const limit = params?.limit || manualNews.length

  return manualNews
    .filter((article) => (category ? article.category.toLowerCase() === category : true))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(offset, offset + limit)
}

export function getManualNewsArticle(id: string): NewsArticle | null {
  return manualNews.find((article) => article.id === id) || null
}

export function getManualNewsCount(category?: string): number {
  const normalized = category?.toLowerCase()
  return manualNews.filter((article) => (normalized ? article.category.toLowerCase() === normalized : true)).length
}
