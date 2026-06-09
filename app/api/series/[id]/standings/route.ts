import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoPointsTable } from "@/lib/demo-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: seriesId } = await params

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: demoPointsTable,
        meta: {
          seriesId,
          configured: false,
          total: demoPointsTable.length,
          message: "Showing demo standings. Add CRICKET_API_KEY for live points tables.",
        },
      })
    }

    // Keep standings optional so the page remains stable across API plans.
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
        data: demoPointsTable,
        meta: {
          seriesId,
          configured: false,
          total: demoPointsTable.length,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch series standings",
          message: "Live API failed, so CricYug is showing demo standings.",
        },
      },
      { status: 200 }
    )
  }
}
