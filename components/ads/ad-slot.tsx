import { cn } from "@/lib/utils"

type AdSlotProps = {
  id: string
  label: string
  className?: string
  minHeight?: string
}

export function AdSlot({ id, label, className, minHeight = "min-h-24" }: AdSlotProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  if (!publisherId) return null

  return (
    <aside
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden",
        minHeight,
        className
      )}
      data-ad-slot={id}
    >
      <ins
        className="adsbygoogle block min-h-[inherit] w-full"
        data-ad-client={publisherId}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
