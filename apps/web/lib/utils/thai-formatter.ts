/**
 * Thai Formatter
 * Utilities for formatting Thai currency, text, and numbers
 */

/**
 * Format Thai Baht price (Task 5.7)
 */
export function formatThaiPrice(price: number, options?: { showCurrency?: boolean; decimals?: number }): string {
  const showCurrency = options?.showCurrency ?? true
  const decimals = options?.decimals ?? 0

  // Format with commas
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return showCurrency ? `฿${formatted}` : formatted
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  return `฿${formatThaiPrice(min, { showCurrency: false })} - ฿${formatThaiPrice(max, { showCurrency: false })}`
}

/**
 * Format discount percentage
 */
export function formatDiscount(original: number, current: number): string {
  const discount = ((original - current) / original) * 100
  return `-${Math.round(discount)}%`
}

/**
 * Get Thai number
 */
export function getThaiNumber(num: number): string {
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙']
  return num
    .toString()
    .split('')
    .map((d) => (d >= '0' && d <= '9' ? thaiDigits[parseInt(d)] : d))
    .join('')
}

/**
 * Format Thai size (convert international to Thai)
 */
export function formatThaiSize(internationalSize: string): string {
  const sizeMap: Record<string, string> = {
    XS: 'เล็กพิเศษ',
    S: 'เล็ก',
    M: 'กลาง',
    L: 'ใหญ่',
    XL: 'ใหญ่พิเศษ',
    XXL: 'ใหญ่มาก',
  }

  return sizeMap[internationalSize.toUpperCase()] || internationalSize
}

/**
 * Get Thai month name
 */
export function getThaiMonth(monthIndex: number): string {
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]
  return months[monthIndex] || ''
}

/**
 * Format Thai date
 */
export function formatThaiDate(date: Date): string {
  const day = date.getDate()
  const month = getThaiMonth(date.getMonth())
  const year = date.getFullYear() + 543 // Buddhist calendar

  return `${day} ${month} ${year}`
}

/**
 * Format product availability in Thai
 */
export function formatAvailabilityThai(status: string): string {
  const statusMap: Record<string, string> = {
    in_stock: 'มีสินค้า',
    low_stock: 'สินค้าใกล้หมด',
    out_of_stock: 'สินค้าหมด',
    pre_order: 'พรีออเดอร์',
  }

  return statusMap[status] || status
}

/**
 * Format gender in Thai
 */
export function formatGenderThai(gender: string): string {
  const genderMap: Record<string, string> = {
    men: 'ผู้ชาย',
    women: 'ผู้หญิง',
    unisex: 'ยูนิเซ็กซ์',
    kids: 'เด็ก',
  }

  return genderMap[gender] || gender
}

/**
 * Format occasion in Thai
 */
export function formatOccasionThai(occasion: string): string {
  const occasionMap: Record<string, string> = {
    work: 'ทำงาน/ออฟฟิศ',
    chill: 'วันชิลล์/วันหยุด',
    wedding: 'งานแต่งงาน',
    sport: 'ออกกำลังกาย',
    travel: 'ท่องเที่ยว',
    date: 'เดท',
    dinner: 'ดินเนอร์',
    cafe: 'คาเฟ่',
    party: 'ปาร์ตี้',
  }

  return occasionMap[occasion] || occasion
}

/**
 * Format formality level in Thai
 */
export function formatFormalityThai(level: number): string {
  if (level >= 9) return 'เป็นทางการมาก'
  if (level >= 7) return 'เป็นทางการ'
  if (level >= 5) return 'กึ่งทางการ'
  if (level >= 3) return 'สบายๆ'
  return 'สบายมาก'
}

/**
 * Truncate Thai text (respect Thai word boundaries)
 */
export function truncateThaiText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text

  // Try to break at space
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + ellipsis
  }

  return truncated + ellipsis
}

/**
 * Format product name for display (handle long Thai names)
 */
export function formatProductName(name: string, maxLength: number = 50): string {
  return truncateThaiText(name, maxLength)
}

/**
 * Get localized text with fallback
 */
export function getLocalizedText(
  content: { th?: string; en?: string },
  preferredLang: 'th' | 'en' = 'th'
): string {
  if (preferredLang === 'th') {
    return content.th || content.en || ''
  }
  return content.en || content.th || ''
}

/**
 * Format currency for different locales
 */
export function formatCurrency(amount: number, currency: string, locale: 'th' | 'en' = 'th'): string {
  if (currency === 'THB') {
    return formatThaiPrice(amount)
  }

  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
