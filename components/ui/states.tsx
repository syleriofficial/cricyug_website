// Reusable UI State Components - Loading, Error, Empty States

"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, Inbox, Search, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ============= Loading States =============

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn("h-6 w-6 border-2 border-primary border-t-transparent rounded-full", className)}
    />
  )
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
      <LoadingSpinner className="h-8 w-8" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-card border border-border p-4", className)}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mt-3" />
      </div>
    </div>
  )
}

export function LoadingMatchCard() {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="pt-3 border-t border-border">
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function LoadingNewsCard() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function LoadingPlayerCard() {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1 max-w-[200px]" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============= Error States =============

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn&apos;t load this content. Please try again.",
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center gap-4", className)}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center gap-4", className)}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">No Connection</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Please check your internet connection and try again.
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <Wifi className="h-4 w-4" />
          Reconnect
        </Button>
      )}
    </motion.div>
  )
}

// ============= Empty States =============

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center gap-4", className)}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {icon || <Inbox className="h-7 w-7 text-muted-foreground" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        {message && <p className="text-sm text-muted-foreground max-w-md">{message}</p>}
      </div>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

export function NoMatches({ className, message }: { className?: string; message?: string }) {
  return (
    <EmptyState
      title="No Matches"
      message={message || "There are no matches scheduled at the moment. Check back later for updates."}
      className={className}
    />
  )
}

export function NoResults({ query, className }: { query?: string; className?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-7 w-7 text-muted-foreground" />}
      title="No Results Found"
      message={query ? `We couldn't find anything matching "${query}". Try different keywords.` : "Try adjusting your search or filters."}
      className={className}
    />
  )
}

export function NoNews({ className }: { className?: string }) {
  return (
    <EmptyState
      title="No News"
      message="There are no news articles available at the moment."
      className={className}
    />
  )
}

export function NoPlayers({ className, message }: { className?: string; message?: string }) {
  return (
    <EmptyState
      title="No Players"
      message={message || "No players found matching your criteria."}
      className={className}
    />
  )
}

// ============= Live Indicator =============

export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-live/20 text-live text-xs font-semibold", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-live-pulse" />
      LIVE
    </span>
  )
}

// ============= Connection Status =============

export function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  if (isConnected) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm"
    >
      <span className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        You&apos;re offline. Some features may not work.
      </span>
    </motion.div>
  )
}
