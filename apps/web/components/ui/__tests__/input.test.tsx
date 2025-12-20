import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with default type text', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders with email type', () => {
      render(<Input type="email" placeholder="Email" />)
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })
  })

  describe('Accessibility', () => {
    it('meets minimum touch target height (44px)', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('min-h-[44px]') // 44px minimum
    })

    it('has proper focus-visible styles', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary')
    })

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid={true} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      // Input component may or may not have error styling - just check attribute
    })

    it('connects to label with aria-describedby', () => {
      render(<Input aria-describedby="helper-text" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'helper-text')
    })
  })

  describe('States', () => {
    it('renders disabled state', () => {
      render(<Input disabled placeholder="Disabled" />)
      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('renders read-only state', () => {
      render(<Input readOnly value="Read only" />)
      const input = screen.getByDisplayValue('Read only')
      expect(input).toHaveAttribute('readonly')
    })

    it('renders required state', () => {
      render(<Input required />)
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  describe('Interactions', () => {
    it('handles text input', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText('Type here')
      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('handles Thai character input', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="ป้อนข้อความ" />)

      const input = screen.getByPlaceholderText('ป้อนข้อความ')
      await user.type(input, 'สวัสดี')
      expect(input).toHaveValue('สวัสดี')
    })

    it('handles onChange events', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles onFocus events', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('handles onBlur events', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Should not type')
      expect(input).toHaveValue('')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation', async () => {
      const user = userEvent.setup()
      render(
        <>
          <Input placeholder="First" />
          <Input placeholder="Second" />
        </>
      )

      await user.tab()
      expect(screen.getByPlaceholderText('First')).toHaveFocus()

      await user.tab()
      expect(screen.getByPlaceholderText('Second')).toHaveFocus()
    })

    it('supports escape key press', async () => {
      const user = userEvent.setup()
      const handleKeyDown = vi.fn()
      render(<Input placeholder="Press Escape" onKeyDown={handleKeyDown} />)

      const input = screen.getByPlaceholderText('Press Escape')
      await user.click(input)
      expect(input).toHaveFocus()

      await user.keyboard('{Escape}')
      // Escape key was pressed - handler should be called
      expect(handleKeyDown).toHaveBeenCalled()
    })
  })

  describe('Input Types', () => {
    it('renders text input', () => {
      render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders email input', () => {
      render(<Input type="email" placeholder="Email" />)
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" placeholder="Password" />)
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" placeholder="Number" />)
      expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')
    })
  })

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Input className="custom-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })

    it('accepts placeholder text', () => {
      render(<Input placeholder="Custom placeholder" />)
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
    })

    it('accepts default value', () => {
      render(<Input defaultValue="Default text" />)
      expect(screen.getByDisplayValue('Default text')).toBeInTheDocument()
    })

    it('accepts controlled value', () => {
      render(<Input value="Controlled" onChange={vi.fn()} />)
      expect(screen.getByDisplayValue('Controlled')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<Input value="" onChange={vi.fn()} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('handles very long text', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(500)
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, longText)
      expect(input).toHaveValue(longText)
    })

    it('handles special characters', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, '!@#$%^&*()')
      expect(input).toHaveValue('!@#$%^&*()')
    })
  })
})
