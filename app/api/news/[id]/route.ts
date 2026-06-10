import { NextResponse } from "next/server"
import { getManualNewsArticle } from "@/lib/news"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = getManualNewsArticle(id)

  if (!article) {
    return NextResponse.json({
      data: null,
      meta: {
        configured: true,
        message: "Article not found.",
      },
    }, { status: 404 })
  }

  return NextResponse.json({
    data: article,
    meta: {
      configured: true,
    },
  })
}
