'use client'

import { Button } from '@/components/ui/button'

interface FilterPillsProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

const occasions = [
  { id: 'work', label: 'Work' },
  { id: 'date', label: 'Date' },
  { id: 'chill', label: 'Chill' },
  { id: 'party', label: 'Party' },
]

export function FilterPills({ selected, onChange }: FilterPillsProps) {
  const handleToggle = (occasionId: string) => {
    const newSelected = selected.includes(occasionId)
      ? selected.filter(id => id !== occasionId)
      : [...selected, occasionId]
    onChange(newSelected)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {occasions.map((occasion) => {
        const isActive = selected.includes(occasion.id)
        return (
          <Button
            key={occasion.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggle(occasion.id)}
            className={`rounded-full whitespace-nowrap ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'border-primary text-primary hover:bg-primary/10'
            }`}
          >
            {occasion.label}
          </Button>
        )
      })}
    </div>
  )
}
