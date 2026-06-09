import type { Match, NewsArticle, Player, PointsTableEntry, SearchResult, Series, Team } from "@/lib/types"

export const demoTeams: Team[] = [
  { id: "ind", name: "India", shortName: "IND", countryCode: "IN", ranking: 1 },
  { id: "aus", name: "Australia", shortName: "AUS", countryCode: "AU", ranking: 2 },
  { id: "eng", name: "England", shortName: "ENG", countryCode: "GB", ranking: 3 },
  { id: "sa", name: "South Africa", shortName: "SA", countryCode: "ZA", ranking: 4 },
  { id: "nz", name: "New Zealand", shortName: "NZ", countryCode: "NZ", ranking: 5 },
  { id: "pak", name: "Pakistan", shortName: "PAK", countryCode: "PK", ranking: 6 },
]

export const demoSeries: Series[] = [
  {
    id: "champions-trophy-2026",
    name: "CricYug Champions Trophy",
    shortName: "CY Trophy",
    type: "tournament",
    format: "ODI",
    status: "ongoing",
    startDate: "2026-06-01",
    endDate: "2026-06-18",
    totalMatches: 15,
    teams: demoTeams.slice(0, 4),
  },
  {
    id: "global-t20-league",
    name: "Global T20 League",
    shortName: "GTL",
    type: "league",
    format: "T20",
    status: "ongoing",
    startDate: "2026-06-04",
    endDate: "2026-06-28",
    totalMatches: 30,
    teams: demoTeams,
  },
]

export const demoMatches: Match[] = [
  {
    id: "ind-aus-live",
    status: "live",
    format: "T20",
    series: demoSeries[1],
    venue: { id: "wankhede", name: "Wankhede Stadium", city: "Mumbai", country: "India" },
    team1: { team: demoTeams[0], score: "186/4", overs: "17.2", wickets: 4, runRate: 10.73 },
    team2: { team: demoTeams[1], score: "182/7", overs: "20.0", wickets: 7, runRate: 9.1 },
    result: "India need 7 runs from 16 balls",
    startTime: "Live now",
  },
  {
    id: "eng-sa-upcoming",
    status: "upcoming",
    format: "ODI",
    series: demoSeries[0],
    venue: { id: "lords", name: "Lord's", city: "London", country: "England" },
    team1: { team: demoTeams[2] },
    team2: { team: demoTeams[3] },
    startTime: "Today, 7:30 PM",
  },
  {
    id: "nz-pak-completed",
    status: "completed",
    format: "T20",
    series: demoSeries[1],
    venue: { id: "eden-park", name: "Eden Park", city: "Auckland", country: "New Zealand" },
    team1: { team: demoTeams[4], score: "164/6", overs: "20.0", wickets: 6 },
    team2: { team: demoTeams[5], score: "161/9", overs: "20.0", wickets: 9 },
    result: "New Zealand won by 3 runs",
    startTime: "Completed",
  },
  {
    id: "aus-sa-upcoming",
    status: "upcoming",
    format: "Test",
    series: demoSeries[0],
    venue: { id: "mcg", name: "MCG", city: "Melbourne", country: "Australia" },
    team1: { team: demoTeams[1] },
    team2: { team: demoTeams[3] },
    startTime: "Tomorrow, 5:00 AM",
  },
]

export const demoPlayers: Player[] = [
  { id: "virat-kohli", name: "Virat Kohli", shortName: "Kohli", country: "India", countryCode: "IN", role: "Batsman", battingStyle: "Right hand bat" },
  { id: "pat-cummins", name: "Pat Cummins", shortName: "Cummins", country: "Australia", countryCode: "AU", role: "Bowler", bowlingStyle: "Right arm fast" },
  { id: "ben-stokes", name: "Ben Stokes", shortName: "Stokes", country: "England", countryCode: "GB", role: "All-rounder", battingStyle: "Left hand bat" },
  { id: "quinton-de-kock", name: "Quinton de Kock", shortName: "Q de Kock", country: "South Africa", countryCode: "ZA", role: "Wicket-keeper", battingStyle: "Left hand bat" },
]

export const demoNews: NewsArticle[] = [
  {
    id: "powerplay-template",
    title: "Powerplay aggression is reshaping modern T20 chases",
    excerpt: "Teams are taking bigger risks in the first six overs, and CricYug breaks down how that changes match momentum.",
    category: "Analysis",
    author: "CricYug Desk",
    publishedAt: "2026-06-09T09:00:00.000Z",
    source: "CricYug",
    tags: ["T20", "Analysis"],
  },
  {
    id: "rankings-watch",
    title: "Ranking watch: all-rounders continue to decide close games",
    excerpt: "A look at the players adding value with both bat and ball across formats.",
    category: "Rankings",
    author: "CricYug Desk",
    publishedAt: "2026-06-08T14:30:00.000Z",
    source: "CricYug",
    tags: ["Rankings"],
  },
  {
    id: "venue-report",
    title: "Mumbai surface expected to favour stroke makers tonight",
    excerpt: "Early reports suggest good bounce, short square boundaries, and a fast outfield.",
    category: "Match Preview",
    author: "CricYug Desk",
    publishedAt: "2026-06-08T11:00:00.000Z",
    source: "CricYug",
    tags: ["Preview"],
  },
]

export const demoPointsTable: PointsTableEntry[] = demoTeams.slice(0, 4).map((team, index) => ({
  position: index + 1,
  team,
  played: 5,
  won: 4 - Math.min(index, 2),
  lost: Math.min(index + 1, 3),
  tied: 0,
  noResult: index === 3 ? 1 : 0,
  netRunRate: [1.42, 0.83, -0.12, -0.61][index],
  points: [8, 6, 4, 3][index],
  recentForm: index === 0 ? ["W", "W", "W", "L", "W"] : ["W", "L", "W", "L", "W"],
}))

export function getDemoSearchResults(query: string): SearchResult[] {
  const q = query.toLowerCase()
  const matchResults = demoMatches
    .filter((match) => `${match.series.name} ${match.team1.team.name} ${match.team2.team.name}`.toLowerCase().includes(q))
    .map<SearchResult>((match) => ({
      type: "match",
      id: match.id,
      title: `${match.team1.team.shortName} vs ${match.team2.team.shortName}`,
      subtitle: `${match.series.name} - ${match.status}`,
      url: `/matches/${match.id}`,
    }))

  const playerResults = demoPlayers
    .filter((player) => `${player.name} ${player.country} ${player.role}`.toLowerCase().includes(q))
    .map<SearchResult>((player) => ({
      type: "player",
      id: player.id,
      title: player.name,
      subtitle: `${player.country} - ${player.role}`,
      url: `/players`,
    }))

  const teamResults = demoTeams
    .filter((team) => `${team.name} ${team.shortName}`.toLowerCase().includes(q))
    .map<SearchResult>((team) => ({
      type: "team",
      id: team.id,
      title: team.name,
      subtitle: `ICC rank #${team.ranking || "-"}`,
      url: `/teams`,
    }))

  const newsResults = demoNews
    .filter((article) => `${article.title} ${article.category}`.toLowerCase().includes(q))
    .map<SearchResult>((article) => ({
      type: "news",
      id: article.id,
      title: article.title,
      subtitle: article.category,
      url: `/news`,
    }))

  return [...matchResults, ...playerResults, ...teamResults, ...newsResults]
}
