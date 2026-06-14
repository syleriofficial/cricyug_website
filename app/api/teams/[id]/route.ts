import { NextResponse } from "next/server"
import { getDbTeam } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const team = await getDbTeam(id)

    if (!team) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: isCricYugDbConfigured(),
          source: "cricyug-db",
          message: isCricYugDbConfigured()
            ? "Team not found in CricYug database."
            : "Configure Supabase for historical team profiles.",
        },
      }, { status: isCricYugDbConfigured() ? 404 : 503 })
    }

    return NextResponse.json({
      data: team,
      meta: {
        configured: true,
        source: "cricyug-db",
      },
    })
  } catch (error) {
    console.error("[CricYug] Team Details API Error:", error)

    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch team profile",
      },
    }, { status: 502 })
  }
}
