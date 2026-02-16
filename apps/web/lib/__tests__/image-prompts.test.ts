import { describe, it, expect } from 'vitest'
import {
  buildFlatLayPrompt,
  buildFashionPrompt,
  buildFittingModelPrompt,
  buildMysteryModelPrompt,
  buildTryOnPrompt,
  buildDualReferenceTryOnPrompt,
  buildBackgroundPrompt,
  cleanCategoryForPrompt,
  containsProductNameOrSku,
  getDefaultImageConfig,
  computeFlatLayLayout,
} from '@/lib/prompts/image-prompts'
import type { FlatLayItem, BackgroundStyle } from '@/lib/types/image-types'

/**
 * Shared assertion: no prompt should contain negative-framing keywords.
 * This is the single most important invariant for Gemini 2.5 Flash Image
 * prompt quality -- negative instructions increase the probability of
 * the model producing the undesired output.
 */
const NEGATIVE_FRAMING = /\bDO NOT\b|\bAVOID\b|\bNEVER\b|\bREJECT IF\b/i

// ---------------------------------------------------------------------------
// buildFlatLayPrompt
// ---------------------------------------------------------------------------

describe('buildFlatLayPrompt', () => {
  const items: FlatLayItem[] = [
    { name: 'Navy Midi Dress XYZ-1234', category: 'Dresses', color: 'navy blue' },
    { name: 'Black Oxford Shoes', category: 'Shoes', color: 'black' },
    { name: 'Beige Tote Bag', category: 'Bags', color: 'beige' },
  ]

  it('renders correct item count', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toContain('3 fashion items')
  })

  it('uses category + colour descriptions, not raw product names', () => {
    const prompt = buildFlatLayPrompt(items)
    // Should contain cleaned categories, not the raw product names
    expect(prompt).not.toContain('Navy Midi Dress XYZ-1234')
    expect(prompt).not.toContain('Black Oxford Shoes')
    expect(prompt).toMatch(/navy blue dress/i)
    expect(prompt).toMatch(/black shoes/i)
    expect(prompt).toMatch(/beige bag/i)
  })

  it('includes commercial safety context', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toMatch(/e-commerce|product photography|fashion editorial/i)
  })

  it('includes anti-text instructions near the start of the prompt', () => {
    const prompt = buildFlatLayPrompt(items)
    const first150 = prompt.substring(0, 150)
    expect(first150).toContain('NO text')
  })

  it('includes spatial position strings', () => {
    const prompt = buildFlatLayPrompt(items)
    // 3 items = organic triangular: TOP-CENTER, LOWER-LEFT, LOWER-RIGHT
    expect(prompt).toContain('TOP-CENTER')
    expect(prompt).toContain('LOWER-LEFT')
    expect(prompt).toContain('LOWER-RIGHT')
  })

  it('includes size hints in the prompt', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toContain('(large)')
    expect(prompt).toContain('(medium)')
  })

  it('includes occasion context when provided', () => {
    const prompt = buildFlatLayPrompt(items, 'work meeting')
    expect(prompt).toContain('work meeting outfit')
  })

  it('omits occasion context when not provided', () => {
    const prompt = buildFlatLayPrompt(items)
    // Without occasion, the label defaults to "coordinated"
    expect(prompt).toContain('coordinated outfit')
  })

  it('includes Square 1:1 format hint', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toContain('Square 1:1 format.')
  })

  it('uses cleanCategoryForPrompt for normalisation', () => {
    const singleItem: FlatLayItem[] = [
      { name: 'Some Blouses', category: 'blouses', color: 'white' },
    ]
    const prompt = buildFlatLayPrompt(singleItem)
    // "blouses" should be normalised to "Blouse" (singular) via cleanCategoryForPrompt
    expect(prompt).toMatch(/white blouse/i)
  })

  it('prefers visualDescription when clean', () => {
    const withVisual: FlatLayItem[] = [
      { name: 'Product ABC', category: 'Top', visualDescription: 'cropped ribbed knit in ivory' },
    ]
    const prompt = buildFlatLayPrompt(withVisual)
    expect(prompt).toContain('cropped ribbed knit in ivory')
  })

  it('ignores visualDescription that contains product name patterns', () => {
    const withSku: FlatLayItem[] = [
      { name: 'Product', category: 'Top', color: 'red', visualDescription: 'SKU AB12345 red top' },
    ]
    const prompt = buildFlatLayPrompt(withSku)
    // Should fall back to category + colour, not use the SKU-contaminated visualDescription
    expect(prompt).not.toContain('SKU AB12345')
    expect(prompt).toMatch(/red top/i)
  })

  it('includes layout pattern description', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toContain('organic triangular grouping')
  })

  it('uses config-driven color normalization for prompt colors', () => {
    const thaiColorItems: FlatLayItem[] = [
      { name: 'Dress', category: 'Dresses', color: 'สีแดง' },
      { name: 'Heels', category: 'Shoes', color: 'สีดำ' },
      { name: 'Bag', category: 'Bags', color: 'สีขาว' },
    ]

    const prompt = buildFlatLayPrompt(thaiColorItems)
    expect(prompt).toMatch(/red dress/i)
    expect(prompt).toMatch(/black shoes/i)
    expect(prompt).toMatch(/white bag/i)
  })

  it('includes color fidelity map derived from item colors', () => {
    const prompt = buildFlatLayPrompt(items)
    expect(prompt).toContain('Color fidelity map:')
    expect(prompt).toContain('TOP-CENTER')
    expect(prompt).toContain('navy blue')
  })

  it('adds strict single-garment lock when manifest has only one garment', () => {
    const prompt = buildFlatLayPrompt([
      { name: 'Navy Midi Dress', category: 'Dress', color: 'navy blue' },
      { name: 'Black Pumps', category: 'Shoes', color: 'black' },
      { name: 'Beige Tote Bag', category: 'Bag', color: 'beige' },
      { name: 'Gold Hoop Earrings', category: 'Jewelry', color: 'gold' },
    ])

    expect(prompt).toContain('Single garment lock:')
    expect(prompt).toContain('Render exactly ONE garment piece total.')
    expect(prompt).toContain('Outerwear exclusion lock:')
  })
})

