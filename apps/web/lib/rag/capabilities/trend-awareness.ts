/**
 * Trend Awareness Capability
 *
 * Provides high-level trend awareness functions for the Fashion Expert Agent.
 * Leverages RAG retrieval to get current fashion trends with automatic
 * Thai season detection and occasion-specific trend information.
 *
 * Thai Seasons:
 * - Hot Season: March - May (months 3, 4, 5)
 * - Rainy Season: June - October (months 6, 7, 8, 9, 10)
 * - Cool Season: November - February (months 11, 12, 1, 2)
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import type {
  KnowledgeDocument,
  ThaiSeason,
} from '../types';
import {
  retrieve,
  retrieveByCategory,
} from '../retrieval';

/**
 * Result of current trends retrieval
 */
export interface TrendResult {
  /** Current trend descriptions */
  trends: string[];
  /** Detected or specified Thai season */
  season: ThaiSeason;
  /** Human-readable season name */
  seasonName: string;
  /** Source knowledge documents */
  documents: KnowledgeDocument[];
  /** ISO date of most recent document update */
  lastUpdated: string;
}

/**
 * Result of occasion-specific trend retrieval
 */
export interface OccasionTrendResult {
  /** The occasion queried */
  occasion: string;
  /** Trending items/styles for this occasion */
  trends: string[];
  /** Seasonal adjustments for current Thai season */
  seasonalAdjustments: string[];
  /** Source knowledge documents */
  documents: KnowledgeDocument[];
}

/**
 * Thai season month mappings
 */
const THAI_SEASON_MONTHS: Record<ThaiSeason, number[]> = {
  hot: [3, 4, 5],
  rainy: [6, 7, 8, 9, 10],
  cool: [11, 12, 1, 2],
  all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

/**
 * Human-readable season names
 */
const SEASON_NAMES: Record<ThaiSeason, string> = {
  hot: 'Hot Season (Mar-May)',
  rainy: 'Rainy Season (Jun-Oct)',
  cool: 'Cool Season (Nov-Feb)',
  all: 'All Seasons',
};

/**
 * Thai season names in Thai language
 */
const SEASON_NAMES_THAI: Record<ThaiSeason, string> = {
  hot: 'ฤดูร้อน (มี.ค.-พ.ค.)',
  rainy: 'ฤดูฝน (มิ.ย.-ต.ค.)',
  cool: 'ฤดูหนาว (พ.ย.-ก.พ.)',
  all: 'ทุกฤดูกาล',
};

/**
 * Detect the current Thai season based on the current date
 *
 * @returns The current Thai season
 *
 * @example
 * ```typescript
 * const season = detectCurrentThaiSeason();
 * console.log(season); // 'cool' (if called in December)
 * ```
 */
export function detectCurrentThaiSeason(): ThaiSeason {
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11

  if (THAI_SEASON_MONTHS.hot.includes(currentMonth)) {
    return 'hot';
  } else if (THAI_SEASON_MONTHS.rainy.includes(currentMonth)) {
    return 'rainy';
  } else {
    return 'cool';
  }
}

/**
 * Get human-readable season name
 *
 * @param season - Thai season
 * @param includeThai - Whether to include Thai translation
 * @returns Human-readable season name
 */
export function getSeasonName(season: ThaiSeason, includeThai: boolean = false): string {
  const englishName = SEASON_NAMES[season];
  if (includeThai) {
    return `${englishName} / ${SEASON_NAMES_THAI[season]}`;
  }
  return englishName;
}

/**
 * Extract trend descriptions from document content
 *
 * @param documents - Knowledge documents to extract from
 * @returns Array of trend descriptions
 */
function extractTrends(documents: KnowledgeDocument[]): string[] {
  const trends: string[] = [];

  for (const doc of documents) {
    // Split content into sentences
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 15);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Look for trend-related patterns
      if (
        trimmed.match(/\b(trending|popular|in style|fashionable|hot right now)\b/i) ||
        trimmed.match(/\b(this season|current|latest|modern|contemporary)\b/i) ||
        trimmed.match(/\b(must-have|essential|key piece|statement)\b/i)
      ) {
        trends.push(trimmed);
      }
    }
  }

  // Deduplicate and limit
  return [...new Set(trends)].slice(0, 12);
}

/**
 * Extract seasonal adjustments from document content
 *
 * @param documents - Knowledge documents to extract from
 * @param season - Current Thai season
 * @returns Array of seasonal adjustment tips
 */
function extractSeasonalAdjustments(
  documents: KnowledgeDocument[],
  season: ThaiSeason
): string[] {
  const adjustments: string[] = [];

  // Season-specific keywords
  const seasonKeywords: Record<ThaiSeason, string[]> = {
    hot: ['breathable', 'lightweight', 'cotton', 'linen', 'loose', 'cooling', 'light colors'],
    rainy: ['waterproof', 'quick-dry', 'umbrella', 'rain', 'layering', 'covered shoes'],
    cool: ['layering', 'warm', 'cardigan', 'jacket', 'sweater', 'cozy'],
    all: [],
  };

  const keywords = seasonKeywords[season];

  for (const doc of documents) {
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 15);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      const lowerSentence = trimmed.toLowerCase();

      // Check for season-specific keywords
      if (keywords.some((kw) => lowerSentence.includes(kw))) {
        adjustments.push(trimmed);
      }

      // Check for general seasonal adjustment patterns
      if (
        trimmed.match(/\b(weather|temperature|climate|humid|heat|rain)\b/i) ||
        trimmed.match(/\b(adapt|adjust|modify|consider)\b/i)
      ) {
        adjustments.push(trimmed);
      }
    }
  }

  // Deduplicate and limit
  return [...new Set(adjustments)].slice(0, 6);
}

