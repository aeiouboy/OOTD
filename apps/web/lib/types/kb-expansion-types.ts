/**
 * KB Expansion Types
 * Consolidated type definitions for KB expansion attributes
 *
 * chore-kb002: Server loader KB support
 */

import type { ThaiClimateContext } from './thai-context-types'
import type {
  VisualMatchingAttributes,
  CrossProductCompatibility,
  PriceIntelligence,
  SocialProofSignals,
} from './ai-matching-types'

/**
 * Product version indicator
 * - v0: Legacy 9-attribute format (product_master.json)
 * - v1: KB-enriched 63-attribute format (product_master_v1.json)
 */
export type ProductVersion = 'v0' | 'v1'

/**
 * Complete KB Expansion Attributes (54 sub-attributes across 5 groups)
 */
export interface KBExpansionAttributes {
  thaiContext: ThaiClimateContext
  visualMatching: VisualMatchingAttributes
  crossProductCompatibility: CrossProductCompatibility
  priceIntelligence: PriceIntelligence
  socialProof: SocialProofSignals
}

/**
 * Legacy product master item (v0 format - 9 attributes)
 */
export interface ProductMasterV0Item {
  category: string
  price: string
  original_price: string
  brand: string
  product_name: string
  link: string
  image_url: string
  availability: string
  product_description: string
}

/**
 * KB-enriched product master item (v1 format - 9 base + 5 KB groups)
 */
export interface ProductMasterV1Item extends ProductMasterV0Item {
  thaiContext?: ThaiClimateContext
  visualMatching?: VisualMatchingAttributes
  crossProductCompatibility?: CrossProductCompatibility
  priceIntelligence?: PriceIntelligence
  socialProof?: SocialProofSignals
}

/**
 * Union type for both versions
 */
export type ProductMasterItem = ProductMasterV0Item | ProductMasterV1Item

/**
 * Type guard to check if product is v1 format
 */
export function isProductV1(item: ProductMasterItem): item is ProductMasterV1Item {
  const v1Item = item as ProductMasterV1Item
  return !!(
    v1Item.thaiContext ||
    v1Item.visualMatching ||
    v1Item.crossProductCompatibility ||
    v1Item.priceIntelligence ||
    v1Item.socialProof
  )
}

/**
 * Detect product version from item
 */
export function detectProductVersion(item: ProductMasterItem): ProductVersion {
  return isProductV1(item) ? 'v1' : 'v0'
}

/**
 * Partial KB attributes (for gradual enrichment)
 */
export interface PartialKBAttributes {
  thaiContext?: Partial<ThaiClimateContext>
  visualMatching?: Partial<VisualMatchingAttributes>
  crossProductCompatibility?: Partial<CrossProductCompatibility>
  priceIntelligence?: Partial<PriceIntelligence>
  socialProof?: Partial<SocialProofSignals>
}
