import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

/**
 * Shared input treatment for the auth forms — tokenized so it tracks the
 * DentMul system (border-input / bg-muted / focus ring-ring) in light and dark,
 * instead of the raw slate values the old screens hardcoded.
 *
 * Pass `align="top"` to float the icon for a multi-line control (textarea).
 */
export const authInputClass =
  "h-11 w-full rounded-xl border border-input bg-muted/40 pl-10 pr-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground/60 transition-[background-color,border-color,box-shadow] duration-200 " +
  "focus:bg-card focus:outline-none focus:ring-3 focus:ring-ring/25 focus:border-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50"

export function AuthField({
  label,
  icon: Icon,
  error,
  align = "center",
  children,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  error?: string
  align?: "center" | "top"
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <div
          className={cn(
            "pointer-events-none absolute left-3 flex text-muted-foreground/70",
            align === "top" ? "top-3" : "inset-y-0 items-center",
          )}
        >
          <Icon className="h-[1.1rem] w-[1.1rem]" />
        </div>
        {children}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
