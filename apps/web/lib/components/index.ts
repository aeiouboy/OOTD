/**
 * OOTDay Component Library
 *
 * @description Centralized exports for all UI components
 * Organized following atomic design principles
 */

// Base UI Components (Atoms)
export { Button, buttonVariants, type ButtonProps } from '@/components/ui/button'
export { Input, inputVariants, type InputProps } from '@/components/ui/input'
export { Badge } from '@/components/ui/badge'

// Layout Components (Molecules)
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  type CardProps,
} from '@/components/ui/card'

// Interactive Components
export { Accordion } from '@/components/ui/accordion'
export { Dialog } from '@/components/ui/dialog'

// Theme Provider
export { ThemeProvider } from '@/components/theme-provider'

// Feature Components (Organisms)
// Note: These will be exported as they are implemented
// export { ChatInterface } from '@/components/chat'
// export { ProductCard } from '@/components/product'
// export { OutfitCard } from '@/components/outfit'
// export { Header } from '@/components/layout'