import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoMatches } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const format = searchParams.get("format")
  const limit = Number(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()

    if (!service) {
      const filtered = demoMatches.filter((match) => {
        const statusMatches = status ? match.status === status : true
        const formatMatches = format ? match.format.toLowerCase() === format.toLowerCase() : true
        return statusMatches && formatMatches
      })

      return NextResponse.json({
        data: filtered.slice(0, limit),
        meta: {
          total: filtered.length,
          limit,
          configured: false,
          message: "Showing demo cricket data. Add CRICKET_API_KEY for live scores.",
        },
      })
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

    return NextResponse.json(
      {
        data: demoMatches.slice(0, limit),
        meta: {
          total: Math.min(demoMatches.length, limit),
          limit,
          configured: false,
          error: error instanceof Error ? error.message : "Unknown API error",
          message: "Live API failed, so CricYug is showing demo match data.",
        },
      },
      { status: 200 }
    )
  }
}
