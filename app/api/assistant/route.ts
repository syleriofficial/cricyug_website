import { NextResponse } from "next/server"
import { createAISearchAnswer } from "@/lib/ai-cricket"
import { searchCricYugDb } from "@/lib/db/cricyug-db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() || ""

  if (!query) {
    return NextResponse.json({
      data: {
        provider: process.env.OPENAI_API_KEY ? "openai" : "cricyug-rules",
        answer: "Ask about a player, team, series, record, or match in the CricYug database.",
        results: [],
      },
      meta: {
        configured: true,
        source: "cricyug-db",
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  }

  try {
    const results = await searchCricYugDb(query, 8)
    const answer = await createAISearchAnswer(query, results)

    return NextResponse.json({
      data: answer,
      meta: {
        configured: true,
        source: "cricyug-db",
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  } catch (error) {
    console.error("[CricYug] Assistant API Error:", error)

    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        error: error instanceof Error ? error.message : "Assistant failed",
      },
    }, { status: 502 })
  }
}
