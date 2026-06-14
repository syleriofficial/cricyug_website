// CricYug API - Search
// Production-ready unified search endpoint

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { searchCricYugDb } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const limit = parseInt(searchParams.get("limit") || "10")

  if (!query || query.length < 2) {
    return NextResponse.json({
      data: [],
      meta: { total: 0, limit }
    })
  }

  try {
    const dbResults = await searchCricYugDb(query, limit)
    if (dbResults.length > 0 || isCricYugDbConfigured()) {
      return NextResponse.json({
        data: dbResults,
        meta: {
          total: dbResults.length,
          limit,
          configured: true,
          source: "cricyug-db",
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
          message: "Configure Supabase for CricYug knowledge search. Live API search is optional."
        }
      }, { status: 503 })
    }

    const results = await service.search(query)

    return NextResponse.json({
      data: results.slice(0, limit),
      meta: { 
        total: results.length,
        limit,
        configured: true,
        source: "live-provider"
      }
    })
  } catch (error) {
    console.error("[CricYug] Search API Error:", error)

    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Search failed"
      }
    }, { status: 502 })
  }
}
