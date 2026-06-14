import type { MetadataRoute } from "next"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getManualNews } from "@/lib/news"

const siteUrl = "https://cricyug.netlify.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/matches",
    "/live",
    "/rankings",
    "/stats",
    "/search",
    "/assistant",
    "/teams",
    "/players",
    "/news",
    "/predictions",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ]

  const staticRoutes = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/matches" || route === "/live" ? "hourly" : "daily",
    priority: route === "" ? 1 : route === "/matches" || route === "/live" ? 0.9 : 0.7,
  }) satisfies MetadataRoute.Sitemap[number])

  const service = getCricketDataService()
  const [matches, series] = await Promise.all([
    service ? service.getMatches().catch(() => []) : Promise.resolve([]),
    service ? service.getSeriesList().catch(() => []) : Promise.resolve([]),
  ])

  const matchRoutes = matches.slice(0, 50).map((match) => ({
    url: `${siteUrl}/matches/${match.id}`,
    lastModified: new Date(match.startTime || Date.now()),
    changeFrequency: match.status === "live" ? "hourly" : "daily",
    priority: match.status === "live" ? 0.8 : 0.6,
  }) satisfies MetadataRoute.Sitemap[number])

  const seriesRoutes = series.slice(0, 50).map((item) => ({
    url: `${siteUrl}/series/${item.id}`,
    lastModified: new Date(item.startDate || Date.now()),
    changeFrequency: item.status === "ongoing" ? "daily" : "weekly",
    priority: item.status === "ongoing" ? 0.7 : 0.5,
  }) satisfies MetadataRoute.Sitemap[number])

  const newsRoutes = getManualNews().map((article) => ({
    url: `${siteUrl}/news/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }) satisfies MetadataRoute.Sitemap[number])

  return [...staticRoutes, ...matchRoutes, ...seriesRoutes, ...newsRoutes]
}
