import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  OccasionSuggestionCard,
  type SuggestionProduct,
} from '../OccasionSuggestionCard'

// Mock next/image -- jsdom cannot render Next.js <Image>, so we swap in a plain <img>
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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

describe('OccasionSuggestionCard', () => {
  it('renders product name, brand, and price correctly', () => {
    render(<OccasionSuggestionCard product={makeProduct()} />)

    expect(screen.getByText('Floral Midi Dress')).toBeInTheDocument()
    expect(screen.getByText('COS')).toBeInTheDocument()
    // Price formatted with Thai Baht -- the component renders &#x0E3F; which is ฿
    expect(screen.getByText(/฿3,500/)).toBeInTheDocument()
  })

  it('shows occasion badge with correct text for each occasion type', () => {
    const { rerender } = render(
      <OccasionSuggestionCard product={makeProduct({ primary_occasion: 'weekend_social' })} />
    )
    expect(screen.getByText('Weekend')).toBeInTheDocument()

    rerender(
      <OccasionSuggestionCard product={makeProduct({ primary_occasion: 'date_night' })} />
    )
    expect(screen.getByText('Date Night')).toBeInTheDocument()

    rerender(
      <OccasionSuggestionCard product={makeProduct({ primary_occasion: 'everyday_casual' })} />
    )
    expect(screen.getByText('Everyday')).toBeInTheDocument()
  })

  it('renders initials fallback when image_url is null', () => {
    render(
      <OccasionSuggestionCard
        product={makeProduct({ image_url: null, product_name: 'Cotton Shirt' })}
      />
    )
    // getInitials('Cotton Shirt') => 'CS'
    expect(screen.getByText('CS')).toBeInTheDocument()
  })

  it('onClick handler fires when card is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const product = makeProduct()

    render(<OccasionSuggestionCard product={product} onClick={onClick} />)

    await user.click(screen.getByTestId('suggestion-card'))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick).toHaveBeenCalledWith(product)
  })

  it('formats price with Thai Baht symbol', () => {
    render(<OccasionSuggestionCard product={makeProduct({ price: 12900 })} />)
    expect(screen.getByText(/฿12,900/)).toBeInTheDocument()
  })

  it('handles null brand gracefully (no brand text rendered)', () => {
    render(<OccasionSuggestionCard product={makeProduct({ brand: null })} />)

    expect(screen.getByText('Floral Midi Dress')).toBeInTheDocument()
    // Brand paragraph should not be present
    expect(screen.queryByText('COS')).not.toBeInTheDocument()
  })

  it('handles null price gracefully (no price text rendered)', () => {
    render(<OccasionSuggestionCard product={makeProduct({ price: null })} />)

    expect(screen.getByText('Floral Midi Dress')).toBeInTheDocument()
    // No Baht symbol should be rendered
    expect(screen.queryByText(/฿/)).not.toBeInTheDocument()
  })

  it('handles null primary_occasion gracefully (no badge rendered)', () => {
    render(
      <OccasionSuggestionCard product={makeProduct({ primary_occasion: null })} />
    )
    expect(screen.queryByText('Weekend')).not.toBeInTheDocument()
    expect(screen.queryByText('Date Night')).not.toBeInTheDocument()
    expect(screen.queryByText('Everyday')).not.toBeInTheDocument()
  })
})
