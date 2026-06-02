import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const seriesId = params.id

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          seriesId,
          configured: false,
          error: "CRICKET_API_KEY missing",
        },
      })
    }

    // अगर service में standings method नहीं है तो empty state return करो.
    // इससे build fail नहीं होगा और UI safe रहेगा.
    const standings =
      "getSeriesStandings" in service &&
      typeof service.getSeriesStandings === "function"
        ? await service.getSeriesStandings(seriesId)
        : []

    return NextResponse.json({
      data: standings,
      meta: {
        seriesId,
        configured: true,
        total: Array.isArray(standings) ? standings.length : 0,
      },
    })
  } catch (error) {
    console.error("[CricYug] series standings API error:", error)

    return NextResponse.json(
      {
        data: [],
        meta: {
          seriesId,
          configured: true,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch series standings",
        },
      },
      { status: 500 }
    )
  }
}
