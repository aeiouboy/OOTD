import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * OOTDay Input Component
 *
 * @description Input component with validation states and Thai language support
 * @example
 * <Input type="text" placeholder="Enter your name" />
 * <Input type="email" label="Email" error="Please enter a valid email" />
 */

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors min-h-[44px] text-foreground",
  {
    variants: {
      variant: {
        default: "border-primary focus-visible:ring-primary",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Input label */
  label?: string
  /** Error message */
  error?: string
  /** Icon to display */
  icon?: React.ReactNode
  /** Helper text */
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, label, error, icon, helperText, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const hasError = !!error
    const currentVariant = hasError ? 'error' : variant

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: currentVariant }),
              icon && "pl-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