// ---------------------------------------------------------------------------
// computeFlatLayLayout (imported from image-prompts)
// ---------------------------------------------------------------------------

describe('computeFlatLayLayout', () => {
  it('classifies Dress as large, Shoes as medium, Jewelry as small', () => {
    const items: FlatLayItem[] = [
      { name: 'Midi Dress', category: 'Dress', color: 'Red' },
      { name: 'Loafers', category: 'Shoes', color: 'Black' },
      { name: 'Pearl Necklace', category: 'Necklace', color: 'White' },
    ]
    const layout = computeFlatLayLayout(items)
    expect(layout[0].sizeHint).toBe('large')
    expect(layout[1].sizeHint).toBe('medium')
    expect(layout[2].sizeHint).toBe('small')
  })

  it('handles case-insensitive categories', () => {
    const items: FlatLayItem[] = [
      { name: 'Item', category: 'BLAZER', color: 'Grey' },
    ]
    const layout = computeFlatLayLayout(items)
    expect(layout[0].sizeHint).toBe('large')
  })

  it('assigns presentation hints based on size', () => {
    const items: FlatLayItem[] = [
      { name: 'Coat', category: 'Coat', color: 'Black' },
      { name: 'Boots', category: 'Boots', color: 'Brown' },
      { name: 'Scarf', category: 'Scarf', color: 'Red' },
    ]
    const layout = computeFlatLayLayout(items)
    // Large items get laid-out hints
    expect(layout[0].presentationHint).toMatch(/laid out fully open|spread flat/)
    // Medium items get neat placement hints
    expect(layout[1].presentationHint).toMatch(/neatly|cleanly|alongside/)
    // Small items get accent hints
    expect(layout[2].presentationHint).toMatch(/accent|neatly|cleanly/)
  })
})

// ---------------------------------------------------------------------------
// buildFashionPrompt
// ---------------------------------------------------------------------------

