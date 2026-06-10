"use client"

import { useEffect, useMemo, useState } from "react"
import { regionProfiles, sortMatchesForRegion, type RegionProfile } from "@/lib/match-location"
import type { Match } from "@/lib/types"

export function useDetectedRegion() {
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

  return region
}

export function useLocalizedMatches(matches: Match[]) {
  const region = useDetectedRegion()

  const localizedMatches = useMemo(() => {
    return sortMatchesForRegion(matches, region)
  }, [matches, region])

  return {
    matches: localizedMatches,
    region,
  }
}
