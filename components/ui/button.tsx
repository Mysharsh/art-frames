import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Posterwaala buttons. Variants set colour; sizes set shape:
 * - `pill` / `block` are the uppercase brand CTAs (44px+ tall),
 * - `icon` is a 44px round touch target,
 * - `default` / `sm` / `lg` keep the original shadcn shapes.
 * Orange text always uses `primary-ink` (orange on cream fails contrast).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        soft: 'border border-primary/40 bg-primary/10 text-primary-ink hover:bg-primary hover:text-primary-foreground',
        outline:
          'border border-border bg-background text-foreground hover:border-primary/40 hover:text-primary-ink',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-foreground hover:bg-secondary hover:text-primary-ink',
        chip: 'border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary-ink',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary-ink underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 rounded-md px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        pill: 'h-11 rounded-full px-5 text-xs font-semibold uppercase tracking-label',
        block: 'h-14 w-full rounded-xl text-sm font-bold uppercase tracking-widest',
        chip: 'h-11 rounded-lg px-3 text-xs font-medium',
        icon: 'h-11 w-11 rounded-full [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
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
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