describe('buildFashionPrompt', () => {
  it('includes the outfit description in the prompt', () => {
    const prompt = buildFashionPrompt('a white linen shirt with khaki trousers')
    expect(prompt).toContain('a white linen shirt with khaki trousers')
  })

  it('includes commercial safety context', () => {
    const prompt = buildFashionPrompt('casual outfit')
    expect(prompt).toMatch(/e-commerce|product photography|fashion editorial/i)
  })

  it('contains zero negative framing', () => {
    const prompt = buildFashionPrompt('test outfit')
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it('uses default style when no options provided', () => {
    const prompt = buildFashionPrompt('test')
    expect(prompt).toContain('editorial fashion')
    expect(prompt).toContain('full-body model shoot')
    expect(prompt).toContain('studio')
    expect(prompt).toContain('modern international')
  })

  it('applies custom style options', () => {
    const prompt = buildFashionPrompt('test', {
      photographyStyle: 'street style',
      composition: 'half-body',
      lighting: 'golden hour',
      aestheticContext: 'urban minimalist',
    })
    expect(prompt).toContain('street style')
    expect(prompt).toContain('half-body')
    expect(prompt).toContain('golden hour')
    expect(prompt).toContain('urban minimalist')
  })

  it('ends with Portrait 3:4 format hint', () => {
    const prompt = buildFashionPrompt('test')
    expect(prompt).toMatch(/Portrait 3:4 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// buildFittingModelPrompt
// ---------------------------------------------------------------------------

describe('buildFittingModelPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes e-commerce fashion catalog text', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt).toContain('e-commerce fashion catalog')
  })

  it('includes white crop top + black shorts description', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt).toMatch(/white spaghetti strap crop top/i)
    expect(prompt).toMatch(/black high-waisted legging shorts/i)
    expect(prompt).toMatch(/barefoot/i)
  })

  it('includes white infinity cove backdrop', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt).toContain('white infinity cove')
  })

  it('contains zero negative framing', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it('ends with Portrait 3:4 format hint', () => {
    const prompt = buildFittingModelPrompt()
    expect(prompt).toMatch(/Portrait 3:4 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// buildMysteryModelPrompt
// ---------------------------------------------------------------------------

describe('buildMysteryModelPrompt', () => {
  it('includes Thai woman description', () => {
    const prompt = buildMysteryModelPrompt()
    expect(prompt).toMatch(/Thai woman/i)
  })

  it('includes standard outfit description', () => {
    const prompt = buildMysteryModelPrompt()
    expect(prompt).toMatch(/white spaghetti strap crop top/i)
    expect(prompt).toMatch(/black high-waisted legging shorts/i)
  })

  it('contains zero negative framing', () => {
    const prompt = buildMysteryModelPrompt()
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it('includes commercial safety context', () => {
    const prompt = buildMysteryModelPrompt()
    expect(prompt).toMatch(/e-commerce|product photography|fashion catalog/i)
  })

  it('ends with Portrait 3:4 format hint', () => {
    const prompt = buildMysteryModelPrompt()
    expect(prompt).toMatch(/Portrait 3:4 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// buildTryOnPrompt
// ---------------------------------------------------------------------------

describe('buildTryOnPrompt', () => {
  const singleItem = [{ name: 'blue floral midi dress' }]
  const multipleItems = [
    { name: 'white blouse', category: 'Top' },
    { name: 'black tailored pants', category: 'Pants' },
    { name: 'nude heels', category: 'Heels' },
  ]

  it('includes outfit item descriptions', () => {
    const prompt = buildTryOnPrompt(multipleItems)
    expect(prompt).toContain('white blouse')
    expect(prompt).toContain('black tailored pants')
    expect(prompt).toContain('nude heels')
  })

  it('includes face preservation language', () => {
    const prompt = buildTryOnPrompt(singleItem)
    expect(prompt).toMatch(/face.*preserved|preserved.*face/i)
  })

  it('contains zero emoji checklists', () => {
    const prompt = buildTryOnPrompt(multipleItems)
    expect(prompt).not.toMatch(/[✓❌]/)
  })

  it('contains zero negative framing', () => {
    const prompt = buildTryOnPrompt(multipleItems)
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it('handles single item', () => {
    const prompt = buildTryOnPrompt(singleItem)
    expect(prompt).toContain('blue floral midi dress')
  })

  it('handles multiple items separated by commas', () => {
    const prompt = buildTryOnPrompt(multipleItems)
    expect(prompt).toContain('white blouse, black tailored pants, nude heels')
  })

  it('includes outfit title when provided', () => {
    const prompt = buildTryOnPrompt(multipleItems, 'Office Chic')
    expect(prompt).toContain('(Office Chic)')
  })

  it('ends with Portrait 3:4 format hint', () => {
    const prompt = buildTryOnPrompt(singleItem)
    expect(prompt).toMatch(/Portrait 3:4 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// buildDualReferenceTryOnPrompt
// ---------------------------------------------------------------------------

describe('buildDualReferenceTryOnPrompt', () => {
  const items = [
    { name: 'white blouse', category: 'Top' },
    { name: 'black skirt', category: 'Skirt' },
  ]

  it('references IMAGE 1 and IMAGE 2', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).toContain('IMAGE 1')
    expect(prompt).toContain('IMAGE 2')
  })

  it('includes outfit transfer instructions', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).toMatch(/transfer/i)
  })

  it('contains zero emoji checklists', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).not.toMatch(/[✓❌]/)
  })

  it('contains zero negative framing', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it('includes item list from parameters', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).toContain('white blouse, black skirt')
  })

  it('includes outfit title when provided', () => {
    const prompt = buildDualReferenceTryOnPrompt(items, 'Date Night')
    expect(prompt).toContain('(Date Night)')
  })

  it('ends with Portrait 3:4 format hint', () => {
    const prompt = buildDualReferenceTryOnPrompt(items)
    expect(prompt).toMatch(/Portrait 3:4 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// buildBackgroundPrompt
// ---------------------------------------------------------------------------

describe('buildBackgroundPrompt', () => {
  const allStyles: BackgroundStyle[] = [
    'white-clean',
    'marble-white',
    'marble-grey',
    'wood-light',
    'wood-dark',
    'linen-natural',
    'linen-grey',
  ]

  it.each(allStyles)('produces a non-empty prompt for "%s"', (style) => {
    const prompt = buildBackgroundPrompt(style)
    expect(prompt.length).toBeGreaterThan(0)
  })

  it.each(allStyles)('includes overhead/flat-lay context for "%s"', (style) => {
    const prompt = buildBackgroundPrompt(style)
    expect(prompt).toMatch(/overhead|flat-lay/i)
  })

  it.each(allStyles)('includes commercial framing for "%s"', (style) => {
    const prompt = buildBackgroundPrompt(style)
    expect(prompt).toMatch(/product photography|e-commerce|fashion/i)
  })

  it.each(allStyles)('contains zero negative framing for "%s"', (style) => {
    const prompt = buildBackgroundPrompt(style)
    expect(prompt).not.toMatch(NEGATIVE_FRAMING)
  })

  it.each(allStyles)('ends with Square 1:1 format for "%s"', (style) => {
    const prompt = buildBackgroundPrompt(style)
    expect(prompt).toMatch(/Square 1:1 format\.?$/)
  })
})

// ---------------------------------------------------------------------------
// cleanCategoryForPrompt
// ---------------------------------------------------------------------------

describe('cleanCategoryForPrompt', () => {
  it('maps "dresses" to "Dress"', () => {
    expect(cleanCategoryForPrompt('dresses')).toBe('Dress')
    expect(cleanCategoryForPrompt('Dresses')).toBe('Dress')
  })

  it('maps "shoes" to "Shoes"', () => {
    expect(cleanCategoryForPrompt('shoes')).toBe('Shoes')
    expect(cleanCategoryForPrompt('Shoes')).toBe('Shoes')
  })

  it('maps "tops" to "Top"', () => {
    expect(cleanCategoryForPrompt('tops')).toBe('Top')
    expect(cleanCategoryForPrompt('Tops')).toBe('Top')
  })

  it('maps "trousers" to "Pants"', () => {
    expect(cleanCategoryForPrompt('trousers')).toBe('Pants')
  })

  it('preserves unknown categories as-is', () => {
    expect(cleanCategoryForPrompt('Poncho')).toBe('Poncho')
    expect(cleanCategoryForPrompt('cape')).toBe('cape')
  })

  it('trims whitespace', () => {
    expect(cleanCategoryForPrompt('  dress  ')).toBe('Dress')
  })
})

// ---------------------------------------------------------------------------
// containsProductNameOrSku
// ---------------------------------------------------------------------------

describe('containsProductNameOrSku', () => {
  it('detects SKU patterns like "AB12345"', () => {
    expect(containsProductNameOrSku('AB12345 navy dress')).toBe(true)
  })

  it('detects long numeric codes', () => {
    expect(containsProductNameOrSku('Product 12345678')).toBe(true)
  })

  it('detects CamelCase brand-like names', () => {
    expect(containsProductNameOrSku('SomeBrandName dress')).toBe(true)
  })

  it('detects region markers', () => {
    expect(containsProductNameOrSku('Korean style blouse')).toBe(true)
  })

  it('detects marketing phrases', () => {
    expect(containsProductNameOrSku('online exclusive summer dress')).toBe(true)
  })

  it('returns false for clean category descriptions', () => {
    expect(containsProductNameOrSku('navy blue')).toBe(false)
    expect(containsProductNameOrSku('red dress')).toBe(false)
  })

  it('returns false for generic short words', () => {
    expect(containsProductNameOrSku('blue')).toBe(false)
    expect(containsProductNameOrSku('silk top')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getDefaultImageConfig
// ---------------------------------------------------------------------------

describe('getDefaultImageConfig', () => {
  it('returns 1:1 for flat-lay', () => {
    expect(getDefaultImageConfig('flat-lay')).toEqual({ aspect_ratio: '1:1' })
  })

  it('returns 1:1 for hybrid-flat-lay', () => {
    expect(getDefaultImageConfig('hybrid-flat-lay')).toEqual({ aspect_ratio: '1:1' })
  })

  it('returns 3:4 for fitting-model', () => {
    expect(getDefaultImageConfig('fitting-model')).toEqual({ aspect_ratio: '3:4' })
  })

  it('returns 3:4 for try-on', () => {
    expect(getDefaultImageConfig('try-on')).toEqual({ aspect_ratio: '3:4' })
  })

  it('returns 3:4 for try-on-dual', () => {
    expect(getDefaultImageConfig('try-on-dual')).toEqual({ aspect_ratio: '3:4' })
  })

  it('returns 3:4 for outfit', () => {
    expect(getDefaultImageConfig('outfit')).toEqual({ aspect_ratio: '3:4' })
  })

  it('returns 3:4 for unknown types (default)', () => {
    expect(getDefaultImageConfig('unknown-type')).toEqual({ aspect_ratio: '3:4' })
  })
})
