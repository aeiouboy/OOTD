/**
 * Category Hierarchy Definitions
 * Hierarchical category structure (4 levels: Department > Category > Subcategory > Type)
 */

import type { LocalizedText } from '../types/localization-types'
import type { Gender, OutfitRole } from '../types/enums'

export interface CategoryNode {
  id: string
  name: LocalizedText
  level: 1 | 2 | 3 | 4
  parent?: string
  children?: string[]
  metadata?: {
    role?: OutfitRole
    gender?: Gender[]
    keywords?: string[]
  }
}

/**
 * Category Hierarchy Tree
 */
export const CATEGORY_HIERARCHY: Record<string, CategoryNode> = {
  // LEVEL 1: Departments
  'clothing': {
    id: 'clothing',
    name: { th: 'เสื้อผ้า', en: 'Clothing' },
    level: 1,
    children: ['tops', 'bottoms', 'dresses', 'outerwear'],
  },
  'footwear': {
    id: 'footwear',
    name: { th: 'รองเท้า', en: 'Footwear' },
    level: 1,
    children: ['shoes', 'boots', 'sandals', 'sneakers'],
    metadata: { role: 'footwear' },
  },
  'accessories': {
    id: 'accessories',
    name: { th: 'เครื่องประดับและอุปกรณ์เสริม', en: 'Accessories' },
    level: 1,
    children: ['bags', 'jewelry', 'belts', 'hats'],
    metadata: { role: 'accessory' },
  },

  // LEVEL 2: Categories - Clothing
  'tops': {
    id: 'tops',
    name: { th: 'เสื้อ', en: 'Tops' },
    level: 2,
    parent: 'clothing',
    children: ['shirts', 'tshirts', 'blouses', 'sweaters', 'polos'],
    metadata: { role: 'top' },
  },
  'bottoms': {
    id: 'bottoms',
    name: { th: 'กางเกง/กระโปรง', en: 'Bottoms' },
    level: 2,
    parent: 'clothing',
    children: ['pants', 'jeans', 'skirts', 'shorts'],
    metadata: { role: 'bottom' },
  },
  'dresses': {
    id: 'dresses',
    name: { th: 'ชุดเดรส', en: 'Dresses' },
    level: 2,
    parent: 'clothing',
    children: ['casual-dresses', 'formal-dresses', 'maxi-dresses', 'midi-dresses'],
    metadata: { role: 'dress', gender: ['women'] },
  },
  'outerwear': {
    id: 'outerwear',
    name: { th: 'เสื้อนอก', en: 'Outerwear' },
    level: 2,
    parent: 'clothing',
    children: ['jackets', 'blazers', 'coats', 'cardigans'],
    metadata: { role: 'outerwear' },
  },

  // LEVEL 3: Subcategories - Tops
  'shirts': {
    id: 'shirts',
    name: { th: 'เสื้อเชิ้ต', en: 'Shirts' },
    level: 3,
    parent: 'tops',
    children: ['dress-shirts', 'casual-shirts', 'oxford-shirts'],
    metadata: { keywords: ['shirt', 'เสื้อเชิ้ต'] },
  },
  'tshirts': {
    id: 'tshirts',
    name: { th: 'เสื้อยืด', en: 'T-Shirts' },
    level: 3,
    parent: 'tops',
    children: ['basic-tees', 'graphic-tees', 'v-neck-tees'],
    metadata: { keywords: ['tshirt', 't-shirt', 'เสื้อยืด', 'tee'] },
  },
  'blouses': {
    id: 'blouses',
    name: { th: 'เสื้อบลาวส์', en: 'Blouses' },
    level: 3,
    parent: 'tops',
    metadata: { keywords: ['blouse', 'บลาวส์'], gender: ['women'] },
  },
  'sweaters': {
    id: 'sweaters',
    name: { th: 'เสื้อสเวตเตอร์', en: 'Sweaters' },
    level: 3,
    parent: 'tops',
    children: ['pullover', 'cardigan-sweaters', 'crew-neck'],
    metadata: { keywords: ['sweater', 'สเวตเตอร์', 'knit'] },
  },
  'polos': {
    id: 'polos',
    name: { th: 'เสื้อโปโล', en: 'Polo Shirts' },
    level: 3,
    parent: 'tops',
    metadata: { keywords: ['polo', 'โปโล'] },
  },

  // LEVEL 3: Subcategories - Bottoms
  'pants': {
    id: 'pants',
    name: { th: 'กางเกงขายาว', en: 'Pants' },
    level: 3,
    parent: 'bottoms',
    children: ['dress-pants', 'casual-pants', 'chinos'],
    metadata: { keywords: ['pants', 'trousers', 'กางเกง', 'สแล็ค'] },
  },
  'jeans': {
    id: 'jeans',
    name: { th: 'กางเกงยีนส์', en: 'Jeans' },
    level: 3,
    parent: 'bottoms',
    children: ['skinny-jeans', 'slim-jeans', 'regular-jeans'],
    metadata: { keywords: ['jeans', 'denim', 'ยีนส์', 'เดนิม'] },
  },
  'skirts': {
    id: 'skirts',
    name: { th: 'กระโปรง', en: 'Skirts' },
    level: 3,
    parent: 'bottoms',
    children: ['mini-skirts', 'midi-skirts', 'maxi-skirts'],
    metadata: { keywords: ['skirt', 'กระโปรง'], gender: ['women'] },
  },
  'shorts': {
    id: 'shorts',
    name: { th: 'กางเกงขาสั้น', en: 'Shorts' },
    level: 3,
    parent: 'bottoms',
    metadata: { keywords: ['shorts', 'ขาสั้น'] },
  },

  // LEVEL 3: Subcategories - Dresses
  'casual-dresses': {
    id: 'casual-dresses',
    name: { th: 'เดรสสบายๆ', en: 'Casual Dresses' },
    level: 3,
    parent: 'dresses',
    metadata: { keywords: ['casual dress', 'เดรสสบาย'] },
  },
  'formal-dresses': {
    id: 'formal-dresses',
    name: { th: 'เดรสทางการ', en: 'Formal Dresses' },
    level: 3,
    parent: 'dresses',
    metadata: { keywords: ['formal dress', 'evening dress', 'เดรสราตรี'] },
  },
  'maxi-dresses': {
    id: 'maxi-dresses',
    name: { th: 'เดรสยาว', en: 'Maxi Dresses' },
    level: 3,
    parent: 'dresses',
    metadata: { keywords: ['maxi dress', 'long dress', 'เดรสยาว'] },
  },
  'midi-dresses': {
    id: 'midi-dresses',
    name: { th: 'เดรสยาวครึ่งน่อง', en: 'Midi Dresses' },
    level: 3,
    parent: 'dresses',
    metadata: { keywords: ['midi dress', 'เดรสมิดี้'] },
  },

  // LEVEL 3: Subcategories - Outerwear
  'jackets': {
    id: 'jackets',
    name: { th: 'แจ็คเก็ต', en: 'Jackets' },
    level: 3,
    parent: 'outerwear',
    metadata: { keywords: ['jacket', 'แจ็คเก็ต'] },
  },
  'blazers': {
    id: 'blazers',
    name: { th: 'เบลเซอร์', en: 'Blazers' },
    level: 3,
    parent: 'outerwear',
    metadata: { keywords: ['blazer', 'เบลเซอร์'] },
  },
  'coats': {
    id: 'coats',
    name: { th: 'เสื้อโค้ท', en: 'Coats' },
    level: 3,
    parent: 'outerwear',
    metadata: { keywords: ['coat', 'โค้ท'] },
  },
  'cardigans': {
    id: 'cardigans',
    name: { th: 'คาร์ดิแกน', en: 'Cardigans' },
    level: 3,
    parent: 'outerwear',
    metadata: { keywords: ['cardigan', 'คาร์ดิแกน'] },
  },

  // LEVEL 2: Categories - Footwear
  'shoes': {
    id: 'shoes',
    name: { th: 'รองเท้า', en: 'Shoes' },
    level: 2,
    parent: 'footwear',
    children: ['dress-shoes', 'loafers', 'heels', 'flats'],
  },
  'boots': {
    id: 'boots',
    name: { th: 'รองเท้าบูท', en: 'Boots' },
    level: 2,
    parent: 'footwear',
    metadata: { keywords: ['boots', 'บูท'] },
  },
  'sandals': {
    id: 'sandals',
    name: { th: 'รองเท้าแตะ/รองเท้าแซนเดิล', en: 'Sandals' },
    level: 2,
    parent: 'footwear',
    metadata: { keywords: ['sandals', 'แตะ', 'แซนเดิล'] },
  },
  'sneakers': {
    id: 'sneakers',
    name: { th: 'รองเท้าผ้าใบ', en: 'Sneakers' },
    level: 2,
    parent: 'footwear',
    metadata: { keywords: ['sneakers', 'ผ้าใบ', 'trainers'] },
  },

  // LEVEL 2: Categories - Accessories
  'bags': {
    id: 'bags',
    name: { th: 'กระเป๋า', en: 'Bags' },
    level: 2,
    parent: 'accessories',
    children: ['handbags', 'backpacks', 'clutches', 'totes'],
    metadata: { role: 'bag' },
  },
  'jewelry': {
    id: 'jewelry',
    name: { th: 'เครื่องประดับ', en: 'Jewelry' },
    level: 2,
    parent: 'accessories',
    metadata: { keywords: ['jewelry', 'เครื่องประดับ'] },
  },
  'belts': {
    id: 'belts',
    name: { th: 'เข็มขัด', en: 'Belts' },
    level: 2,
    parent: 'accessories',
    metadata: { keywords: ['belt', 'เข็มขัด'] },
  },
  'hats': {
    id: 'hats',
    name: { th: 'หมวก', en: 'Hats' },
    level: 2,
    parent: 'accessories',
    metadata: { keywords: ['hat', 'cap', 'หมวก'] },
  },
}

