/**
 * Enhanced Mock Product Data
 *
 * This file enriches the original mockProducts from mock-data.ts with comprehensive
 * fashion domain attributes to enable better outfit matching and recommendation logic.
 *
 * Each product has 14 fashion-specific attributes covering:
 * - Style aesthetics (styleTags, aesthetic, colorPalette)
 * - Physical characteristics (fitType, patternType, materialType, silhouetteType)
 * - Seasonal suitability (seasonType)
 * - Formality levels (formalityLevel)
 * - Outfit composition (outfitRole, pairingCategories, layeringStyle)
 * - Brand positioning (brandTier)
 * - Color characteristics (colorTone)
 */

import type { Product } from './types'
import type {
  StyleTag,
  SeasonType,
  FormalityLevel,
  FitType,
  PatternType,
  MaterialType,
  AestheticCategory,
  ColorPalette,
  OutfitRole,
  BrandTier,
  LayeringStyle,
  SilhouetteType,
} from './types/enums'

/**
 * Color tone classification for color harmony matching
 */
export type ColorTone = 'warm' | 'cool' | 'neutral'

/**
 * Enhanced product interface extending the base Product with fashion attributes
 */
export interface EnhancedMockProduct extends Product {
  styleTags: StyleTag[]
  seasonType: SeasonType
  formalityLevel: FormalityLevel
  fitType: FitType
  patternType: PatternType
  materialType: MaterialType
  colorTone: ColorTone
  aesthetic: AestheticCategory
  colorPalette: ColorPalette
  outfitRole: OutfitRole
  brandTier: BrandTier
  pairingCategories: string[]
  layeringStyle: LayeringStyle
  silhouetteType: SilhouetteType
}

/**
 * Enriched mock products array with comprehensive fashion attributes
 * for outfit recommendation and matching algorithms
 */
