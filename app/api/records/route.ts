import { NextResponse } from "next/server"
import { getDbRecords } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export const revalidate = 3600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || undefined
  const format = searchParams.get("format") || undefined
  const limit = Number(searchParams.get("limit") || "50")
  const records = await getDbRecords({ type, format, limit })

  if (records.length === 0 && !isCricYugDbConfigured()) {
    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        configured: false,
        message: "Configure Supabase for CricYug historical records.",
      },
    }, { status: 503 })
  }

  return NextResponse.json({
    data: records,
    meta: {
      total: records.length,
      configured: true,
      source: "cricyug-db",
      message: records.length === 0 ? "No CricYug records match this filter." : undefined,
    },
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
