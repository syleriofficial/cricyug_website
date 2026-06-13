import { Header, MobileNav } from "@/components/layout/navigation"
import { MatchesListContent } from "@/components/matches/matches-list-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Matches, Series & Points | CricYug",
  description: "Browse cricket matches, series filters and points table shortcuts in one match center.",
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: Promise<{ format?: string }>
}) {
  const params = await searchParams
  const format = params?.format

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <MatchesListContent initialFormat={format} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
