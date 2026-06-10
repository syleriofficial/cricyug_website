import { NextResponse } from "next/server"
import { createNewsDraft } from "@/lib/ai-cricket"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const headline = typeof body.headline === "string" ? body.headline : ""
    const notes = typeof body.notes === "string" ? body.notes : ""
    const category = typeof body.category === "string" ? body.category : "Analysis"

    if (!headline.trim() && !notes.trim()) {
      return NextResponse.json({
        data: null,
        meta: {
          configured: true,
          aiConfigured: Boolean(process.env.OPENAI_API_KEY),
          error: "Add a headline or notes to draft a CricYug article.",
        },
      }, { status: 400 })
    }

    return NextResponse.json({
      data: await createNewsDraft({ headline, notes, category }),
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      },
    })
  } catch (error) {
    console.error("[CricYug] /api/ai/news-draft error:", error)
    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        aiConfigured: Boolean(process.env.OPENAI_API_KEY),
        error: error instanceof Error ? error.message : "Failed to draft news",
      },
    }, { status: 502 })
  }
}
