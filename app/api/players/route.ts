// CricYug API - Players
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getDbPlayers } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"
import type { PlayerRole } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const role = searchParams.get("role")
  const format = searchParams.get("format")
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const dbPlayers = await getDbPlayers({ search: search || undefined, role: role || undefined, limit })
    if (dbPlayers.length > 0 || isCricYugDbConfigured()) {
      return NextResponse.json({
        data: dbPlayers,
        meta: {
          total: dbPlayers.length,
          limit,
          configured: true,
          source: "cricyug-db",
          message: dbPlayers.length === 0 ? "No CricYug database player profiles match this filter." : undefined,
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
          message: "Configure Supabase for historical player profiles. CricketData.org is optional fallback data."
        }
      }, { status: 503 })
    }

    const requestedRole =
      role === "Batsman" || role === "Bowler" || role === "All-rounder" || role === "Wicket-keeper"
        ? role as PlayerRole
        : undefined

    const players = search && search.length >= 2
      ? await service.searchPlayers(search)
      : await service.getFeaturedPlayers(requestedRole)

    const filtered = requestedRole
      ? players.filter((player) => player.role === requestedRole)
      : players

    return NextResponse.json({
      data: filtered.slice(0, limit),
      meta: { 
        total: filtered.length, 
        limit,
        configured: true,
        source: "live-provider",
        message: format && format !== "All Formats"
          ? `${format} selected. CricketData.org player profiles are format-neutral, so matching profiles are shown.`
          : undefined,
      }
    })
  } catch (error) {
    console.error("[CricYug] Players API Error:", error)
    
    return NextResponse.json({
      data: [],
      meta: { 
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch players"
      }
    }, { status: 502 })
  }
}
