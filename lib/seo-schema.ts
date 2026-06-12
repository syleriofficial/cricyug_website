import type { Match, NewsArticle } from "@/lib/types"

const siteUrl = "https://cricyug.netlify.app"

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CricYug",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function sportsEventSchema(match: Match) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.team1.team.name} vs ${match.team2.team.name}`,
    sport: "Cricket",
    startDate: match.startTime || undefined,
    eventStatus: match.status === "completed" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    location: match.venue.name
      ? {
          "@type": "Place",
          name: match.venue.name,
          address: [match.venue.city, match.venue.country].filter(Boolean).join(", "),
        }
      : undefined,
    competitor: [
      { "@type": "SportsTeam", name: match.team1.team.name },
      { "@type": "SportsTeam", name: match.team2.team.name },
    ],
  }
}

export function articleSchema(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author || "CricYug Desk",
    },
    publisher: {
      "@type": "Organization",
      name: "CricYug",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/news/${article.id}`,
  }
}
