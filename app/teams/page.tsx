import { Header, MobileNav } from "@/components/layout/navigation"
import { TeamsPageContent } from "@/components/teams/teams-page-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Teams | CricYug",
  description: "Explore international cricket teams, rankings, and statistics.",
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <TeamsPageContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
