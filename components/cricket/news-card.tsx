"use client"

import { motion } from "framer-motion"
import { Clock, TrendingUp, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewsArticle } from "@/lib/types"

interface NewsCardProps {
  article: NewsArticle
  variant?: "default" | "featured" | "compact"
  className?: string
}

export function NewsCard({ article, variant = "default", className }: NewsCardProps) {
  // Format the time display
  const timeDisplay = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString() 
    : "Recently"

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card border border-border group cursor-pointer",
          className
        )}
      >
        <div className="aspect-[16/9] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
          {article.image ? (
            <img 
              src={article.image} 
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
              <span className="text-6xl">🏏</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
              {article.category}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeDisplay}
          </div>
        </div>
      </motion.article>
    )
  }

  if (variant === "compact") {
    return (
      <motion.article
        whileHover={{ x: 4 }}
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
          className
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
          {article.image ? (
            <img 
              src={article.image} 
              alt={article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl">🏏</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-primary">{article.category}</span>
            <span>•</span>
            <span>{timeDisplay}</span>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "overflow-hidden rounded-xl bg-card border border-border group cursor-pointer",
        className
      )}
    >
      <div className="aspect-[16/10] relative bg-muted overflow-hidden">
        {article.image ? (
          <img 
            src={article.image} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🏏
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-primary">
            {article.category}
          </span>
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeDisplay}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.article>
  )
}
