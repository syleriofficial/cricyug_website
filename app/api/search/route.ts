// CricYug API - Search
// Production-ready unified search endpoint

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

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
    const service = getCricketDataService()
    
    if (!service) {
      return NextResponse.json({
        data: [],
        meta: { 
          total: 0,
          limit,
          configured: false,
          message: "CRICKETDATA_API_KEY is required for live search."
        }
      }, { status: 503 })
    }

    const results = await service.search(query)

    return NextResponse.json({
      data: results.slice(0, limit),
      meta: { 
        total: results.length,
        limit,
        configured: true
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
