// CricYug API - Series
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoSeries } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "international" | "league" | "domestic" | null
  const status = searchParams.get("status")
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()
    
    if (!service) {
      const filtered = status ? demoSeries.filter((series) => series.status === status) : demoSeries

      return NextResponse.json({
        data: filtered.slice(0, limit),
        meta: { 
          total: filtered.length,
          limit,
          configured: false,
          message: "Showing demo series. Add CRICKET_API_KEY for live data."
        }
      })
    }

    const series = await service.getSeriesList(type || undefined)
    
    // Filter by status if provided
    let filtered = series
    if (status) {
      filtered = series.filter(s => s.status === status)
    }

    return NextResponse.json({
      data: filtered.slice(0, limit),
      meta: { 
        total: filtered.length, 
        limit,
        configured: true
      }
    })
  } catch (error) {
    console.error("[CricYug] Series API Error:", error)
    
    return NextResponse.json({
      data: demoSeries.slice(0, limit),
      meta: { 
        total: demoSeries.length,
        limit,
        configured: false,
        error: error instanceof Error ? error.message : "Failed to fetch series"
      }
    }, { status: 200 })
  }
}
