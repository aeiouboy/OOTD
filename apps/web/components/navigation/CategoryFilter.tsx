'use client'

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CategoryFilterProps {
  value: 'all' | 'women' | 'men'
  onChange: (value: 'all' | 'women' | 'men') => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Category</h3>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="category-all" />
          <Label htmlFor="category-all" className="text-sm cursor-pointer">
            All
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="women" id="category-women" />
          <Label htmlFor="category-women" className="text-sm cursor-pointer">
            Women
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="men" id="category-men" />
          <Label htmlFor="category-men" className="text-sm cursor-pointer">
            Men
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
