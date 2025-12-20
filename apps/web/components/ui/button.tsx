import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * OOTDay Button Component
 *
 * @description Button component with fashion brand styling and accessibility features
 * @example
 * <Button variant="primary" size="md">Shop Now</Button>
 * <Button variant="secondary" loading>Processing...</Button>
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-[#A01730] active:bg-[#851429] focus-visible:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70',
        outline:
          'border-2 border-primary bg-transparent text-primary shadow-sm hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-primary',
        ghost:
          'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-primary',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
        circle:
          'rounded-full bg-primary text-primary-foreground shadow-md hover:bg-[#A01730] active:bg-[#851429] focus-visible:ring-primary size-14 p-0',
      },
      size: {
        sm: 'h-8 px-3 text-sm min-h-[44px] min-w-[44px]',
        md: 'h-10 px-4 text-base min-h-[44px] min-w-[44px]',
        lg: 'h-12 px-6 text-lg min-h-[44px] min-w-[44px]',
        icon: 'size-10 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child component */
  asChild?: boolean
  /** Show loading spinner */
  loading?: boolean
  /** Icon to display */
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        data-loading={loading}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {!loading && icon && icon}
        {children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
