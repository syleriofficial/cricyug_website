import type { MetadataRoute } from "next"

const siteUrl = "https://cricyug.netlify.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/matches",
    "/live",
    "/series",
    "/points-table",
    "/teams",
    "/players",
    "/news",
    "/predictions",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/matches" || route === "/live" ? "hourly" : "daily",
    priority: route === "" ? 1 : route === "/matches" || route === "/live" ? 0.9 : 0.7,
  }))
}
