import { render, screen } from '@testing-library/react'
import { OutfitDetail } from './OutfitDetail'
import { Outfit } from '@/lib/types'
import { describe, it, expect, vi } from 'vitest'

const mockOutfit: Outfit = {
    id: 'o-1',
    title: 'Test Outfit',
    description: 'Test Desc',
    totalPrice: 1000,
    items: [],
    imageUrl: '/img.jpg'
}

describe('OutfitDetail', () => {
    it('renders correctly', () => {
        render(
            <OutfitDetail
                outfit={mockOutfit}
                onBack={vi.fn()}
                onBuyProduct={vi.fn()}
                onBuyAll={vi.fn()}
            />
        )
        expect(screen.getByText('Test Outfit')).toBeInTheDocument()
    })
    it('handles null outfit gracefully', () => {
        // If we pass undefined as any
        const { container } = render(
            <OutfitDetail
                // @ts-expect-error Testing runtime check
                outfit={undefined}
                onBack={vi.fn()}
                onBuyProduct={vi.fn()}
                onBuyAll={vi.fn()}
            />
        )
        expect(container).toBeEmptyDOMElement()
    })
})
