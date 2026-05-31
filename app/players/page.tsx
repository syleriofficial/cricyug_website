import { Header, MobileNav } from "@/components/layout/navigation"
import { PlayersPageContent } from "@/components/players/players-page-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Players | CricYug",
  description: "Explore cricket player profiles, statistics, and rankings.",
}

export default function PlayersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <PlayersPageContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
