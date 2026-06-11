// CricYug API - Series
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "international" | "league" | "domestic" | null
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const featured = searchParams.get("featured") === "true"
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: [],
        meta: { 
          total: 0,
          limit,
          configured: false,
          message: "CRICKETDATA_API_KEY is required for live series data."
        }
      }, { status: 503 })
    }

    const series = await service.getSeriesList(type || undefined)
    
    // Filter by status if provided
    let filtered = featured ? series.filter(s => s.status === "ongoing") : series
    let usedFallback = false
    if (status) {
      filtered = series.filter(s => s.status === status)
    }
    if (category && category !== "all") {
      filtered = filtered.filter(s => s.category === category)
    }

    if (filtered.length === 0 && category && category !== "all") {
      filtered = series.slice(0, limit)
      usedFallback = true
    }

    if (featured && filtered.length > 0) {
      const candidates = filtered.slice(0, 12)
      const standingsCounts = await Promise.all(
        candidates.map(async (item) => {
          const standings = await service.getSeriesStandings(item.id).catch(() => [])
          return [item.id, standings.length] as const
        })
      )
      const countBySeries = new Map(standingsCounts)

      filtered = [...filtered].sort((a, b) => {
        const standingsDelta = (countBySeries.get(b.id) || 0) - (countBySeries.get(a.id) || 0)
        if (standingsDelta !== 0) return standingsDelta
        return a.name.localeCompare(b.name)
      })
    }

    return NextResponse.json({
      data: filtered.slice(0, limit),
      meta: { 
        total: filtered.length, 
        limit,
        configured: true,
        category: category || "all",
        message: usedFallback
          ? `${category} series are not available right now, so latest series are shown.`
          : undefined,
      }
    })
  } catch (error) {
    console.error("[CricYug] Series API Error:", error)
    
    return NextResponse.json({
      data: [],
      meta: { 
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch series"
      }
    }, { status: 502 })
  }
}
