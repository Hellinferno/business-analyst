import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[88px] w-full',
          'bg-[--surf-0] border border-[--bdr-0]',
          'px-3 py-2.5',
          'text-sm text-[--text-1] font-[family-name:var(--font-ui)]',
          'placeholder:text-[--text-3]',
          'transition-all duration-200',
          'focus:outline-none focus:border-[--lime]',
          'focus:shadow-[0_0_0_1px_var(--lime-s),0_0_18px_var(--lime-s)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'resize-y rounded-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
