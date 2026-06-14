import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"
import { getRegionByCode, sortMatchesForRegion } from "@/lib/match-location"
import { getDbMatches } from "@/lib/db/cricyug-db"
import { isCricYugDbConfigured } from "@/lib/db/supabase"

export const revalidate = 30

const MATCH_CACHE_TTL_MS = 30_000
const MATCH_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  "CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  "Netlify-CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
  "Netlify-Vary": "query=status|format|country|limit",
}

type MatchApiPayload = {
  data: unknown[]
  meta: Record<string, unknown>
}

type MatchCacheEntry = {
  expiresAt: number
  payload: MatchApiPayload
}

const globalMatchCache = globalThis as typeof globalThis & {
  __cricyugMatchCache?: Map<string, MatchCacheEntry>
}

function matchCache() {
  globalMatchCache.__cricyugMatchCache ??= new Map()
  return globalMatchCache.__cricyugMatchCache
}

function cacheKey(params: URLSearchParams) {
  return ["status", "format", "country", "limit"]
    .map((key) => `${key}:${params.get(key) || ""}`)
    .join("|")
}

function jsonResponse(payload: MatchApiPayload, status = 200, cacheStatus = "MISS") {
  const headers = status < 400
    ? MATCH_CACHE_HEADERS
    : { "Cache-Control": "no-store" }

  return NextResponse.json(payload, {
    status,
    headers: {
      ...headers,
      "X-CricYug-Cache": cacheStatus,
    },
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const format = searchParams.get("format")
  const country = searchParams.get("country")
  const limit = Number(searchParams.get("limit") || "20")
  const key = cacheKey(searchParams)
  const cached = matchCache().get(key)

  if (cached && cached.expiresAt > Date.now()) {
    return jsonResponse(cached.payload, 200, "HIT")
  }

  try {
    const dbMatches = await getDbMatches({ status: status || undefined, format: format || undefined, limit })
    if (dbMatches.length > 0 || isCricYugDbConfigured()) {
      const region = getRegionByCode(country)
      const sorted = sortMatchesForRegion(dbMatches, region)
      const payload = {
        data: sorted.slice(0, limit),
        meta: {
          total: dbMatches.length,
          limit,
          configured: true,
          source: "cricyug-db",
          country: region?.code,
          message: dbMatches.length === 0 ? "No CricYug database matches match this filter. Live API can be used for current matches when configured." : undefined,
        },
      }

      matchCache().set(key, { expiresAt: Date.now() + MATCH_CACHE_TTL_MS, payload })
      return jsonResponse(payload)
    }

    const service = getCricketDataService()

    if (!service) {
      return jsonResponse({
        data: [],
        meta: {
          total: 0,
          limit,
          configured: false,
          message: "Configure Supabase for historical matches. CricketData.org is optional live fallback.",
        },
      }, 503)
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

    if (filtered.length === 0 && format) {
      message = requestedStatus
        ? `${format.toUpperCase()} ${requestedStatus} matches are not available right now.`
        : `${format.toUpperCase()} matches are not available right now.`
    } else if (filtered.length === 0 && requestedStatus) {
      filtered = allMatchesForFallback
      message = `${requestedStatus} matches are not available right now, so latest available matches are shown.`
    }

    const region = getRegionByCode(country)
    const sorted = sortMatchesForRegion(filtered, region)

    const payload = {
      data: sorted.slice(0, limit),
      meta: {
        total: filtered.length,
        limit,
        configured: true,
        source: "live-provider",
        message,
        country: region?.code,
      },
    }

    matchCache().set(key, {
      expiresAt: Date.now() + MATCH_CACHE_TTL_MS,
      payload,
    })

    return jsonResponse(payload)
  } catch (error) {
    console.error("[CricYug] /api/matches error:", error)

    return jsonResponse({
      data: [],
      meta: {
        total: 0,
        limit,
        configured: true,
        error: error instanceof Error ? error.message : "Unknown API error",
      },
    }, 502)
  }
}
