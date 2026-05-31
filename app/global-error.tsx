"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            {/* Error Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            {/* Message */}
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={reset} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            {/* Error Details (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 rounded-lg bg-muted text-left text-sm">
                <p className="font-mono text-destructive break-all">{error.message}</p>
                {error.digest && (
                  <p className="mt-2 text-muted-foreground text-xs">Digest: {error.digest}</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </body>
    </html>
  )
}
