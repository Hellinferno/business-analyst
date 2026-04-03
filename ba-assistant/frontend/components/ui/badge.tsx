import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded-none",
  {
    variants: {
      variant: {
        default: "bg-[--lime-s] text-[--lime] border border-[--lime-m]",
        high:    "bg-red-900/40 text-red-300 border border-red-800/50",
        medium:  "bg-amber-900/40 text-amber-300 border border-amber-800/50",
        low:     "bg-[--surf-2] text-[--text-3] border border-[--bdr-0]",
        outline: "bg-transparent text-[--lime] border border-[--lime]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
