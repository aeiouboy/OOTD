'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string, attachment?: File) => void
  disabled?: boolean
  placeholder?: string
  showAttachment?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "พิมพ์ข้อความ...",
  showAttachment = true
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if ((!value.trim() && !attachment) || disabled) return
    onSend(value.trim(), attachment || undefined)
    setValue('')
    setAttachment(null)
    setAttachmentPreview(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachment(file)
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAttachmentPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const hasContent = value.trim() || attachment

  return (
    <div className="border-t px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Attachment Preview */}
      {attachmentPreview && (
        <div className="mb-2 relative inline-block">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
            <img
              src={attachmentPreview}
              alt="Attachment preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={removeAttachment}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Container - Pill style with internal buttons */}
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-3xl border border-input bg-background px-3 py-2",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50"
        )}
      >
        {/* Attachment Button */}
        {showAttachment && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAttachmentClick}
              disabled={disabled}
              className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm outline-none",
            "placeholder:text-muted-foreground",
            "min-h-[36px] max-h-[120px] py-2",
            "scrollbar-thin scrollbar-thumb-muted"
          )}
          style={{
            height: 'auto',
            overflowY: value.split('\n').length > 3 ? 'auto' : 'hidden'
          }}
        />

        {/* Send Button - Inside input */}
        <Button
          onClick={handleSend}
          disabled={!hasContent || disabled}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full flex-shrink-0 transition-all",
            hasContent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