/**
 * Get category by ID
 */
export function getCategory(id: string): CategoryNode | undefined {
  return CATEGORY_HIERARCHY[id]
}

/**
 * Get full category path
 */
export function getCategoryPath(id: string): CategoryNode[] {
  const path: CategoryNode[] = []
  let current = getCategory(id)

  while (current) {
    path.unshift(current)
    current = current.parent ? getCategory(current.parent) : undefined
  }

  return path
}

/**
 * Get category path as string
 */
export function getCategoryPathString(id: string, language: 'th' | 'en' = 'en'): string {
  const path = getCategoryPath(id)
  return path.map((cat) => cat.name[language] || cat.name.en || cat.id).join(' > ')
}

/**
 * Find category by keyword
 */
export function findCategoryByKeyword(keyword: string): CategoryNode | undefined {
  const lowerKeyword = keyword.toLowerCase()

  for (const category of Object.values(CATEGORY_HIERARCHY)) {
    const keywords = category.metadata?.keywords || []
    const nameMatches =
      category.name.th?.toLowerCase().includes(lowerKeyword) ||
      category.name.en?.toLowerCase().includes(lowerKeyword)

    const keywordMatches = keywords.some((kw) => kw.toLowerCase().includes(lowerKeyword))

    if (nameMatches || keywordMatches) {
      return category
    }
  }

  return undefined
}

/**
 * Get all categories at a specific level
 */
export function getCategoriesByLevel(level: 1 | 2 | 3 | 4): CategoryNode[] {
  return Object.values(CATEGORY_HIERARCHY).filter((cat) => cat.level === level)
}

/**
 * Get children categories
 */
export function getChildCategories(parentId: string): CategoryNode[] {
  const parent = getCategory(parentId)
  if (!parent?.children) return []

  return parent.children.map((childId) => getCategory(childId)).filter(Boolean) as CategoryNode[]
}
