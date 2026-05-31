import { Header, MobileNav } from "@/components/layout/navigation"
import { LiveMatchesContent } from "@/components/live/live-matches-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Live Matches | CricYug",
  description: "Watch live cricket scores with real-time updates, ball-by-ball commentary, and AI predictions.",
}

export default function LiveMatchesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <LiveMatchesContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
