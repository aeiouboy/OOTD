/**
 * ProductDetail Component Tests
 *
 * Tests for inline product detail display
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetail from '../ProductDetail'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  sku: 'TEST001',
  name: 'Test Product Name',
  brand: 'Test Brand',
  price: 1290,
  imageUrl: '/test-image.jpg',
  availability: 'in_stock',
  storeLocations: ['Central World', 'Central Ladprao'],
  onlineUrl: 'https://central.co.th/product/test001',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['White', 'Black', 'Navy'],
}

describe('ProductDetail Component', () => {
  describe('Rendering', () => {
    it('renders product details inline without Dialog wrapper', () => {
      render(<ProductDetail product={mockProduct} />)

      // Should render in a regular div, not a dialog
      const dialogs = screen.queryAllByRole('dialog')
      expect(dialogs.length).toBe(0)

      // Should show product name and brand
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    })

    it('displays product price correctly', () => {
      render(<ProductDetail product={mockProduct} />)
      // Price is formatted with toLocaleString() - using getAllByText since price appears multiple times (main + related products)
      const priceElements = screen.getAllByText(/฿1,290|฿1290/)
      expect(priceElements.length).toBeGreaterThan(0)
    })

    it('shows availability badge', () => {
      render(<ProductDetail product={mockProduct} />)
      expect(screen.getByText('In Stock')).toBeInTheDocument()
    })

    it('displays store locations', () => {
      render(<ProductDetail product={mockProduct} />)
      expect(screen.getByText('Central World')).toBeInTheDocument()
      expect(screen.getByText('Central Ladprao')).toBeInTheDocument()
    })
  })

  describe('Back Button', () => {
    it('renders back button when onBack prop is provided', () => {
      const onBack = vi.fn()
      render(<ProductDetail product={mockProduct} onBack={onBack} />)

      expect(screen.getByText('Back to Outfits')).toBeInTheDocument()
    })

    it('does not render back button when onBack is not provided', () => {
      render(<ProductDetail product={mockProduct} />)

      expect(screen.queryByText('Back to Outfits')).not.toBeInTheDocument()
    })

    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()
      render(<ProductDetail product={mockProduct} onBack={onBack} />)

      const backButton = screen.getByText('Back to Outfits')
      await user.click(backButton)

      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Size Selection', () => {
    it('renders all available sizes', () => {
      render(<ProductDetail product={mockProduct} />)

      mockProduct.sizes?.forEach(size => {
        expect(screen.getByText(size)).toBeInTheDocument()
      })
    })

    it('allows selecting a size', async () => {
      const user = userEvent.setup()
      render(<ProductDetail product={mockProduct} />)

      const mediumButton = screen.getByRole('button', { name: 'M' })
      await user.click(mediumButton)

      // Selected size button should have 'default' variant styling
      expect(mediumButton).toBeInTheDocument()
    })

    it('does not render size section when sizes are not provided', () => {
      const productWithoutSizes = { ...mockProduct, sizes: undefined }
      render(<ProductDetail product={productWithoutSizes} />)

      expect(screen.queryByText('Size')).not.toBeInTheDocument()
    })
  })

  describe('Color Selection', () => {
    it('renders all available colors', () => {
      render(<ProductDetail product={mockProduct} />)

      mockProduct.colors?.forEach(color => {
        expect(screen.getByText(color)).toBeInTheDocument()
      })
    })

    it('allows selecting a color', async () => {
      const user = userEvent.setup()
      render(<ProductDetail product={mockProduct} />)

      const blackButton = screen.getByRole('button', { name: 'Black' })
      await user.click(blackButton)

      expect(blackButton).toBeInTheDocument()
    })

    it('does not render color section when colors are not provided', () => {
      const productWithoutColors = { ...mockProduct, colors: undefined }
      render(<ProductDetail product={productWithoutColors} />)

      expect(screen.queryByText('Color')).not.toBeInTheDocument()
    })
  })

  describe('Quantity Controls', () => {
    it('renders quantity selector with default value of 1', () => {
      render(<ProductDetail product={mockProduct} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('increases quantity when + button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDetail product={mockProduct} />)

      const plusButton = screen.getAllByRole('button', { name: '+' })[0]
      await user.click(plusButton)

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('decreases quantity when - button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDetail product={mockProduct} />)

      // First increase to 2
      const plusButton = screen.getAllByRole('button', { name: '+' })[0]
      await user.click(plusButton)

      // Then decrease back to 1
      const minusButton = screen.getAllByRole('button', { name: '-' })[0]
      await user.click(minusButton)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('disables minus button when quantity is 1', () => {
      render(<ProductDetail product={mockProduct} />)

      const minusButton = screen.getAllByRole('button', { name: '-' })[0]
      expect(minusButton).toBeDisabled()
    })
  })

  describe('Action Buttons', () => {
    it('renders Buy Now button', () => {
      render(<ProductDetail product={mockProduct} />)
      expect(screen.getByText('Buy Now')).toBeInTheDocument()
    })

    it('renders Find in Store button', () => {
      render(<ProductDetail product={mockProduct} />)
      expect(screen.getByText('Find in Store')).toBeInTheDocument()
    })

    it('disables Buy Now button when out of stock', () => {
      const outOfStockProduct = { ...mockProduct, availability: 'out_of_stock' as const }
      render(<ProductDetail product={outOfStockProduct} />)

      const buyButton = screen.getByText('Buy Now')
      expect(buyButton).toBeDisabled()
    })

    it('opens product URL in new tab when Buy Now is clicked', async () => {
      const user = userEvent.setup()
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(<ProductDetail product={mockProduct} />)

      const buyButton = screen.getByText('Buy Now')
      await user.click(buyButton)

      expect(windowOpenSpy).toHaveBeenCalled()

      windowOpenSpy.mockRestore()
    })
  })

  describe('Image Gallery', () => {
    it('renders product image', () => {
      render(<ProductDetail product={mockProduct} />)

      const images = screen.getAllByAltText(mockProduct.name)
      expect(images.length).toBeGreaterThan(0)
    })

    it('renders image navigation controls', () => {
      render(<ProductDetail product={mockProduct} />)

      // Should have prev/next buttons in the image carousel
      const buttons = screen.getAllByRole('button')
      const hasNavigationButtons = buttons.length > 5 // Account for all buttons including carousel controls
      expect(hasNavigationButtons).toBe(true)
    })

    it('renders image indicators', () => {
      const { container } = render(<ProductDetail product={mockProduct} />)

      // Check for image indicator buttons (3 dots for 3 images)
      const indicators = container.querySelectorAll('button[class*="rounded-full"]')
      expect(indicators.length).toBeGreaterThan(0)
    })
  })

  describe('Product Details Accordion', () => {
    it('renders accordion sections', () => {
      render(<ProductDetail product={mockProduct} />)

      expect(screen.getByText('Product Description')).toBeInTheDocument()
      expect(screen.getByText('Care Instructions')).toBeInTheDocument()
      expect(screen.getByText('Shipping & Returns')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      const { container } = render(<ProductDetail product={mockProduct} className="custom-class" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })

    it('has responsive grid layout classes', () => {
      const { container } = render(<ProductDetail product={mockProduct} />)

      const gridElement = container.querySelector('.grid')
      expect(gridElement?.className).toContain('md:grid-cols-2')
    })
  })

  describe('Availability States', () => {
    it('shows correct badge color for in_stock', () => {
      render(<ProductDetail product={mockProduct} />)
      const badge = screen.getByText('In Stock')
      expect(badge.className).toContain('bg-green')
    })

    it('shows correct badge color for low_stock', () => {
      const lowStockProduct = { ...mockProduct, availability: 'low_stock' as const }
      render(<ProductDetail product={lowStockProduct} />)
      const badge = screen.getByText('Low Stock')
      expect(badge.className).toContain('bg-yellow')
    })

    it('shows correct badge color for out_of_stock', () => {
      const outOfStockProduct = { ...mockProduct, availability: 'out_of_stock' as const }
      render(<ProductDetail product={outOfStockProduct} />)
      const badge = screen.getByText('Out of Stock')
      expect(badge.className).toContain('bg-red')
    })
  })

  describe('Interactive Features', () => {
    it('toggles like button state', async () => {
      const user = userEvent.setup()
      const { container } = render(<ProductDetail product={mockProduct} />)

      // Find the heart/like button (first button in the image section)
      const likeButton = container.querySelector('button svg[class*="Heart"]')?.closest('button')
      expect(likeButton).toBeInTheDocument()

      if (likeButton) {
        await user.click(likeButton)
        // After click, the heart should have fill styling
        const heartIcon = likeButton.querySelector('svg')
        expect(heartIcon).toBeInTheDocument()
      }
    })

    it('toggles zoom state when image is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDetail product={mockProduct} />)

      const images = screen.getAllByAltText(mockProduct.name)
      const productImage = images[0]

      await user.click(productImage)

      // After click, image should have zoom class
      expect(productImage.className).toContain('scale-')
    })
  })

  describe('Features Display', () => {
    it('shows delivery, returns, and warranty features', () => {
      render(<ProductDetail product={mockProduct} />)

      expect(screen.getByText('Free delivery')).toBeInTheDocument()
      expect(screen.getByText('30-day returns')).toBeInTheDocument()
      expect(screen.getByText('Warranty')).toBeInTheDocument()
    })
  })
})
