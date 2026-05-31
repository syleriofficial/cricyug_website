// CricYug API - Points Table
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const seriesId = searchParams.get("seriesId")

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

    if (!seriesId) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          configured: true,
          message: "Missing seriesId parameter."
        }
      })
    }

    const standings =
      typeof (service as { getPointsTable?: unknown }).getPointsTable === "function"
        ? await (service as { getPointsTable: (id: string) => Promise<unknown[]> }).getPointsTable(seriesId)
        : []

    return NextResponse.json({
      data: standings,
      meta: {
        total: standings.length,
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
