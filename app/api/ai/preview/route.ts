import { NextResponse } from "next/server"
import { createMatchPreview } from "@/lib/ai-cricket"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get("matchId")

  try {
    const service = getCricketDataService()
    if (!service) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: false,
          aiConfigured: Boolean(process.env.OPENAI_API_KEY),
          message: "CRICKETDATA_API_KEY is required for AI previews.",
        },
      }, { status: 503 })
    }

    const match = matchId
      ? await service.getMatchInfo(matchId)
      : (await service.getMatches("upcoming"))[0] || (await service.getMatches()).find((item) => item.status === "live") || (await service.getMatches())[0]

    if (!match) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: true,
          aiConfigured: Boolean(process.env.OPENAI_API_KEY),
          message: "No match data is available for preview right now.",
        },
      })
    }

    return NextResponse.json({
      data: await createMatchPreview(match),
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  } catch (error) {
    console.error("[CricYug] /api/ai/preview error:", error)
    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
        error: error instanceof Error ? error.message : "Failed to generate preview",
      },
    }, { status: 502 })
  }
}
