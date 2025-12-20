/**
 * Style Analyzer Capability
 *
 * Provides high-level style analysis functions for the Fashion Expert Agent.
 * Leverages RAG retrieval to analyze user style preferences, provide personalized
 * recommendations, and match styling rules based on body type and occasion.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import type {
  KnowledgeDocument,
  KnowledgeCategory,
  RetrievalResult,
} from '../types';
import type { UserProfile } from '../../types/chat-types';
import {
  retrieve,
  retrieveByCategory,
  retrieveMultiQuery,
  retrieveForOccasion,
} from '../retrieval';

/**
 * Result of style analysis from user description
 */
export interface StyleAnalysisResult {
  /** Detected style traits from the description */
  styleTraits: string[];
  /** Style recommendations based on analysis */
  recommendations: string[];
  /** Knowledge categories that matched the query */
  matchedCategories: KnowledgeCategory[];
  /** Retrieved knowledge documents */
  documents: KnowledgeDocument[];
  /** Confidence score (0-1) based on retrieval quality */
  confidence: number;
}

/**
 * Result of personalized style recommendations
 */
export interface StyleRecommendationResult {
  /** Personalized recommendations for the user */
  recommendations: string[];
  /** Context showing what the recommendations are based on */
  basedOn: {
    profile: UserProfile;
    documents: KnowledgeDocument[];
  };
}

/**
 * Result of styling rules matching
 */
export interface StylingRulesResult {
  /** Matched styling rules */
  rules: string[];
  /** Body-type specific advice */
  bodyTypeAdvice: string[];
  /** Occasion-specific tips */
  occasionTips: string[];
  /** Source documents for the rules */
  documents: KnowledgeDocument[];
}

/**
 * Common style traits to detect in descriptions
 */
const STYLE_TRAIT_KEYWORDS: Record<string, string[]> = {
  minimal: ['minimal', 'minimalist', 'simple', 'clean', 'basic'],
  casual: ['casual', 'relaxed', 'comfortable', 'everyday', 'laid-back'],
  elegant: ['elegant', 'sophisticated', 'refined', 'classy', 'graceful'],
  bohemian: ['boho', 'bohemian', 'free-spirited', 'artistic', 'eclectic'],
  streetwear: ['streetwear', 'urban', 'street style', 'edgy', 'trendy'],
  classic: ['classic', 'timeless', 'traditional', 'conservative', 'preppy'],
  romantic: ['romantic', 'feminine', 'soft', 'floral', 'delicate'],
  athletic: ['athletic', 'sporty', 'active', 'athleisure', 'sporty-chic'],
};

/**
 * Extract style traits from text content
 *
 * @param content - Text to analyze for style traits
 * @returns Array of detected style traits
 */
function extractStyleTraits(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const detectedTraits: string[] = [];

  for (const [trait, keywords] of Object.entries(STYLE_TRAIT_KEYWORDS)) {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      detectedTraits.push(trait);
    }
  }

  return detectedTraits;
}

/**
 * Extract recommendations from document content
 *
 * @param documents - Knowledge documents to extract from
 * @returns Array of recommendation strings
 */
function extractRecommendations(documents: KnowledgeDocument[]): string[] {
  const recommendations: string[] = [];

  for (const doc of documents) {
    // Split content into sentences and look for recommendation patterns
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 20);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Look for recommendation-like sentences
      if (
        trimmed.match(/\b(recommend|suggest|try|opt for|choose|wear|pair|consider)\b/i) ||
        trimmed.match(/\b(works well|looks great|perfect for|ideal for|best for)\b/i)
      ) {
        recommendations.push(trimmed);
      }
    }
  }

  // Deduplicate and limit
  return [...new Set(recommendations)].slice(0, 10);
}

