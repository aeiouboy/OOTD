import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductModal from '../ProductModal'
import type { Product } from '@/lib/types'

vi.mock('next/image', () => ({
  default: (props: any) => <span data-next-image={String(props.src || '')} />,
}))

const mockProduct: Product = {
  sku: 'TEST001',
  name: 'Test Product Name',
  brand: 'Test Brand',
  price: 1290,
  imageUrl: '/test-image.jpg',
  availability: 'in_stock',
  storeLocations: ['Central World'],
  onlineUrl: 'https://central.co.th/product/test001',
  sizes: ['S', 'M', 'L'],
  colors: ['White', 'Black'],
}

describe('ProductModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders product information when opened', () => {
    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getAllByText(mockProduct.name).length).toBeGreaterThan(0)
    expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    expect(screen.getByText('Buy Online')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<ProductModal product={mockProduct} isOpen={true} onClose={onClose} />)

    await user.click(screen.getByLabelText('Close product details'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens product url when Buy Online is clicked', async () => {
    const user = userEvent.setup()
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)

    await user.click(screen.getByText('Buy Online'))

    expect(windowOpenSpy).toHaveBeenCalledWith(
      mockProduct.onlineUrl,
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('updates quantity when + and - are clicked', async () => {
    const user = userEvent.setup()

    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '-' }))
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('opens maps search when Find in Store is clicked', async () => {
    const user = userEvent.setup()
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)

    await user.click(screen.getByText('Find in Store'))

    expect(windowOpenSpy).toHaveBeenCalledTimes(1)
    const calledUrl = String(windowOpenSpy.mock.calls[0][0] || '')
    expect(calledUrl).toContain('google.com/maps/search')
    expect(calledUrl).toContain(encodeURIComponent(`${mockProduct.brand} ${mockProduct.storeLocations?.[0]}`))
  })

  it('uses navigator.share when share API is available', async () => {
    const user = userEvent.setup()
    const shareMock = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
    })

    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)

    await user.click(screen.getByLabelText('Share product'))

    expect(shareMock).toHaveBeenCalledWith({
      title: mockProduct.name,
      text: `${mockProduct.brand} - ${mockProduct.name}`,
      url: mockProduct.onlineUrl,
    })
  })

  it('opens related product when related card is clicked', async () => {
    const user = userEvent.setup()
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ProductModal product={mockProduct} isOpen={true} onClose={vi.fn()} />)
    const relatedCard = document.querySelector('[role="button"][tabindex="0"]') as HTMLElement | null

    expect(relatedCard).toBeTruthy()
    if (relatedCard) {
      await user.click(relatedCard)
    }

    expect(windowOpenSpy).toHaveBeenCalled()
  })
})
