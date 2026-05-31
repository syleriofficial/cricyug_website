// Series Standings API Route - Production Ready
// Fetches points table data for a specific series

import { NextResponse } from "next/server"
import { CricketDataService } from "@/lib/api/cricket-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.CRICKET_API_KEY

  // Check if API is configured
  if (!apiKey) {
    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        limit: 20,
        configured: false,
        message: "CRICKET_API_KEY environment variable is not set",
      },
    })
  }

  try {
    const service = new CricketDataService({ apiKey })
    const standings = await service.getSeriesStandings(id)

    return NextResponse.json({
      data: standings,
      meta: {
        total: standings.length,
        limit: standings.length,
        configured: true,
      },
    })
  } catch (error) {
    console.error("Error fetching series standings:", error)

    return NextResponse.json(
      {
        data: [],
        meta: {
          total: 0,
          configured: true,
          error: error instanceof Error ? error.message : "Failed to fetch standings",
        },
      },
      { status: 500 }
    )
  }
}
