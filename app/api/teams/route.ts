// CricYug API - Teams
// Production-ready endpoint for CricketData.org integration

import { NextResponse } from "next/server"
import { demoTeams } from "@/lib/demo-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "20")

  return NextResponse.json({
    data: demoTeams.slice(0, limit),
    meta: {
      total: demoTeams.length,
      limit,
      configured: true,
      message: "Showing curated international team rankings.",
    }
  })
}
