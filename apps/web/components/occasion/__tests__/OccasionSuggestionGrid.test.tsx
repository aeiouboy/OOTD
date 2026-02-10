import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OccasionSuggestionGrid } from '../OccasionSuggestionGrid'
import type { SuggestionProduct } from '../OccasionSuggestionCard'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

function makeProduct(overrides: Partial<SuggestionProduct> = {}): SuggestionProduct {
  return {
    id: '1',
    sku: 'SKU-001',
    product_name: 'Floral Midi Dress',
    brand: 'COS',
    price: 3500,
    original_price: 4500,
    image_url: 'https://example.com/dress.jpg',
    link: 'https://example.com/dress',
    availability: 'in_stock',
    product_description: 'A beautiful floral midi dress',
    primary_occasion: 'weekend_social',
    ...overrides,
  }
}

function makeProducts(count: number): SuggestionProduct[] {
  return Array.from({ length: count }, (_, i) =>
    makeProduct({ id: String(i + 1), product_name: `Product ${i + 1}` })
  )
}

describe('OccasionSuggestionGrid', () => {
  it('shows skeleton loading state when isLoading=true', () => {
    const { container } = render(
      <OccasionSuggestionGrid
        products={[]}
        isLoading={true}
        occasion="weekend_social"
      />
    )

    // The loading container has aria-busy="true"
    const loadingGrid = container.querySelector('[aria-busy="true"]')
    expect(loadingGrid).toBeInTheDocument()

    // Should render 8 skeleton placeholders with animate-pulse class
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(8)
  })

  it('shows empty state when products=[] and isLoading=false', () => {
    render(
      <OccasionSuggestionGrid
        products={[]}
        isLoading={false}
        occasion="weekend_social"
      />
    )

    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeInTheDocument()
    expect(screen.getByText(/no suggestions/i)).toBeInTheDocument()
  })

  it('renders correct number of cards matching products array length', () => {
    const products = makeProducts(5)

    const { container } = render(
      <OccasionSuggestionGrid
        products={products}
        isLoading={false}
        occasion="weekend_social"
      />
    )

    const cards = container.querySelectorAll('[data-testid="suggestion-card"]')
    expect(cards).toHaveLength(5)
  })

  it('error state renders with role="alert" when error prop is set', () => {
    render(
      <OccasionSuggestionGrid
        products={[]}
        isLoading={false}
        occasion="weekend_social"
        error="Something went wrong"
      />
    )

    const alertEl = screen.getByRole('alert')
    expect(alertEl).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('retry button in error state calls onRetry callback when clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <OccasionSuggestionGrid
        products={[]}
        isLoading={false}
        occasion="weekend_social"
        error="Failed to load"
        onRetry={onRetry}
      />
    )

    const retryButton = screen.getByText('Try again')
    await user.click(retryButton)
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('grid container has correct responsive grid classes', () => {
    const products = makeProducts(3)

    const { container } = render(
      <OccasionSuggestionGrid
        products={products}
        isLoading={false}
        occasion="weekend_social"
      />
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.className).toContain('grid-cols-2')
    expect(grid.className).toContain('md:grid-cols-3')
    expect(grid.className).toContain('lg:grid-cols-4')
  })
})
