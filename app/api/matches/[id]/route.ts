// CricYug API - Match Details
// Production-ready endpoint for single match data

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
          message: "Cricket API not configured. Add CRICKET_API_KEY to environment variables."
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
      data: null,
      meta: { 
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch match details"
      }
    }, { status: 500 })
  }
}
