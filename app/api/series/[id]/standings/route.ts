import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: seriesId } = await params

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          seriesId,
          configured: false,
          total: 0,
          message: "CRICKETDATA_API_KEY is required for points tables.",
        },
      }, { status: 503 })
    }

    const standings = await service.getSeriesStandings(seriesId)

    return NextResponse.json({
      data: standings,
      meta: {
        seriesId,
        configured: true,
        total: standings.length,
        message: standings.length > 0 ? undefined : "Official points table is not available for this series yet.",
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
          total: 0,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch series standings",
        },
      },
      { status: 502 }
    )
  }
}
