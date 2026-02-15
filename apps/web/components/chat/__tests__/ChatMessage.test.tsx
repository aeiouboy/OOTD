import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessage } from '../ChatMessage'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

function createMessage(overrides?: Partial<ChatMessageType>): ChatMessageType {
  return {
    id: 'msg-1',
    content: 'สวัสดีค่ะ',
    sender: 'assistant',
    timestamp: new Date('2026-02-15T10:00:00.000Z'),
    ...overrides,
  }
}

describe('ChatMessage', () => {
  it('renders assistant message content', () => {
    render(<ChatMessage message={createMessage({ content: 'มาแล้วจ้า ลองดูเลย' })} />)

    expect(screen.getByText('มาแล้วจ้า ลองดูเลย')).toBeInTheDocument()
  })

  it('renders markdown bold syntax as strong text', () => {
    const { container } = render(
      <ChatMessage message={createMessage({ content: 'จัดให้เลย **ลุคนี้** ปังมาก' })} />
    )

    const boldText = screen.getByText('ลุคนี้')
    expect(boldText.tagName).toBe('STRONG')
    expect(container.textContent).not.toContain('**ลุคนี้**')
  })

  it('renders line breaks from newline characters', () => {
    const { container } = render(
      <ChatMessage message={createMessage({ content: 'บรรทัดแรก\nบรรทัดสอง' })} />
    )

    expect(screen.getByText('บรรทัดแรก')).toBeInTheDocument()
    expect(screen.getByText('บรรทัดสอง')).toBeInTheDocument()
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })
})
