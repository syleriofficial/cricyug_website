import { Header, MobileNav } from "@/components/layout/navigation"
import { MatchesListContent } from "@/components/matches/matches-list-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "All Matches | CricYug",
  description: "Browse all cricket matches - live, upcoming, and completed.",
}

export default function MatchesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <MatchesListContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
