// CricYug API - Points Table
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const series = searchParams.get("series")

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          configured: false,
          message: "Cricket API not configured. Add CRICKET_API_KEY to environment variables."
        }
      })
    }

    // Points table data is not yet available from the cricket data provider.
    // Returning an empty, configured response keeps consumers in a graceful state.
    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        series: series || null,
        configured: true
      }
    })
  } catch (error) {
    console.error("[CricYug] Points Table API Error:", error)

    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch points table"
      }
    }, { status: 500 })
  }
}
