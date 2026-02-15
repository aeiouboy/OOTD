'use client'

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { OCCASIONS, getAllOccasionTypes } from '@/lib/constants/occasions'

interface OccasionFilterProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function OccasionFilter({ value, onChange }: OccasionFilterProps) {
  const allTypes = getAllOccasionTypes()

  const handleToggle = (occasionId: string) => {
    // Single-select: toggle off if already selected, otherwise select only this one
    if (value.includes(occasionId)) {
      onChange([])
    } else {
      onChange([occasionId])
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Occasion</h3>
      <div className="space-y-2">
        {allTypes.map((type) => {
          const occasion = OCCASIONS[type]
          return (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`occasion-${type}`}
                checked={value.includes(type)}
                onCheckedChange={() => handleToggle(type)}
              />
              <Label
                htmlFor={`occasion-${type}`}
                className="text-sm cursor-pointer"
              >
                {occasion.name.th}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
