import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: false,
          message: "CRICKETDATA_API_KEY is required for player profiles.",
        },
      }, { status: 503 })
    }

    const player = await service.getPlayerInfo(id)

    if (!player) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: true,
          message: "Player not found.",
        },
      }, { status: 404 })
    }

    return NextResponse.json({
      data: player,
      meta: {
        configured: true,
      },
    })
  } catch (error) {
    console.error("[CricYug] Player Details API Error:", error)

    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch player profile",
      },
    }, { status: 502 })
  }
}