export const enhancedMockProducts: EnhancedMockProduct[] = [
  // CG001 - Classic White Button Shirt
  {
    sku: 'CG001',
    name: 'Classic White Button Shirt',
    brand: 'Central',
    price: 1290,
    imageUrl: '/white-button-shirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg001',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue'],
    category: 'Women',
    // Enhanced fashion attributes
    styleTags: ['classic', 'minimalist', 'corporate-chic'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'cotton',
    colorTone: 'cool',
    aesthetic: 'corporate-chic',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'top',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blazer', 'Jeans'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',
  },

  // CG002 - Tailored Black Trousers
  {
    sku: 'CG002',
    name: 'Tailored Black Trousers',
    brand: 'Central',
    price: 1890,
    imageUrl: '/black-tailored-trousers.jpg',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna'],
    onlineUrl: 'https://central.co.th/product/cg002',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    category: 'Women',
    occasion: ['work', 'formal'],
    // Enhanced fashion attributes
    styleTags: ['classic', 'corporate-chic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blouse', 'Blazer', 'Shirt', 'Heels', 'Pumps'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',
  },

  // CG004 - Casual Denim Jeans
  {
    sku: 'CG004',
    name: 'Casual Denim Jeans',
    brand: 'Central',
    price: 1590,
    imageUrl: '/central-jeans.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg004',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    category: 'Women',
    occasion: ['casual', 'weekend'],
    // Enhanced fashion attributes
    styleTags: ['casual', 'modern', 'street-style'],
    seasonType: 'all-season',
    formalityLevel: 3,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'denim',
    colorTone: 'cool',
    aesthetic: 'casual-chic',
    colorPalette: 'monochromatic-blue',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['T-Shirt', 'Blouse', 'Shirt', 'Sneakers', 'Flats'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',
  },

  // CG005 - Floral Summer Dress
  {
    sku: 'CG005',
    name: 'Floral Summer Dress',
    brand: 'Central',
    price: 1590,
    imageUrl: '/floral-summer-dress.png',
    availability: 'low_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/product/cg005',
    sizes: ['S', 'M', 'L'],
    colors: ['Floral Pink', 'Floral Blue'],
    category: 'Women',
    occasion: ['casual', 'weekend'],
    // Enhanced fashion attributes
    styleTags: ['bohemian', 'trendy', 'casual'],
    seasonType: 'hot-season',
    formalityLevel: 4,
    fitType: 'regular',
    patternType: 'floral',
    materialType: 'cotton',
    colorTone: 'warm',
    aesthetic: 'clean-girl',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'dress',
    brandTier: 'mid-range',
    pairingCategories: ['Sandals', 'Flats', 'Bag', 'Belt'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',
  },

  // CG006 - Blazer Jacket
  {
    sku: 'CG006',
    name: 'Blazer Jacket',
    brand: 'Central',
    price: 2890,
    imageUrl: '/central-blazer.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg006',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Charcoal', 'Beige'],
    category: 'Women',
    occasion: ['work', 'formal'],
    // Enhanced fashion attributes
    styleTags: ['corporate-chic', 'classic', 'minimalist'],
    seasonType: 'cool-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'outerwear',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Shirt'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',
  },

  // CG007 - Cotton T-Shirt
  {
    sku: 'CG007',
    name: 'Cotton T-Shirt',
    brand: 'Central',
    price: 490,
    imageUrl: '/central-tshirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg007',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    category: 'Women',
    occasion: ['casual', 'weekend'],
    // Enhanced fashion attributes
    styleTags: ['casual', 'minimalist', 'modern'],
    seasonType: 'all-season',
    formalityLevel: 2,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'cotton',
    colorTone: 'neutral',
    aesthetic: 'clean-girl',
    colorPalette: 'monochromatic-black',
    outfitRole: 'top',
    brandTier: 'budget',
    pairingCategories: ['Jeans', 'Pants', 'Skirt', 'Sneakers'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',
  },

  // CG008 - Leather Belt
  {
    sku: 'CG008',
    name: 'Leather Belt',
    brand: 'Central',
    price: 890,
    imageUrl: '/placeholder.svg',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna'],
    onlineUrl: 'https://central.co.th/product/cg008',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    category: 'Women',
    // Enhanced fashion attributes
    styleTags: ['classic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 5,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'neutral',
    aesthetic: 'quiet-luxury',
    colorPalette: 'monochromatic-brown',
    outfitRole: 'accessory',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Jeans', 'Skirt', 'Dress'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',
  },

  // SF001 - SFERA Women Blazer Suit
  {
    sku: 'SF001',
    name: 'SFERA Women Blazer Suit',
    brand: 'SFERA',
    price: 995,
    imageUrl: '/central-blazer.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-blazer-suit-grcds54525030892',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    visualDescription: "Women's black tailored blazer suit jacket, professional business attire",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Blazer',
    // Enhanced fashion attributes
    styleTags: ['corporate-chic', 'classic', 'formal'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'outerwear',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Heels'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',
  },

  // SF002 - SFERA Women Suit Pants
  {
    sku: 'SF002',
    name: 'SFERA Women Suit Pants',
    brand: 'SFERA',
    price: 1881,
    imageUrl: '/black-tailored-trousers.jpg',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-suit-pants-grcds2510220219',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    visualDescription: "Women's black tailored suit trousers, formal office wear",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Pants',
    // Enhanced fashion attributes
    styleTags: ['corporate-chic', 'classic', 'formal'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blazer', 'Blouse', 'Shirt', 'Heels', 'Pumps'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',
  },

  // LO001 - SFERA White Blouse
  {
    sku: 'LO001',
    name: 'SFERA White Blouse',
    brand: 'SFERA',
    price: 1431,
    imageUrl: '/white-button-shirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-blouse-long-sleeves-schiffli-viscose-grcds2509250051',
    sizes: ['S', 'M', 'L'],
    colors: ['White'],
    visualDescription: "Women's white long-sleeve blouse with textured details, smart casual",
    occasion: ['work', 'casual'],
    category: 'Women',
    subCategory: 'Blouse',
    // Enhanced fashion attributes
    styleTags: ['elegant', 'classic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'blend',
    colorTone: 'cool',
    aesthetic: 'clean-girl',
    colorPalette: 'monochromatic-beige',
    outfitRole: 'top',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blazer', 'Jeans'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',
  },

  // SF003 - SFERA Printed Midi Skirt
  {
    sku: 'SF003',
    name: 'SFERA Printed Midi Skirt',
    brand: 'SFERA',
    price: 945,
    imageUrl: '/sfera-midi-skirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-skirt-printed-midi-dark-brown-grcds54525030503',
    sizes: ['S', 'M', 'L'],
    colors: ['Dark Brown'],
    visualDescription: "Women's dark brown printed midi skirt, pleated flowy style, business casual",
    occasion: ['work', 'casual'],
    category: 'Women',
    subCategory: 'Skirt',
    // Enhanced fashion attributes
    styleTags: ['elegant', 'classic', 'bohemian'],
    seasonType: 'cool-season',
    formalityLevel: 5,
    fitType: 'regular',
    patternType: 'print',
    materialType: 'polyester',
    colorTone: 'warm',
    aesthetic: 'quiet-luxury',
    colorPalette: 'monochromatic-brown',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blouse', 'Shirt', 'Blazer', 'Flats', 'Heels'],
    layeringStyle: 'relaxed',
    silhouetteType: 'wide-leg',
  },

  // SF004 - SFERA Navy Button Dress
  {
    sku: 'SF004',
    name: 'SFERA Navy Button Dress',
    brand: 'SFERA',
    price: 3290,
    imageUrl: '/sfera-navy-dress.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/sfera',
    sizes: ['S', 'M', 'L'],
    colors: ['Navy Blue'],
    visualDescription: "Women's navy blue structural sleeveless dress with gold buttons, professional look",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Dress',
    // Enhanced fashion attributes
    styleTags: ['corporate-chic', 'elegant', 'classic'],
    seasonType: 'all-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'cool',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-blue',
    outfitRole: 'dress',
    brandTier: 'mid-range',
    pairingCategories: ['Heels', 'Pumps', 'Blazer', 'Belt', 'Bag'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',
  },

  // SH001 - Formal Heels
  {
    sku: 'SH001',
    name: 'Formal Heels',
    brand: 'SFERA',
    price: 2030,
    imageUrl: '/placeholder.svg?height=400&width=400&text=Formal+Heels',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/shoes',
    sizes: ['36', '37', '38'],
    colors: ['Black'],
    category: 'Women',
    subCategory: 'Heels',
    visualDescription: 'Elegant black stiletto heels with pointed toe, formal women\'s footwear, 3-inch heel',
    occasion: ['work', 'formal'],
    // Enhanced fashion attributes
    styleTags: ['elegant', 'formal', 'classic'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'slim',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'footwear',
    brandTier: 'mid-range',
    pairingCategories: ['Dress', 'Pants', 'Skirt', 'Blazer'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',
  },

  // SH002 - Classic Pumps
  {
    sku: 'SH002',
    name: 'Classic Pumps',
    brand: 'LOLITA',
    price: 2090,
    imageUrl: '/placeholder.svg?height=400&width=400&text=Classic+Pumps',
    availability: 'in_stock',
    storeLocations: ['Central Chidlom'],
    onlineUrl: 'https://central.co.th/shoes',
    sizes: ['36', '37', '38'],
    colors: ['Nude'],
    category: 'Women',
    subCategory: 'Pumps',
    visualDescription: 'Classic nude pumps with rounded toe, versatile women\'s footwear, 2.5-inch heel',
    occasion: ['work', 'formal', 'casual'],
    // Enhanced fashion attributes
    styleTags: ['classic', 'elegant', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'warm',
    aesthetic: 'quiet-luxury',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'footwear',
    brandTier: 'mid-range',
    pairingCategories: ['Dress', 'Pants', 'Skirt', 'Jeans', 'Blazer'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',
  },
]
