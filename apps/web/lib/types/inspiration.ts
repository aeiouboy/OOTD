
import type { Product } from '../types';

export interface IdealItem {
    id: string;
    role: 'top' | 'bottom' | 'shoes' | 'dress' | 'outerwear' | 'accessory';
    type: string; // e.g. "silk blouse"
    color: string; // e.g. "cream"
    material?: string;
    silhouette?: string;
    vibes?: string[]; // "flowy", "structured"
    searchQueries?: string[]; // Fallback queries for the search engine
}

export interface IdealLook {
    id: string;
    title: string;
    source: 'pinterest' | 'instagram' | 'web' | 'ai-generated';
    sourceUrl?: string; // Pinterest link
    inspirationImageUrl: string; // The "flat-lay" or inspiration image
    aesthetic: string; // "quiet-luxury"
    description: string;
    occasion: string; // "work", "casual", etc.
    items: IdealItem[];
    colorPalette: string;
    createdAt: string;
}

export interface ProductMatch {
    idealItem: IdealItem;
    product: Product | null;
    matchScore: number;
    matchReason?: string;
    alternatives?: Product[];
}

export interface MappedOutfit {
    id: string;
    idealLook: IdealLook;
    matches: ProductMatch[];
    totalMatchScore: number;
    finalOutfitImage?: string; // If we generate a composite
}
