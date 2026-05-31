// CricYug API - News
// Production-ready endpoint - requires separate news API integration
// CricketData.org does not provide news data

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "10")

  // News requires a separate API integration (e.g., NewsAPI, custom RSS feed parser)
  // Return empty data until a news source is configured
  
  return NextResponse.json({
    data: [],
    meta: { 
      total: 0, 
      limit,
      configured: false,
      message: "News API not configured. Integrate a news source (NewsAPI, RSS feeds, etc.)"
    }
  })
}
