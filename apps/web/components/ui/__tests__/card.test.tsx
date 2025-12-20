import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card Component', () => {
  describe('Card', () => {
    it('renders card wrapper', () => {
      render(<Card data-testid="card">Card Content</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('applies default rounded border styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('has proper background color', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-card', 'text-card-foreground')
    })

    it('applies shadow styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('shadow-sm')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('accepts data attributes', () => {
      render(<Card data-custom="value" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('CardHeader', () => {
    it('renders card header', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('applies proper spacing', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5')
    })

    it('applies zero padding by default', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('p-0')
    })

    it('accepts custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders card title', () => {
      render(<CardTitle>Card Title</CardTitle>)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('renders as h3 heading by default', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
    })

    it('applies proper typography styles', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('text-xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('accepts custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders card description', () => {
      render(<CardDescription>Card description text</CardDescription>)
      expect(screen.getByText('Card description text')).toBeInTheDocument()
    })

    it('applies muted text styles', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('accepts custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="desc">Desc</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('renders card content', () => {
      render(<CardContent data-testid="content">Main content</CardContent>)
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('applies zero padding', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-0', 'pt-0')
    })

    it('accepts custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('renders card footer', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('applies flex layout', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex', 'items-center')
    })

    it('applies zero padding', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('p-0', 'pt-0')
    })

    it('accepts custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Composition', () => {
    it('renders complete card with all sections', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a full card example</CardDescription>
          </CardHeader>
          <CardContent>
            Main content area
          </CardContent>
          <CardFooter>
            Footer actions
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a full card example')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
      expect(screen.getByText('Footer actions')).toBeInTheDocument()
    })

    it('renders card with only header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>
            Content only
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Simple Card')).toBeInTheDocument()
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('renders minimal card with just content', () => {
      render(
        <Card>
          <CardContent>
            Minimal card
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Minimal card')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('maintains card structure on different screen sizes', () => {
      render(
        <Card data-testid="responsive-card">
          <CardHeader>
            <CardTitle>Responsive Title</CardTitle>
          </CardHeader>
          <CardContent>Responsive content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('responsive-card')
      // Card should maintain its structure
      expect(card).toHaveClass('rounded-lg')
    })
  })

  describe('Accessibility', () => {
    it('card has proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Description for screen readers</CardDescription>
          </CardHeader>
          <CardContent>
            Accessible content
          </CardContent>
        </Card>
      )

      // Should have heading structure
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('supports additional ARIA attributes', () => {
      render(
        <Card aria-label="Product card" role="article" data-testid="aria-card">
          <CardContent>Product details</CardContent>
        </Card>
      )

      const card = screen.getByTestId('aria-card')
      expect(card).toHaveAttribute('aria-label', 'Product card')
      expect(card).toHaveAttribute('role', 'article')
    })
  })

  describe('Content Overflow', () => {
    it('handles long content gracefully', () => {
      const longText = 'Lorem ipsum '.repeat(100)
      render(
        <Card>
          <CardContent data-testid="long-content">
            {longText}
          </CardContent>
        </Card>
      )

      expect(screen.getByTestId('long-content')).toBeInTheDocument()
      // Content should be present even if very long
      const content = screen.getByTestId('long-content').textContent
      expect(content).toBeTruthy()
      expect(content!.length).toBeGreaterThan(1000)
    })

    it('handles Thai text content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>ชื่อการ์ด</CardTitle>
            <CardDescription>คำอธิบายการ์ด</CardDescription>
          </CardHeader>
          <CardContent>
            เนื้อหาภาษาไทย
          </CardContent>
        </Card>
      )

      expect(screen.getByText('ชื่อการ์ด')).toBeInTheDocument()
      expect(screen.getByText('คำอธิบายการ์ด')).toBeInTheDocument()
      expect(screen.getByText('เนื้อหาภาษาไทย')).toBeInTheDocument()
    })
  })
})
