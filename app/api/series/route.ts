// CricYug API - Series
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "international" | "league" | "domestic" | null
  const status = searchParams.get("status")
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
          message: "Cricket API not configured. Add CRICKET_API_KEY to environment variables."
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
      data: [],
      meta: { 
        total: 0, 
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch series"
      }
    }, { status: 500 })
  }
}
