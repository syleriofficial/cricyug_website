import { NextResponse } from "next/server"
import { getCricketDataService } from "@/lib/api/cricket-data"

export const revalidate = 60

export async function GET() {
  try {
    const service = getCricketDataService()

    if (!service) {
      return NextResponse.json({
        data: [],
        meta: {
          total: 0,
          configured: false,
          message: "CRICKETDATA_API_KEY is required for stats data.",
        },
      }, { status: 503 })
    }

    const matches = await service.getMatches()
    const rows = matches.flatMap((match) => [
      { matchId: match.id, match: `${match.team1.team.shortName} vs ${match.team2.team.shortName}`, team: match.team1.team.name, score: match.team1.score, overs: match.team1.overs, runRate: match.team1.runRate },
      { matchId: match.id, match: `${match.team1.team.shortName} vs ${match.team2.team.shortName}`, team: match.team2.team.name, score: match.team2.score, overs: match.team2.overs, runRate: match.team2.runRate },
    ]).filter((row) => row.score)

    return NextResponse.json({
      data: rows,
      meta: {
        total: rows.length,
        configured: true,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    return NextResponse.json({
      data: [],
      meta: {
        total: 0,
        configured: true,
        error: error instanceof Error ? error.message : "Data temporarily unavailable",
      },
    }, { status: 502 })
  }
}
