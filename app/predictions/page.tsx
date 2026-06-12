import type { Metadata } from "next"
import { PredictionsPageContent } from "@/components/predictions/predictions-page-content"

export const metadata: Metadata = {
  title: "Syleri Predictions | CricYug",
  description: "Syleri-technology cricket predictions with win probability, player performance forecasts, and match insights.",
}

export default function PredictionsPage() {
  return (
    <main className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Syleri Predictions</h1>
          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">BETA</span>
        </div>
        <p className="text-muted-foreground mb-6">Syleri Technology powered match predictions and insights</p>
        <PredictionsPageContent />
      </div>
    </main>
  )
}
