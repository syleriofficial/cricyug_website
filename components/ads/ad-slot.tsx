import { cn } from "@/lib/utils"

type AdSlotProps = {
  id: string
  label: string
  className?: string
  minHeight?: string
}

export function AdSlot({ id, label, className, minHeight = "min-h-24" }: AdSlotProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  return (
    <aside
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/45 px-3 py-4 text-center",
        "overflow-hidden",
        minHeight,
        className
      )}
      data-ad-slot={id}
    >
      {publisherId ? (
        <ins
          className="adsbygoogle block min-h-[inherit] w-full"
          data-ad-client={publisherId}
          data-ad-slot={id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Advertisement</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      )}
    </aside>
  )
}
