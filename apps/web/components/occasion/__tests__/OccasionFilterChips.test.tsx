import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OccasionFilterChips } from '../OccasionFilterChips'

describe('OccasionFilterChips', () => {
  it('renders all 3 occasion chips with English labels', () => {
    render(<OccasionFilterChips selected={null} onSelect={() => {}} />)

    expect(screen.getByText('Weekend & Social')).toBeInTheDocument()
    expect(screen.getByText('Date Night')).toBeInTheDocument()
    expect(screen.getByText('Everyday Casual')).toBeInTheDocument()
  })

  it('selected chip has aria-pressed=true', () => {
    render(<OccasionFilterChips selected="date_night" onSelect={() => {}} />)

    const dateNightBtn = screen.getByRole('button', { pressed: true })
    expect(dateNightBtn).toBeInTheDocument()
    // The other buttons should NOT be pressed
    const allButtons = screen.getAllByRole('button')
    const unpressedButtons = allButtons.filter(
      (btn) => btn.getAttribute('aria-pressed') === 'false'
    )
    expect(unpressedButtons).toHaveLength(2)
  })

  it('selected chip applies active color class', () => {
    const { container } = render(
      <OccasionFilterChips selected="weekend_social" onSelect={() => {}} />
    )

    const activeButton = container.querySelector('[aria-pressed="true"]')
    expect(activeButton).toBeInTheDocument()
    expect(activeButton?.className).toContain('bg-purple-50')
    expect(activeButton?.className).toContain('border-purple-300')
  })

  it('onSelect fires with correct OccasionType when clicking a chip', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<OccasionFilterChips selected={null} onSelect={onSelect} />)

    await user.click(screen.getByText('Date Night'))
    expect(onSelect).toHaveBeenCalledWith('date_night')

    onSelect.mockClear()
    await user.click(screen.getByText('Weekend & Social'))
    expect(onSelect).toHaveBeenCalledWith('weekend_social')

    onSelect.mockClear()
    await user.click(screen.getByText('Everyday Casual'))
    expect(onSelect).toHaveBeenCalledWith('everyday_casual')
  })

  it('clicking already-selected chip deselects it (calls onSelect with null)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<OccasionFilterChips selected="date_night" onSelect={onSelect} />)

    await user.click(screen.getByText('Date Night'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('renders Thai labels correctly', () => {
    render(<OccasionFilterChips selected={null} onSelect={() => {}} />)

    expect(screen.getByText('สุดสัปดาห์')).toBeInTheDocument()
    expect(screen.getByText('เดทไนท์')).toBeInTheDocument()
    expect(screen.getByText('แคชชวล')).toBeInTheDocument()
  })
})
