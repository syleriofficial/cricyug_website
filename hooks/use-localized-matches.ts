"use client"

import { useEffect, useMemo, useState } from "react"
import { regionProfiles, sortMatchesForRegion, type RegionProfile } from "@/lib/match-location"
import type { Match } from "@/lib/types"

const STORAGE_KEY = "cricyug-region"

export function useDetectedRegion() {
  const [region, setRegion] = useState<RegionProfile | null>(null)

  useEffect(() => {
    function detect() {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      const savedRegion = regionProfiles.find((profile) => profile.code === saved)
      if (savedRegion) {
        setRegion(savedRegion)
        return
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const locale = navigator.language || ""
      const localeRegion = locale.split("-")[1]?.toUpperCase()

      const detected =
        regionProfiles.find((profile) => profile.timeZones.includes(timeZone)) ||
        regionProfiles.find((profile) => localeRegion && profile.localeRegions.includes(localeRegion)) ||
        null

      setRegion(detected)
    }

    detect()
    window.addEventListener("cricyug-region-change", detect)
    return () => window.removeEventListener("cricyug-region-change", detect)
  }, [])

  return region
}

export function useRegionPreference() {
  const region = useDetectedRegion()
  const [selectedCode, setSelectedCode] = useState<string>("")

  useEffect(() => {
    setSelectedCode(region?.code || "")
  }, [region?.code])

  function setRegionCode(code: string) {
    if (code) {
      window.localStorage.setItem(STORAGE_KEY, code)
      setSelectedCode(code)
      window.dispatchEvent(new Event("cricyug-region-change"))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
      setSelectedCode("")
      window.dispatchEvent(new Event("cricyug-region-change"))
    }
  }

  useEffect(() => {
    const handler = () => {
      setSelectedCode(window.localStorage.getItem(STORAGE_KEY) || "")
    }
    window.addEventListener("cricyug-region-change", handler)
    return () => window.removeEventListener("cricyug-region-change", handler)
  }, [])

  return { region, selectedCode, setRegionCode, options: regionProfiles }
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
