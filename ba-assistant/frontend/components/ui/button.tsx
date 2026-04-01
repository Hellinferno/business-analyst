import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-medium text-sm tracking-wide',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--lime]',
    'disabled:pointer-events-none disabled:opacity-40',
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[--lime] text-[--void]',
          'hover:bg-[--lime]/90 active:scale-[0.98]',
          'font-semibold',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/85',
        ].join(' '),
        outline: [
          'border border-[--bdr-1] bg-transparent text-[--text-2]',
          'hover:border-[--lime] hover:text-[--lime]',
          'active:scale-[0.98]',
        ].join(' '),
        secondary: [
          'bg-[--surf-2] text-[--text-1]',
          'border border-[--bdr-0]',
          'hover:border-[--bdr-1] hover:bg-[--surf-1]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[--text-2]',
          'hover:bg-[--surf-1] hover:text-[--text-1]',
        ].join(' '),
        link: [
          'text-[--lime] underline-offset-4',
          'hover:underline hover:text-[--lime]/80',
        ].join(' '),
      },
      size: {
        default: 'h-9 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
