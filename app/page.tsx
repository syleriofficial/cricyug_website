import { Header, MobileNav } from "@/components/layout/navigation"
import { HeroSection } from "@/components/home/hero-section"
import { LiveTopStrip } from "@/components/home/live-top-strip"
import { TodayMatchesSection } from "@/components/home/today-matches-section"
import { LiveMatchesSection } from "@/components/home/live-matches-section"
import { AIInsightsSection } from "@/components/home/ai-insights-section"
import { NewsSection } from "@/components/home/news-section"
import { TopPlayersSection } from "@/components/home/top-players-section"
import { TrendingSeriesSection } from "@/components/home/trending-series-section"
import { Footer } from "@/components/layout/footer"
import { JsonLd } from "@/components/seo/json-ld"
import { websiteSchema } from "@/lib/seo-schema"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={websiteSchema()} />
      <Header />
      <LiveTopStrip />
      <main className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <TodayMatchesSection />
        <LiveMatchesSection />
        <TrendingSeriesSection />
        <AIInsightsSection />
        <NewsSection />
        <TopPlayersSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
