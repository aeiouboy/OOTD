'use client'

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface OccasionFilterProps {
  value: string[]
  onChange: (value: string[]) => void
}

const occasions = [
  { id: 'today', label: "Today's Outfit" },
  { id: 'work', label: 'Work Outfit' },
  { id: 'party', label: 'Party Outfit' },
  { id: 'travel', label: 'Travel Outfit' },
]

export function OccasionFilter({ value, onChange }: OccasionFilterProps) {
  const handleToggle = (occasionId: string) => {
    const newValue = value.includes(occasionId)
      ? value.filter(id => id !== occasionId)
      : [...value, occasionId]
    onChange(newValue)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Occation</h3>
      <div className="space-y-2">
        {occasions.map((occasion) => (
          <div key={occasion.id} className="flex items-center space-x-2">
            <Checkbox
              id={`occasion-${occasion.id}`}
              checked={value.includes(occasion.id)}
              onCheckedChange={() => handleToggle(occasion.id)}
            />
            <Label
              htmlFor={`occasion-${occasion.id}`}
              className="text-sm cursor-pointer"
            >
              {occasion.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
