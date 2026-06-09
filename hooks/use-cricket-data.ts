// SWR Hooks for CricYug - Production Ready
// All hooks include isConfigured status to show appropriate UI states

import useSWR from "swr"
import useSWRInfinite from "swr/infinite"
import type { Match, Player, Team, Series, NewsArticle, SearchResult, PointsTableEntry } from "@/lib/types"

// ============= Fetcher =============

interface ApiResponse<T> {
  data: T
  meta: {
    total: number
    limit: number
    configured: boolean
    message?: string
    error?: string
  }
}

async function fetcher<T>(url: string): Promise<{ data: T; isConfigured: boolean; error?: string }> {
  const response = await fetch(url)
  const json: ApiResponse<T> = await response.json()
  
  return {
    data: json.data,
    isConfigured: json.meta?.configured ?? true,
    error: json.meta?.error,
  }
}

// ============= Matches Hooks =============

export function useMatches(params?: { status?: string; format?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.format) searchParams.set("format", params.format)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matches?${searchParams.toString()}`,
    (url) => fetcher<Match[]>(url),
    { refreshInterval: 30000 }
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function useLiveMatches() {
  return useMatches({ status: "live" })
}

export function useUpcomingMatches(limit = 10) {
  return useMatches({ status: "upcoming", limit })
}

export function useRecentMatches(limit = 10) {
  return useMatches({ status: "completed", limit })
}

export function useMatch(matchId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    matchId ? `/api/matches/${matchId}` : null,
    (url) => fetcher<Match | null>(url),
    { refreshInterval: 15000 }
  )

  return {
    data: data?.data || null,
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Players Hooks =============

export function usePlayers(params?: { search?: string; country?: string; role?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set("search", params.search)
  if (params?.country) searchParams.set("country", params.country)
  if (params?.role) searchParams.set("role", params.role)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  
  const { data, error, mutate, isLoading } = useSWR(
    `/api/players?${searchParams.toString()}`,
    (url) => fetcher<Player[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function usePlayer(playerId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    playerId ? `/api/players/${playerId}` : null,
    (url) => fetcher<Player | null>(url)
  )

  return {
    data: data?.data || null,
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Teams Hooks =============

export function useTeams(params?: { limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set("limit", String(params.limit))
  
  const { data, error, mutate, isLoading } = useSWR(
    `/api/teams?${searchParams.toString()}`,
    (url) => fetcher<Team[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function useTeam(teamId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    teamId ? `/api/teams/${teamId}` : null,
    (url) => fetcher<Team | null>(url)
  )

  return {
    data: data?.data || null,
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Series Hooks =============

export function useSeries(params?: { status?: string; type?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.type) searchParams.set("type", params.type)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  
  const { data, error, mutate, isLoading } = useSWR(
    `/api/series?${searchParams.toString()}`,
    (url) => fetcher<Series[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function useSeriesById(seriesId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    seriesId ? `/api/series/${seriesId}` : null,
    (url) => fetcher<Series | null>(url)
  )

  return {
    data: data?.data || null,
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function useFeaturedSeries() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/series?featured=true`,
    (url) => fetcher<Series[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Points Table Hooks =============

export function usePointsTable(seriesId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    seriesId ? `/api/series/${seriesId}/standings` : null,
    (url) => fetcher<PointsTableEntry[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= News Hooks =============

export function useNews(params?: { category?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.set("category", params.category)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  
  const { data, error, mutate, isLoading } = useSWR(
    `/api/news?${searchParams.toString()}`,
    (url) => fetcher<NewsArticle[]>(url)
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

export function useNewsArticle(articleId: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    articleId ? `/api/news/${articleId}` : null,
    (url) => fetcher<NewsArticle | null>(url)
  )

  return {
    data: data?.data || null,
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Search Hooks =============

export function useSearch(query: string | null) {
  const { data, error, mutate, isLoading } = useSWR(
    query && query.length >= 2 ? `/api/search?query=${encodeURIComponent(query)}` : null,
    (url) => fetcher<SearchResult[]>(url),
    { dedupingInterval: 300 }
  )

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
    isConfigured: data?.isConfigured ?? true,
  }
}

// ============= Infinite Loading Hooks =============

export function useInfiniteNews(params?: { category?: string; limit?: number }) {
  const limit = params?.limit || 10
  
  const { data, error, mutate, isLoading, size, setSize } = useSWRInfinite(
    (pageIndex) => {
      const searchParams = new URLSearchParams()
      if (params?.category) searchParams.set("category", params.category)
      searchParams.set("limit", String(limit))
      searchParams.set("offset", String(pageIndex * limit))
      return `/api/news?${searchParams.toString()}`
    },
    (url) => fetcher<NewsArticle[]>(url)
  )

  const news = data?.flatMap(d => d.data) || []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  
  return {
    data: news,
    isLoading,
    isLoadingMore,
    error,
    mutate,
    size,
    setSize,
    isConfigured: data?.[0]?.isConfigured ?? true,
  }
}

export function useInfinitePlayers(params?: { search?: string; country?: string; role?: string; limit?: number }) {
  const limit = params?.limit || 20
  
  const { data, error, mutate, isLoading, size, setSize } = useSWRInfinite(
    (pageIndex) => {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.set("search", params.search)
      if (params?.country) searchParams.set("country", params.country)
      if (params?.role) searchParams.set("role", params.role)
      searchParams.set("limit", String(limit))
      searchParams.set("offset", String(pageIndex * limit))
      return `/api/players?${searchParams.toString()}`
    },
    (url) => fetcher<Player[]>(url)
  )

  const players = data?.flatMap(d => d.data) || []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  
  return {
    data: players,
    isLoading,
    isLoadingMore,
    error,
    mutate,
    size,
    setSize,
    isConfigured: data?.[0]?.isConfigured ?? true,
  }
}
