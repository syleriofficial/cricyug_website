import type { Metadata } from "next"
import { PointsTableContent } from "@/components/points-table/points-table-content"

export const metadata: Metadata = {
  title: "Points Table | CricYug",
  description: "View cricket tournament standings, points table, and team rankings for IPL, World Cup, and more.",
}

export default function PointsTablePage() {
  return (
    <main className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Points Table</h1>
        <p className="text-muted-foreground mb-6">Tournament standings and team rankings</p>
        <PointsTableContent />
      </div>
    </main>
  )
}
