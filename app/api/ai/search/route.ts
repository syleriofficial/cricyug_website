import { NextResponse } from "next/server"
import { createAISearchAnswer } from "@/lib/ai-cricket"
import { getCricketDataService } from "@/lib/api/cricket-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() || ""

  if (!query) {
    return NextResponse.json({
      data: {
        provider: process.env.OPENAI_API_KEY ? "openai" : "cricyug-rules",
        answer: "Search for a team, player, series or match.",
        results: [],
      },
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  }

  try {
    const service = getCricketDataService()
    const results = service ? await service.search(query).catch(() => []) : []

    return NextResponse.json({
      data: await createAISearchAnswer(query, results.slice(0, 8)),
      meta: {
        configured: Boolean(service),
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  } catch (error) {
    console.error("[CricYug] /api/ai/search error:", error)
    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
        error: error instanceof Error ? error.message : "AI search failed",
      },
    }, { status: 502 })
  }
}
