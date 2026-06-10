// CricYug API - News
// CricketData.org does not provide news data. Keep this endpoint server-owned
// and empty until CricYug editorial/CMS data is connected.

import { NextResponse } from "next/server"
import { getManualNews, getManualNewsCount } from "@/lib/news"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "10")
  const offset = parseInt(searchParams.get("offset") || "0")
  const category = searchParams.get("category") || undefined
  const articles = getManualNews({ category, limit, offset })

  return NextResponse.json({
    data: articles,
    meta: { 
      total: getManualNewsCount(category),
      limit,
      configured: true,
      message: articles.length > 0
        ? undefined
        : "News CMS is ready for manual CricYug stories. No articles have been published yet."
    }
  })
}
