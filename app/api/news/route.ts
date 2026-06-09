// CricYug API - News
// Production-ready endpoint - requires separate news API integration
// CricketData.org does not provide news data

import { NextResponse } from "next/server"
import { demoNews } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "10")

  return NextResponse.json({
    data: demoNews.slice(0, limit),
    meta: { 
      total: demoNews.length,
      limit,
      configured: false,
      message: "Showing editorial demo stories. Integrate a news API or RSS feed for live news."
    }
  })
}
