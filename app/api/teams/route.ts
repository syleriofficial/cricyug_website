// CricYug API - Teams
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getDbTeams } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || undefined

  try {
    const dbTeams = await getDbTeams({ search, limit })
    if (dbTeams.length > 0 || isCricYugDbConfigured()) {
      return NextResponse.json({
        data: dbTeams,
        meta: {
          total: dbTeams.length,
          limit,
          configured: true,
          source: "cricyug-db",
          message: dbTeams.length === 0 ? "No CricYug database team profiles match this filter." : undefined,
        },
      })
    }

    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          limit,
          configured: false,
          message: "Configure Supabase for historical team profiles. CricketData.org is optional fallback data.",
        },
      }, { status: 503 })
    }

    const teams = await service.getCountries()

    return NextResponse.json({
      data: teams.slice(0, limit),
      meta: {
        total: teams.length,
        limit,
        configured: true,
        source: "live-provider",
      }
    })
  } catch (error) {
    console.error("[CricYug] Teams API Error:", error)

    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch teams",
      },
    }, { status: 502 })
  }
}
