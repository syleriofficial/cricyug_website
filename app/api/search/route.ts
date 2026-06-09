// CricYug API - Search
// Production-ready unified search endpoint

import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getDemoSearchResults } from "@/lib/demo-data"

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
      const results = getDemoSearchResults(query)
      return NextResponse.json({
        data: results.slice(0, limit),
        meta: { 
          total: results.length,
          limit,
          configured: false,
          message: "Showing demo search results. Add CRICKET_API_KEY for live data."
        }
      })
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
    const results = getDemoSearchResults(query)

    return NextResponse.json({
      data: results.slice(0, limit),
      meta: {
        total: results.length,
        limit,
        configured: false,
        error: error instanceof Error ? error.message : "Search failed"
      }
    }, { status: 200 })
  }
}
