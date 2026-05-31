// CricYug API - Players
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: [],
        meta: { 
          total: 0, 
          limit,
          configured: false,
          message: "Cricket API not configured. Add CRICKET_API_KEY to environment variables."
        }
      })
    }

    // Search requires a query
    if (!search || search.length < 2) {
      return NextResponse.json({
        data: [],
        meta: { 
          total: 0, 
          limit,
          configured: true,
          message: "Search query required (minimum 2 characters)"
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
      data: [],
      meta: { 
        total: 0, 
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch players"
      }
    }, { status: 500 })
  }
}