/**
 * Get the most recent update date from documents
 *
 * @param documents - Knowledge documents
 * @returns ISO date string of most recent update
 */
function getMostRecentUpdate(documents: KnowledgeDocument[]): string {
  if (documents.length === 0) {
    return new Date().toISOString();
  }

  const dates = documents
    .map((doc) => doc.metadata.lastUpdated)
    .filter((date) => date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return dates[0] || new Date().toISOString();
}

/**
 * Get current fashion trends for a specific or auto-detected Thai season
 *
 * Retrieves trending fashion information from the knowledge base,
 * filtered by the specified or automatically detected Thai season.
 *
 * @param season - Optional Thai season (auto-detected if not provided)
 * @returns Promise resolving to current trends
 *
 * @example
 * ```typescript
 * // Auto-detect current season
 * const trends = await getCurrentTrends();
 * console.log(trends.season); // 'cool'
 * console.log(trends.seasonName); // 'Cool Season (Nov-Feb)'
 *
 * // Specify a season
 * const hotTrends = await getCurrentTrends('hot');
 * ```
 */
export async function getCurrentTrends(season?: ThaiSeason): Promise<TrendResult> {
  // Auto-detect season if not provided
  const targetSeason = season || detectCurrentThaiSeason();
  const seasonName = getSeasonName(targetSeason);

  console.log(`[TrendAwareness] Getting trends for ${seasonName}`);

  // Build query for seasonal trends
  const query = `current fashion trends ${targetSeason} season Thailand`;

  // Retrieve from seasonal_trends category with season filter
  const result = await retrieveByCategory(query, 'seasonal_trends', {
    topK: 8,
    threshold: 0.5,
  });

  // If we got results, filter by season metadata
  let relevantDocs = result.documents;
  if (targetSeason !== 'all') {
    relevantDocs = result.documents.filter((doc) => {
      const seasonality = doc.metadata.seasonality || ['all'];
      return seasonality.includes(targetSeason) || seasonality.includes('all');
    });

    // If filtering removed all docs, use original results
    if (relevantDocs.length === 0) {
      relevantDocs = result.documents;
    }
  }

  // Extract trends
  const trends = extractTrends(relevantDocs);

  // Get most recent update
  const lastUpdated = getMostRecentUpdate(relevantDocs);

  console.log(
    `[TrendAwareness] Found ${trends.length} trends for ${seasonName} (${relevantDocs.length} documents)`
  );

  return {
    trends,
    season: targetSeason,
    seasonName,
    documents: relevantDocs,
    lastUpdated,
  };
}

/**
 * Get trending items and styles for a specific occasion
 *
 * Retrieves fashion trends tailored to a specific occasion,
 * with seasonal adjustments for the current Thai climate.
 *
 * @param occasion - The occasion to get trends for (e.g., 'wedding', 'work', 'party')
 * @returns Promise resolving to occasion-specific trends
 *
 * @example
 * ```typescript
 * const trends = await getTrendingForOccasion('wedding');
 * console.log(trends.trends); // ['Pastel colors are trending...', ...]
 * console.log(trends.seasonalAdjustments); // ['Opt for lightweight fabrics...']
 * ```
 */
export async function getTrendingForOccasion(
  occasion: string
): Promise<OccasionTrendResult> {
  const currentSeason = detectCurrentThaiSeason();

  console.log(
    `[TrendAwareness] Getting trends for occasion: ${occasion} (season: ${currentSeason})`
  );

  // Build query combining occasion and trends
  const query = `${occasion} fashion trends current style ${currentSeason} season`;

  // Retrieve with combined filters
  const result = await retrieve(query, {
    topK: 10,
    threshold: 0.5,
    filters: {
      occasion: occasion,
    },
  });

  // Also get seasonal trends for adjustments
  const seasonalResult = await retrieveByCategory(
    `${currentSeason} season fashion tips Thailand weather`,
    'seasonal_trends',
    { topK: 4, threshold: 0.5 }
  );

  // Combine documents
  const documentMap = new Map<string, KnowledgeDocument>();
  for (const doc of [...result.documents, ...seasonalResult.documents]) {
    if (!documentMap.has(doc.id)) {
      documentMap.set(doc.id, doc);
    }
  }
  const allDocuments = Array.from(documentMap.values());

  // Extract trends from occasion-focused results
  const trends = extractTrends(result.documents);

  // Extract seasonal adjustments
  const seasonalAdjustments = extractSeasonalAdjustments(
    seasonalResult.documents,
    currentSeason
  );

  console.log(
    `[TrendAwareness] Found ${trends.length} trends, ${seasonalAdjustments.length} seasonal adjustments for ${occasion}`
  );

  return {
    occasion,
    trends,
    seasonalAdjustments,
    documents: allDocuments,
  };
}

export default {
  detectCurrentThaiSeason,
  getSeasonName,
  getCurrentTrends,
  getTrendingForOccasion,
};
