// CricYug API - News
// CricketData.org does not provide news data. Keep this endpoint server-owned
// and empty until CricYug editorial/CMS data is connected.

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "10")

  return NextResponse.json({
    data: [],
    meta: { 
      total: 0,
      limit,
      configured: true,
      message: "News CMS is ready for manual CricYug stories. No articles have been published yet."
    }
  })
}
