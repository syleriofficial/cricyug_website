import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getDbPlayer } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const dbPlayer = await getDbPlayer(id)
    if (dbPlayer || isCricYugDbConfigured()) {
      if (!dbPlayer) {
        return NextResponse.json({
          data: null,
          meta: {
            configured: true,
            source: "cricyug-db",
            message: "Player not found in CricYug database.",
          },
        }, { status: 404 })
      }

      return NextResponse.json({
        data: dbPlayer,
        meta: {
          configured: true,
          source: "cricyug-db",
        },
      })
    }

    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: false,
          message: "Configure Supabase for historical player profiles. CricketData.org is optional fallback data.",
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
        source: "live-provider",
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
