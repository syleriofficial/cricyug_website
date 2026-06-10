// CricYug API - Match Details
// Production-ready endpoint for single match data

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const includeScorecard = searchParams.get("includeScorecard") === "true"
  const includeCommentary = searchParams.get("includeCommentary") === "true"

  try {
    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: null,
        meta: { 
          configured: false,
          message: "CRICKETDATA_API_KEY is required for live match details."
        }
      }, { status: 503 })
    }

    const match = await service.getMatchInfo(id, { includeScorecard, includeCommentary })
    
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
        error: error instanceof Error ? error.message : "Failed to fetch match details",
      }
    }, { status: 502 })
  }
}
