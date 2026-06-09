// CricYug API - Teams
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoTeams } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: demoTeams.slice(0, limit),
        meta: { 
          total: demoTeams.length,
          limit,
          configured: false,
          message: "Showing demo team rankings. Add CRICKET_API_KEY for live data."
        }
      })
    }

    const teams = await service.getCountries()

    return NextResponse.json({
      data: teams.slice(0, limit),
      meta: { 
        total: teams.length, 
        limit,
        configured: true
      }
    })
  } catch (error) {
    console.error("[CricYug] Teams API Error:", error)
    
    return NextResponse.json({
      data: demoTeams.slice(0, limit),
      meta: { 
        total: demoTeams.length,
        limit,
        configured: false,
        error: error instanceof Error ? error.message : "Failed to fetch teams"
      }
    }, { status: 200 })
  }
}
