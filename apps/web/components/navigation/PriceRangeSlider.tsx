'use client'

import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"

interface PriceRangeSliderProps {
  value: { min: number; max: number }
  onChange: (value: { min: number; max: number }) => void
  min?: number
  max?: number
  step?: number
}

export function PriceRangeSlider({
  value,
  onChange,
  min = 0,
  max = 20000,
  step = 500,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>([value.min, value.max])

  useEffect(() => {
    setLocalValue([value.min, value.max])
  }, [value.min, value.max])

  const handleValueChange = (newValue: number[]) => {
    setLocalValue([newValue[0], newValue[1]])
  }

  const handleValueCommit = (newValue: number[]) => {
    onChange({ min: newValue[0], max: newValue[1] })
  }

  const formatPrice = (price: number) => {
    return `฿${price.toLocaleString('th-TH')}`
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Price Range</h3>
      <div className="px-2 pt-2">
        <Slider
          min={min}
          max={max}
          step={step}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatPrice(localValue[0])}</span>
        <span>-</span>
        <span>{formatPrice(localValue[1])}</span>
      </div>
    </div>
  )
}