/**
 * Calculate confidence score based on retrieval scores
 *
 * @param scores - Array of similarity scores
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(scores: number[]): number {
  if (scores.length === 0) return 0;

  // Average of top scores, weighted toward higher scores
  const topScores = scores.slice(0, 5);
  const weightedSum = topScores.reduce((sum, score, idx) => {
    const weight = 1 / (idx + 1); // Higher weight for better matches
    return sum + score * weight;
  }, 0);

  const totalWeight = topScores.reduce((sum, _, idx) => sum + 1 / (idx + 1), 0);
  return Math.min(1, weightedSum / totalWeight);
}

/**
 * Analyze style from user description
 *
 * Uses RAG retrieval to find relevant styling knowledge and extract
 * style traits, recommendations, and matched categories.
 *
 * @param description - User's style description or query
 * @returns Promise resolving to style analysis result
 *
 * @example
 * ```typescript
 * const result = await analyzeStyle("I like minimal and clean looks for work");
 * console.log(result.styleTraits); // ['minimal', 'classic']
 * ```
 */
export async function analyzeStyle(description: string): Promise<StyleAnalysisResult> {
  console.log('[StyleAnalyzer] Analyzing style:', description.substring(0, 50) + '...');

  // Build queries for multi-category retrieval
  const queries = [
    `${description} styling rules`,
    `${description} body type fashion`,
  ];

  // Retrieve from multiple categories
  const result = await retrieveMultiQuery(queries, {
    topK: 8,
    threshold: 0.6,
  });

  // Extract style traits from description and documents
  const traitsFromDescription = extractStyleTraits(description);
  const traitsFromDocs = result.documents.flatMap((doc) =>
    extractStyleTraits(doc.content)
  );
  const allTraits = [...new Set([...traitsFromDescription, ...traitsFromDocs])];

  // Extract recommendations
  const recommendations = extractRecommendations(result.documents);

  // Get matched categories
  const matchedCategories = [
    ...new Set(result.documents.map((doc) => doc.category)),
  ];

  // Calculate confidence
  const confidence = calculateConfidence(result.scores);

  console.log(
    `[StyleAnalyzer] Found ${allTraits.length} traits, ${recommendations.length} recommendations (confidence: ${confidence.toFixed(2)})`
  );

  return {
    styleTraits: allTraits,
    recommendations,
    matchedCategories,
    documents: result.documents,
    confidence,
  };
}

/**
 * Get personalized style recommendations based on user profile
 *
 * Uses the user's profile (body type, style preferences, color preferences)
 * to retrieve and generate personalized fashion recommendations.
 *
 * @param userProfile - User's style profile
 * @returns Promise resolving to personalized recommendations
 *
 * @example
 * ```typescript
 * const result = await getStyleRecommendations({
 *   bodyType: 'hourglass',
 *   stylePreferences: ['elegant', 'minimal'],
 *   colorPreferences: ['navy', 'white'],
 * });
 * ```
 */
export async function getStyleRecommendations(
  userProfile: UserProfile
): Promise<StyleRecommendationResult> {
  console.log('[StyleAnalyzer] Getting recommendations for profile:', userProfile);

  // Build query from profile
  const queryParts: string[] = [];

  if (userProfile.bodyType) {
    queryParts.push(`${userProfile.bodyType} body type styling`);
  }

  if (userProfile.stylePreferences?.length) {
    queryParts.push(userProfile.stylePreferences.join(' ') + ' style');
  }

  if (userProfile.colorPreferences?.length) {
    queryParts.push(userProfile.colorPreferences.join(' ') + ' color combinations');
  }

  // Default query if profile is sparse
  if (queryParts.length === 0) {
    queryParts.push('general fashion styling recommendations');
  }

  const query = queryParts.join(', ');

  // Retrieve from color_theory and occasions categories
  const [colorResult, occasionResult] = await Promise.all([
    retrieveByCategory(query, 'color_theory', { topK: 4, threshold: 0.6 }),
    retrieveByCategory(query, 'occasions', { topK: 4, threshold: 0.6 }),
  ]);

  // Combine documents
  const allDocuments = [...colorResult.documents, ...occasionResult.documents];

  // Extract recommendations
  let recommendations = extractRecommendations(allDocuments);

  // Filter by budget tier if provided
  if (userProfile.budgetTier) {
    const budgetKeywords: Record<string, string[]> = {
      budget: ['affordable', 'budget', 'economical', 'value'],
      'mid-range': ['mid-range', 'moderate', 'reasonable'],
      premium: ['premium', 'quality', 'investment'],
      luxury: ['luxury', 'designer', 'high-end', 'exclusive'],
    };

    const keywords = budgetKeywords[userProfile.budgetTier] || [];
    if (keywords.length > 0) {
      const filtered = recommendations.filter((rec) =>
        keywords.some((kw) => rec.toLowerCase().includes(kw))
      );
      // Only use filtered if we have results
      if (filtered.length > 0) {
        recommendations = filtered;
      }
    }
  }

  console.log(`[StyleAnalyzer] Generated ${recommendations.length} personalized recommendations`);

  return {
    recommendations,
    basedOn: {
      profile: userProfile,
      documents: allDocuments,
    },
  };
}

