import { Header, MobileNav } from "@/components/layout/navigation"
import { MatchCenterContent } from "@/components/matches/match-center-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Match Center | CricYug",
  description: "Complete match coverage with scorecard, commentary, and AI analysis.",
}

export default function MatchCenterPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <MatchCenterContent params={params} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
