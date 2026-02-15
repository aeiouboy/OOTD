import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OccasionFilterChips } from '../OccasionFilterChips'

describe('OccasionFilterChips', () => {
  it('renders all 9 occasion chips with English labels', () => {
    render(<OccasionFilterChips selected={null} onSelect={() => {}} />)

    expect(screen.getByText('Work/Office')).toBeInTheDocument()
    expect(screen.getByText('Chill Day/Relaxed')).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
    expect(screen.getByText('Sport/Exercise')).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText('Cafe')).toBeInTheDocument()
    expect(screen.getByText('Party')).toBeInTheDocument()
  })

  it('selected chip has aria-pressed=true', () => {
    render(<OccasionFilterChips selected="date" onSelect={() => {}} />)

    const dateBtn = screen.getByRole('button', { pressed: true })
    expect(dateBtn).toBeInTheDocument()
    // The other buttons should NOT be pressed
    const allButtons = screen.getAllByRole('button')
    const unpressedButtons = allButtons.filter(
      (btn) => btn.getAttribute('aria-pressed') === 'false'
    )
    expect(unpressedButtons).toHaveLength(8)
  })

  it('selected chip applies active color class', () => {
    const { container } = render(
      <OccasionFilterChips selected="work" onSelect={() => {}} />
    )

    const activeButton = container.querySelector('[aria-pressed="true"]')
    expect(activeButton).toBeInTheDocument()
    expect(activeButton?.className).toContain('bg-slate-50')
    expect(activeButton?.className).toContain('border-slate-400')
  })

  it('onSelect fires with correct OccasionType when clicking a chip', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<OccasionFilterChips selected={null} onSelect={onSelect} />)

    await user.click(screen.getByText('Date'))
    expect(onSelect).toHaveBeenCalledWith('date')

    onSelect.mockClear()
    await user.click(screen.getByText('Work/Office'))
    expect(onSelect).toHaveBeenCalledWith('work')

    onSelect.mockClear()
    await user.click(screen.getByText('Cafe'))
    expect(onSelect).toHaveBeenCalledWith('cafe')
  })

  it('clicking already-selected chip deselects it (calls onSelect with null)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<OccasionFilterChips selected="date" onSelect={onSelect} />)

    await user.click(screen.getByText('Date'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('renders Thai labels correctly', () => {
    render(<OccasionFilterChips selected={null} onSelect={() => {}} />)

    expect(screen.getByText('ทำงาน/ออฟฟิศ')).toBeInTheDocument()
    expect(screen.getByText('เดท')).toBeInTheDocument()
    expect(screen.getByText('คาเฟ่')).toBeInTheDocument()
  })
})