/**
 * Match styling rules for body type and occasion
 *
 * Retrieves specific styling rules, advice, and tips based on
 * the user's body type and the occasion they're dressing for.
 *
 * @param bodyType - User's body type (e.g., 'hourglass', 'pear', 'apple')
 * @param occasion - The occasion (e.g., 'wedding', 'work', 'casual')
 * @returns Promise resolving to matched styling rules
 *
 * @example
 * ```typescript
 * const result = await matchStylingRules('pear', 'wedding');
 * console.log(result.bodyTypeAdvice); // ['Emphasize your waist...']
 * console.log(result.occasionTips); // ['For weddings, opt for...']
 * ```
 */
export async function matchStylingRules(
  bodyType: string,
  occasion: string
): Promise<StylingRulesResult> {
  console.log(`[StyleAnalyzer] Matching rules for body type: ${bodyType}, occasion: ${occasion}`);

  // Retrieve body type specific advice
  const bodyTypeResult = await retrieveByCategory(
    `${bodyType} body type styling tips advice`,
    'body_types',
    { topK: 5, threshold: 0.6 }
  );

  // Retrieve occasion specific tips
  const occasionResult = await retrieveForOccasion(
    `${occasion} outfit dress code tips`,
    occasion,
    { topK: 5, threshold: 0.6 }
  );

  // Combine and deduplicate documents
  const documentMap = new Map<string, KnowledgeDocument>();
  for (const doc of [...bodyTypeResult.documents, ...occasionResult.documents]) {
    if (!documentMap.has(doc.id)) {
      documentMap.set(doc.id, doc);
    }
  }
  const allDocuments = Array.from(documentMap.values());

  // Extract rules from all documents
  const rules: string[] = [];
  const bodyTypeAdvice: string[] = [];
  const occasionTips: string[] = [];

  for (const doc of bodyTypeResult.documents) {
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        trimmed.match(/\b(should|avoid|best|ideal|flattering|elongate|balance)\b/i)
      ) {
        bodyTypeAdvice.push(trimmed);
      }
    }
  }

  for (const doc of occasionResult.documents) {
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        trimmed.match(/\b(dress code|appropriate|suitable|wear|avoid|opt for)\b/i)
      ) {
        occasionTips.push(trimmed);
      }
    }
  }

  // General rules from both
  for (const doc of allDocuments) {
    const sentences = doc.content.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        trimmed.match(/\b(rule|always|never|tip|remember|key)\b/i) &&
        !bodyTypeAdvice.includes(trimmed) &&
        !occasionTips.includes(trimmed)
      ) {
        rules.push(trimmed);
      }
    }
  }

  console.log(
    `[StyleAnalyzer] Found ${rules.length} rules, ${bodyTypeAdvice.length} body advice, ${occasionTips.length} occasion tips`
  );

  return {
    rules: [...new Set(rules)].slice(0, 8),
    bodyTypeAdvice: [...new Set(bodyTypeAdvice)].slice(0, 5),
    occasionTips: [...new Set(occasionTips)].slice(0, 5),
    documents: allDocuments,
  };
}

export default {
  analyzeStyle,
  getStyleRecommendations,
  matchStylingRules,
};
