import type * as React from "react"
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from "@/lib/utils"

/**
 * OOTDay Card Component
 *
 * @description Responsive card component for displaying fashion content
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Product Title</CardTitle>
 *     <CardDescription>Product description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content goes here</CardContent>
 * </Card>
 */

const cardVariants = cva(
  "border shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        elevated: "bg-card text-card-foreground border-border shadow-md hover:shadow-lg transition-shadow",
        outlined: "bg-transparent text-card-foreground border-2 border-border",
        ghost: "bg-transparent text-card-foreground border-transparent shadow-none",
        product: "bg-primary text-primary-foreground border-transparent shadow-md hover:shadow-lg",
        selected: "bg-card text-card-foreground border-2 border-primary shadow-md",
      },
      size: {
        sm: "rounded-md p-3 gap-2",
        md: "rounded-lg p-4 md:p-6 gap-3 md:gap-4",
        lg: "rounded-xl p-6 md:p-8 gap-4 md:gap-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size }), "flex flex-col", className)}
      {...props}
    />
  )
}

/**
 * Card Header Component
 * @description Container for card title, description, and actions
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-0",
        className,
      )}
      {...props}
    />
  )
}

/**
 * Card Title Component
 * @description Main title for the card
 */
interface CardTitleProps extends React.ComponentProps<"h3"> {
  accent?: boolean
}

function CardTitle({ className, accent = false, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-none tracking-tight",
        accent && "text-primary",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card Description Component
 * @description Subtitle or description text for the card
 */
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Card Action Component
 * @description Container for action buttons in the card header
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center space-x-2", className)}
      {...props}
    />
  )
}

/**
 * Card Content Component
 * @description Main content area of the card
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-0 pt-0", className)}
      {...props}
    />
  )
}

/**
 * Card Footer Component
 * @description Footer area for additional actions or information
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-0 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
