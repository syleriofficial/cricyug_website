import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export const revalidate = 3600

export async function GET() {
  const service = getCricketDataService()

  if (!service) {
    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        configured: false,
        message: "CRICKETDATA_API_KEY is required for rankings data.",
      },
    }, { status: 503 })
  }

  return NextResponse.json({
    data: [],
    meta: {
      total: 0,
      configured: true,
      message: "Official rankings are not available from the connected cricket API right now.",
    },
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
