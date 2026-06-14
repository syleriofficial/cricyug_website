// CricYug API - Match Details
// Production-ready endpoint for single match data

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getDbMatch } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const includeScorecard = searchParams.get("includeScorecard") === "true"
  const includeCommentary = searchParams.get("includeCommentary") === "true"

  try {
    const dbMatch = await getDbMatch(id)
    if (dbMatch || isCricYugDbConfigured()) {
      if (!dbMatch) {
        return NextResponse.json({
          data: null,
          meta: {
            configured: true,
            source: "cricyug-db",
            message: "Match not found in CricYug database",
          },
        }, { status: 404 })
      }

      return NextResponse.json({
        data: dbMatch,
        meta: { configured: true, source: "cricyug-db" },
      })
    }

    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: null,
        meta: { 
          configured: false,
          message: "Configure Supabase for historical match scorecards. CricketData.org is optional live fallback."
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
      meta: { configured: true, source: "live-provider" }
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
