import { Header, MobileNav } from "@/components/layout/navigation"
import { HeroSection } from "@/components/home/hero-section"
import { LiveMatchesSection } from "@/components/home/live-matches-section"
import { AIInsightsSection } from "@/components/home/ai-insights-section"
import { NewsSection } from "@/components/home/news-section"
import { TopPlayersSection } from "@/components/home/top-players-section"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <LiveMatchesSection />
        <AIInsightsSection />
        <NewsSection />
        <TopPlayersSection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
