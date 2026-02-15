'use client'

import { Heart } from 'lucide-react'

export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Heart className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-600 font-medium">
        ยังไม่มีลุคที่บันทึก
      </p>
      <p className="text-gray-400 text-sm mt-1">
        กดหัวใจที่ลุคในแชทเพื่อบันทึกไว้ที่นี่
      </p>
    </div>
  )
}
