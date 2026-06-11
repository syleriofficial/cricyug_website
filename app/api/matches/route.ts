import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getRegionByCode, sortMatchesForRegion } from "@/lib/match-location"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const format = searchParams.get("format")
  const country = searchParams.get("country")
  const limit = Number(searchParams.get("limit") || "20")

  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          limit,
          configured: false,
          message: "CRICKETDATA_API_KEY is required for live match data.",
        },
      }, { status: 503 })
    }

    const requestedStatus =
      status === "live" || status === "upcoming" || status === "completed"
        ? status
        : undefined
    const matches = await service.getMatches(requestedStatus)
    const allMatchesForFallback = requestedStatus ? await service.getMatches() : matches

    let filtered = matches.filter((match) => {
      const statusMatches = status ? match.status === status : true
      const formatMatches = format ? match.format.toLowerCase() === format.toLowerCase() : true
      return statusMatches && formatMatches
    })
    let message: string | undefined

    if (filtered.length === 0 && requestedStatus && format) {
      const sameStatusFallback = allMatchesForFallback.filter(
        (match) => match.status === requestedStatus
      )
      const sameFormatFallback = allMatchesForFallback.filter(
        (match) => match.format.toLowerCase() === format.toLowerCase()
      )

      if (sameStatusFallback.length > 0) {
        filtered = sameStatusFallback
        message = `${format.toUpperCase()} ${requestedStatus} matches are not available right now, so ${requestedStatus} matches from other formats are shown.`
      } else if (sameFormatFallback.length > 0) {
        filtered = sameFormatFallback
        message = `${format.toUpperCase()} ${requestedStatus} matches are not available right now, so ${format.toUpperCase()} matches across all statuses are shown.`
      }
    }

    if (filtered.length === 0 && format) {
      const sameFormatFallback = allMatchesForFallback.filter(
        (match) => match.format.toLowerCase() === format.toLowerCase()
      )

      if (sameFormatFallback.length > 0) {
        filtered = sameFormatFallback
        message = `${format.toUpperCase()} matches are shown across all statuses because none are available in the selected status.`
      } else {
        filtered = allMatchesForFallback
        message = `${format.toUpperCase()} matches are not available right now, so latest official matches are shown.`
      }
    }

    if (filtered.length === 0 && requestedStatus) {
      filtered = allMatchesForFallback
      message = `${requestedStatus} matches are not available right now, so latest available matches are shown.`
    }

    const region = getRegionByCode(country)
    const sorted = sortMatchesForRegion(filtered, region)

    return NextResponse.json({
      data: sorted.slice(0, limit),
      meta: {
        total: filtered.length,
        limit,
        configured: true,
        message,
        country: region?.code,
      },
    })
  } catch (error) {
    console.error("[CricYug] /api/matches error:", error)

    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Unknown API error",
      },
    }, { status: 502 })
  }
}
