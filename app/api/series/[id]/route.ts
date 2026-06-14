import { NextResponse } from "next/server"
import { getDbSeriesById } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const series = await getDbSeriesById(id)

    if (!series) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: isCricYugDbConfigured(),
          source: "cricyug-db",
          message: isCricYugDbConfigured()
            ? "Series not found in CricYug database."
            : "Configure Supabase for historical series pages.",
        },
      }, { status: isCricYugDbConfigured() ? 404 : 503 })
    }

    return NextResponse.json({
      data: series,
      meta: {
        configured: true,
        source: "cricyug-db",
      },
    })
  } catch (error) {
    console.error("[CricYug] Series Details API Error:", error)

    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch series",
      },
    }, { status: 502 })
  }
}
