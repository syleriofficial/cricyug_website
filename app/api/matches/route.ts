import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const format = searchParams.get("format")
  const limit = Number(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          limit,
          configured: false,
          message: "CRICKETDATA_API_KEY is required for live match data.",
        },
      }, { status: 503 })
    }

    const matches = await service.getCurrentMatches()

    const filtered = matches.filter((match) => {
      const statusMatches = status ? match.status === status : true
      const formatMatches = format ? match.format.toLowerCase() === format.toLowerCase() : true
      return statusMatches && formatMatches
    })

    return NextResponse.json({
      data: filtered.slice(0, limit),
      meta: {
        total: filtered.length,
        limit,
        configured: true,
      },
    })
  } catch (error) {
    console.error("[CricYug] /api/matches error:", error)

    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Unknown API error",
      },
    }, { status: 502 })
  }
}
