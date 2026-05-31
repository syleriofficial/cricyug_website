import type { Metadata } from "next"
import { SeriesPageContent } from "@/components/series/series-page-content"

export const metadata: Metadata = {
  title: "Cricket Series | CricYug",
  description: "Browse all cricket series, tournaments, and leagues. IPL, World Cup, Ashes, and more.",
}

export default function SeriesPage() {
  return (
    <main className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cricket Series</h1>
        <p className="text-muted-foreground mb-6">Browse tournaments, leagues, and bilateral series</p>
        <SeriesPageContent />
      </div>
    </main>
  )
}
