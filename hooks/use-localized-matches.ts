"use client"

import { useEffect, useMemo, useState } from "react"
import type { Match } from "@/lib/types"

type RegionProfile = {
  code: string
  label: string
  timeZones: string[]
  localeRegions: string[]
  keywords: string[]
}

const regionProfiles: RegionProfile[] = [
  {
    code: "IN",
    label: "India",
    timeZones: ["Asia/Kolkata", "Asia/Calcutta"],
    localeRegions: ["IN"],
    keywords: ["india", "ind", "indw", "ipl", "ranji", "mumbai", "delhi", "bengaluru", "bangalore", "chennai", "kolkata", "hyderabad", "ahmedabad", "pune", "lucknow", "jaipur"],
  },
  {
    code: "US",
    label: "United States",
    timeZones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix"],
    localeRegions: ["US"],
    keywords: ["united states", "usa", "us", "major league cricket", "mlc", "texas", "washington", "seattle", "san francisco", "los angeles", "new york"],
  },
  {
    code: "GB",
    label: "England",
    timeZones: ["Europe/London"],
    localeRegions: ["GB", "UK"],
    keywords: ["england", "eng", "engw", "county", "hundred", "london", "manchester", "birmingham", "leeds", "nottingham", "southampton"],
  },
  {
    code: "AU",
    label: "Australia",
    timeZones: ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth", "Australia/Adelaide"],
    localeRegions: ["AU"],
    keywords: ["australia", "aus", "ausw", "big bash", "bbl", "sydney", "melbourne", "brisbane", "perth", "adelaide", "hobart"],
  },
  {
    code: "PK",
    label: "Pakistan",
    timeZones: ["Asia/Karachi"],
    localeRegions: ["PK"],
    keywords: ["pakistan", "pak", "pakw", "psl", "karachi", "lahore", "islamabad", "rawalpindi", "multan"],
  },
  {
    code: "BD",
    label: "Bangladesh",
    timeZones: ["Asia/Dhaka"],
    localeRegions: ["BD"],
    keywords: ["bangladesh", "ban", "bd", "bpl", "dhaka", "chattogram", "sylhet"],
  },
  {
    code: "LK",
    label: "Sri Lanka",
    timeZones: ["Asia/Colombo"],
    localeRegions: ["LK"],
    keywords: ["sri lanka", "sl", "lanka", "lpl", "colombo", "galle", "kandy", "dambulla"],
  },
  {
    code: "ZA",
    label: "South Africa",
    timeZones: ["Africa/Johannesburg"],
    localeRegions: ["ZA"],
    keywords: ["south africa", "rsa", "sa20", "johannesburg", "cape town", "durban", "centurion", "gqeberha"],
  },
  {
    code: "NZ",
    label: "New Zealand",
    timeZones: ["Pacific/Auckland", "Pacific/Chatham"],
    localeRegions: ["NZ"],
    keywords: ["new zealand", "nz", "nzw", "auckland", "wellington", "christchurch", "hamilton", "dunedin"],
  },
  {
    code: "AE",
    label: "UAE",
    timeZones: ["Asia/Dubai"],
    localeRegions: ["AE"],
    keywords: ["united arab emirates", "uae", "ilt20", "dubai", "sharjah", "abu dhabi"],
  },
]

export function useLocalizedMatches(matches: Match[]) {
  const [region, setRegion] = useState<RegionProfile | null>(null)

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const locale = navigator.language || ""
    const localeRegion = locale.split("-")[1]?.toUpperCase()

    const detected =
      regionProfiles.find((profile) => profile.timeZones.includes(timeZone)) ||
      regionProfiles.find((profile) => localeRegion && profile.localeRegions.includes(localeRegion)) ||
      null

    setRegion(detected)
  }, [])

  const localizedMatches = useMemo(() => {
    if (!region) return matches

    return [...matches].sort((a, b) => {
      const scoreDiff = matchRegionScore(b, region) - matchRegionScore(a, region)
      if (scoreDiff !== 0) return scoreDiff
      return matchTime(a) - matchTime(b)
    })
  }, [matches, region])

  return {
    matches: localizedMatches,
    region,
  }
}

function matchRegionScore(match: Match, region: RegionProfile) {
  const haystack = [
    match.team1.team.name,
    match.team1.team.shortName,
    match.team2.team.name,
    match.team2.team.shortName,
    match.series.name,
    match.venue.name,
    match.venue.city,
    match.venue.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return region.keywords.reduce((score, keyword) => {
    if (!haystack.includes(keyword)) return score
    return score + (keyword.length <= 3 ? 2 : 4)
  }, 0)
}

function matchTime(match: Match) {
  const parsed = match.startTime ? Date.parse(match.startTime) : Number.NaN
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}
