// CricYug API - Match Details
// Production-ready endpoint for single match data

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { demoMatches } from "@/lib/demo-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const service = getCricketDataService()
    
    if (!service) {
      const match = demoMatches.find((item) => item.id === id) || demoMatches[0] || null

      return NextResponse.json({
        data: match,
        meta: { 
          configured: false,
          message: "Showing demo match details. Add CRICKET_API_KEY for live data."
        }
      })
    }

    const match = await service.getMatchInfo(id)
    
    if (!match) {
      return NextResponse.json({
        data: null,
        meta: { 
          configured: true,
          message: "Match not found"
        }
      }, { status: 404 })
    }

    return NextResponse.json({
      data: match,
      meta: { configured: true }
    })
  } catch (error) {
    console.error("[CricYug] Match Details API Error:", error)
    
    return NextResponse.json({
      data: demoMatches.find((item) => item.id === id) || demoMatches[0] || null,
      meta: { 
        configured: false,
        error: error instanceof Error ? error.message : "Failed to fetch match details",
        message: "Live API failed, so CricYug is showing demo match data."
      }
    }, { status: 200 })
  }
}
