// CricYug API - Players
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoPlayers } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()
    
    if (!service) {
      const filtered = search
        ? demoPlayers.filter((player) => `${player.name} ${player.country} ${player.role}`.toLowerCase().includes(search.toLowerCase()))
        : demoPlayers

      return NextResponse.json({
        data: filtered.slice(0, limit),
        meta: { 
          total: filtered.length,
          limit,
          configured: false,
          message: "Showing demo player rankings. Add CRICKET_API_KEY for live data."
        }
      })
    }

    // Search requires a query
    if (!search || search.length < 2) {
      return NextResponse.json({
        data: demoPlayers.slice(0, limit),
        meta: { 
          total: demoPlayers.length,
          limit,
          configured: true,
          message: "Showing featured players. Search query required for live player lookup."
        }
      })
    }

    const players = await service.searchPlayers(search)

    return NextResponse.json({
      data: players.slice(0, limit),
      meta: { 
        total: players.length, 
        limit,
        configured: true
      }
    })
  } catch (error) {
    console.error("[CricYug] Players API Error:", error)
    
    return NextResponse.json({
      data: demoPlayers.slice(0, limit),
      meta: { 
        total: demoPlayers.length,
        limit,
        configured: false,
        error: error instanceof Error ? error.message : "Failed to fetch players"
      }
    }, { status: 200 })
  }
}
