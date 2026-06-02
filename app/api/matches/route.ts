import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
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
          error: "CRICKET_API_KEY missing",
        },
      })
    }

    const matches = await service.getCurrentMatches()

    const filtered = status
      ? matches.filter((m) => m.status === status)
      : matches

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
        data: [],
        meta: {
          total: 0,
          limit,
          configured: true,
          error: error instanceof Error ? error.message : "Unknown API error",
        },
      },
      { status: 500 }
    )
  }
}
