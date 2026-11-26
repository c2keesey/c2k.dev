import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * Badge — c2k variants (docs/design-system.md §Badge)
 * tag       tech stack chips ("Python", "Astro") — mono, lowercase-as-written, hairline
 * role      a relationship to the project ("founder", "daily driver") — tinted violet
 * outline / secondary / default kept for shadcn parity
 * For live state use <StatusBadge>, never a Badge with a color.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent whitespace-nowrap transition-[color,border-color] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "rounded-sm bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground",
        secondary: "rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        outline: "rounded-sm border-border-strong px-2 py-0.5 text-xs font-medium text-foreground",
        tag: "rounded-xs border-border bg-surface px-1.5 py-px font-mono text-2xs text-muted-foreground [a&]:hover:border-border-strong [a&]:hover:text-foreground",
        role: "rounded-xs bg-primary/12 px-1.5 py-px font-mono text-2xs text-primary",
        destructive: "rounded-sm bg-destructive px-2 py-0.5 text-xs font-medium text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
