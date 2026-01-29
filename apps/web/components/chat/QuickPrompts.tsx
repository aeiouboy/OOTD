'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Briefcase, Heart, Sparkles, Coffee, GraduationCap, Plane, Music, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void
}

const quickPrompts = [
  { id: 'work', label: 'ทำงาน', prompt: 'อยากได้ชุดไปทำงาน', icon: Briefcase },
  { id: 'wedding', label: 'งานแต่ง', prompt: 'หาชุดไปงานแต่งงาน', icon: Heart },
  { id: 'travel', label: 'เที่ยว', prompt: 'อยากได้ชุดใส่ไปเที่ยว', icon: Plane },
  { id: 'chill', label: 'วันหยุด', prompt: 'ชุดคาสชวล วันหยุด สบายๆ', icon: Coffee },
  { id: 'party', label: 'ปาร์ตี้', prompt: 'ชุดไปปาร์ตี้', icon: Music },
  { id: 'graduation', label: 'รับปริญญา', prompt: 'ชุดไปงานรับปริญญา', icon: GraduationCap },
  { id: 'casual', label: 'แคชชวล', prompt: 'ชุดลุคสบายๆ แคชชวล', icon: Sparkles },
]

const morePrompts = [
  { id: 'date', label: 'เดท', prompt: 'ชุดไปเดท', icon: Heart },
  { id: 'interview', label: 'สัมภาษณ์', prompt: 'ชุดไปสัมภาษณ์งาน', icon: Briefcase },
  { id: 'cafe', label: 'คาเฟ่', prompt: 'ชุดไปนั่งคาเฟ่', icon: Coffee },
]

export function QuickPrompts({ onPromptClick }: QuickPromptsProps) {
  const [showMore, setShowMore] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const allPrompts = showMore ? [...quickPrompts, ...morePrompts] : quickPrompts

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [showMore])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 150
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="px-4 py-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Chips Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allPrompts.map((prompt) => {
            const Icon = prompt.icon
            return (
              <Button
                key={prompt.id}
                variant="outline"
                size="sm"
                onClick={() => onPromptClick(prompt.prompt)}
                className={cn(
                  "text-xs rounded-full h-8 gap-1.5 flex-shrink-0 whitespace-nowrap",
                  "border-muted-foreground/20 hover:border-primary hover:bg-primary/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {prompt.label}
              </Button>
            )
          })}

          {/* Show More Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "text-xs rounded-full h-8 gap-1 flex-shrink-0 whitespace-nowrap",
              "border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5",
              showMore && "bg-primary/10 border-primary"
            )}
          >
            <Plus className={cn("w-3.5 h-3.5 transition-transform", showMore && "rotate-45")} />
            {showMore ? 'ซ่อน' : 'เพิ่ม'}
          </Button>
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
