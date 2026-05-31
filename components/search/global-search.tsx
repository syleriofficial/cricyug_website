"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, X, User, Trophy, Newspaper, Radio, Users } from "lucide-react"
import { useSearch } from "@/hooks/use-cricket-data"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/lib/types"

interface SearchProps {
  className?: string
}

export function GlobalSearch({ className }: SearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results, isLoading } = useSearch(query.length >= 2 ? query : null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery("")
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleClose])

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "match": return <Radio className="h-4 w-4" />
      case "player": return <User className="h-4 w-4" />
      case "team": return <Users className="h-4 w-4" />
      case "series": return <Trophy className="h-4 w-4" />
      case "news": return <Newspaper className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search matches, players, teams..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-20 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-background rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50"
          >
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Searching...
              </div>
            )}

            {!isLoading && results && results.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            )}

            {!isLoading && results && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    onClick={handleClose}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded bg-muted">
                        {result.type}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Links - show when query is short */}
            {query.length < 2 && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Live Matches", href: "/live", icon: Radio },
                    { label: "Players", href: "/players", icon: User },
                    { label: "Teams", href: "/teams", icon: Users },
                    { label: "News", href: "/news", icon: Newspaper },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleClose}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
