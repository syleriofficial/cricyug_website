import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type FantasyDisclaimerProps = {
  className?: string
  compact?: boolean
}

export function FantasyDisclaimer({ className, compact = false }: FantasyDisclaimerProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-warning/30 bg-warning/10 text-warning-foreground",
        compact ? "p-3" : "p-4",
        className
      )}
      aria-label="Fantasy and affiliate disclaimer"
    >
      <div className="flex gap-3">
        <ShieldAlert className={cn("shrink-0 text-warning", compact ? "h-4 w-4" : "h-5 w-5")} />
        <div>
          <p className={cn("font-semibold", compact ? "text-sm" : "text-base")}>Fantasy / Affiliate Disclaimer</p>
          <p className={cn("mt-1 leading-6 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            CricYug may show fantasy or affiliate links in approved ad areas. Predictions and fantasy suggestions are informational only, not financial advice. Play responsibly and follow local laws.
          </p>
        </div>
      </div>
    </section>
  )
}
