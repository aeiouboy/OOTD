# Chore: Phase 4 Agent Capabilities for Fashion Expert RAG

## Metadata
adw_id: `p4agtcap`
prompt: `Create Phase 4 Agent Capabilities for the Fashion Expert RAG system. Create three new files in frontend/lib/rag/capabilities/: 1) style-analyzer.ts - Implement analyzeStyle(description: string) to analyze style from user description using RAG retrieval for styling_rules and body_types categories; getStyleRecommendations(userProfile: UserProfile) to get personalized recommendations based on user profile with color_theory and occasions retrieval; matchStylingRules(bodyType: string, occasion: string) to retrieve matching styling rules from body_types and occasions categories. 2) trend-awareness.ts - Implement getCurrentTrends(season?: string) to get current seasonal trends using seasonal_trends category with auto-detection of Thai season (hot: Mar-May, rainy: Jun-Oct, cool: Nov-Feb); getTrendingForOccasion(occasion: string) to find trending items for specific occasions. 3) index.ts - Export all capability functions and create unified FashionExpertCapabilities interface. Also update frontend/lib/rag/index.ts to export the new capabilities module. Use existing RAG types (UserProfile from chat-types.ts, KnowledgeDocument, RetrievalResult from rag/types.ts) and retrieval functions (retrieve, retrieveByCategory, retrieveForOccasion from rag/retrieval.ts). Follow established patterns in the codebase.`

## Chore Description
Create a new capabilities module for the Fashion Expert RAG system that provides high-level agent capabilities for style analysis and trend awareness. This module will leverage the existing RAG retrieval infrastructure to provide specialized fashion intelligence functions.

The capabilities include:
1. **Style Analyzer** - Functions to analyze user style preferences and match styling rules based on body type and occasion
2. **Trend Awareness** - Functions to retrieve current fashion trends with automatic Thai season detection

These capabilities will be used by the AI chat service to provide more intelligent and contextual fashion recommendations.

## Relevant Files
Use these files to complete the chore:

- `frontend/lib/rag/types.ts` - Contains KnowledgeDocument, RetrievalResult, KnowledgeCategory, ThaiSeason types needed for capability function signatures
- `frontend/lib/rag/retrieval.ts` - Contains retrieve, retrieveByCategory, retrieveForOccasion, retrieveMultiQuery functions to leverage for capability implementation
- `frontend/lib/types/chat-types.ts` - Contains UserProfile interface for personalized recommendations
- `frontend/lib/rag/index.ts` - Main RAG module export file to update with capabilities exports
- `frontend/lib/rag/config.ts` - Configuration that may be needed for retrieval options

### New Files
- `frontend/lib/rag/capabilities/style-analyzer.ts` - Style analysis capability implementation
- `frontend/lib/rag/capabilities/trend-awareness.ts` - Trend awareness capability implementation
- `frontend/lib/rag/capabilities/index.ts` - Capabilities module exports and unified interface

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create capabilities directory structure
- Create the `frontend/lib/rag/capabilities/` directory if it doesn't exist

### 2. Implement style-analyzer.ts
- Create `frontend/lib/rag/capabilities/style-analyzer.ts`
- Import required types: `KnowledgeDocument`, `RetrievalResult`, `KnowledgeCategory` from `../types`
- Import `UserProfile` from `../../types/chat-types`
- Import retrieval functions: `retrieve`, `retrieveByCategory`, `retrieveMultiQuery` from `../retrieval`
- Implement `StyleAnalysisResult` interface containing:
  - `styleTraits: string[]` - Detected style traits
  - `recommendations: string[]` - Style recommendations
  - `matchedCategories: KnowledgeCategory[]` - Categories that matched
  - `documents: KnowledgeDocument[]` - Retrieved documents
  - `confidence: number` - Confidence score 0-1
- Implement `analyzeStyle(description: string): Promise<StyleAnalysisResult>`:
  - Use `retrieveMultiQuery` with queries for styling_rules and body_types categories
  - Extract style traits from retrieved documents
  - Calculate confidence based on retrieval scores
- Implement `StyleRecommendationResult` interface containing:
  - `recommendations: string[]` - Personalized recommendations
  - `basedOn: { profile: UserProfile; documents: KnowledgeDocument[] }` - Context
- Implement `getStyleRecommendations(userProfile: UserProfile): Promise<StyleRecommendationResult>`:
  - Build query from userProfile fields (bodyType, stylePreferences, colorPreferences)
  - Use `retrieveByCategory` for color_theory and occasions categories
  - Filter results based on user's budgetTier if provided
  - Return personalized recommendations
- Implement `StylingRulesResult` interface containing:
  - `rules: string[]` - Matched styling rules
  - `bodyTypeAdvice: string[]` - Body-type specific advice
  - `occasionTips: string[]` - Occasion-specific tips
  - `documents: KnowledgeDocument[]` - Source documents
- Implement `matchStylingRules(bodyType: string, occasion: string): Promise<StylingRulesResult>`:
  - Use `retrieveByCategory` for body_types with bodyType filter
  - Use `retrieveForOccasion` with occasion filter
  - Combine and deduplicate results
  - Extract rules, advice, and tips from document content
- Add proper JSDoc documentation with @version 1.0.0 and @lastUpdated date
- Add console logging with `[StyleAnalyzer]` prefix for debugging

### 3. Implement trend-awareness.ts
- Create `frontend/lib/rag/capabilities/trend-awareness.ts`
- Import required types from `../types`
- Import retrieval functions from `../retrieval`
- Define `ThaiSeasonMonths` constant mapping:
  - hot: months 3, 4, 5 (March-May)
  - rainy: months 6, 7, 8, 9, 10 (June-October)
  - cool: months 11, 12, 1, 2 (November-February)
- Implement `detectCurrentThaiSeason(): ThaiSeason` helper function:
  - Get current month using `new Date().getMonth() + 1`
  - Return appropriate ThaiSeason based on month
- Implement `TrendResult` interface containing:
  - `trends: string[]` - Current trend descriptions
  - `season: ThaiSeason` - Detected or specified season
  - `seasonName: string` - Human-readable season name (e.g., "Hot Season (Mar-May)")
  - `documents: KnowledgeDocument[]` - Source documents
  - `lastUpdated: string` - ISO date of most recent document
- Implement `getCurrentTrends(season?: ThaiSeason): Promise<TrendResult>`:
  - Auto-detect season using `detectCurrentThaiSeason()` if not provided
  - Use `retrieveByCategory` for seasonal_trends category
  - Apply season filter to retrieval options
  - Extract trends from document content
  - Include season name in result
- Implement `OccasionTrendResult` interface containing:
  - `occasion: string` - The occasion queried
  - `trends: string[]` - Trending items/styles for this occasion
  - `seasonalAdjustments: string[]` - Adjustments for current season
  - `documents: KnowledgeDocument[]` - Source documents
- Implement `getTrendingForOccasion(occasion: string): Promise<OccasionTrendResult>`:
  - Build query combining occasion and trends keywords
  - Use `retrieve` with both occasion and seasonal_trends filters
  - Auto-detect current Thai season for seasonal adjustments
  - Return combined trend information
- Add proper JSDoc documentation with @version 1.0.0 and @lastUpdated date
- Add console logging with `[TrendAwareness]` prefix for debugging

### 4. Create capabilities index.ts
- Create `frontend/lib/rag/capabilities/index.ts`
- Add module header documentation
- Re-export all functions from `./style-analyzer`:
  - `analyzeStyle`
  - `getStyleRecommendations`
  - `matchStylingRules`
- Re-export all types from `./style-analyzer`:
  - `StyleAnalysisResult`
  - `StyleRecommendationResult`
  - `StylingRulesResult`
- Re-export all functions from `./trend-awareness`:
  - `getCurrentTrends`
  - `getTrendingForOccasion`
  - `detectCurrentThaiSeason`
- Re-export all types from `./trend-awareness`:
  - `TrendResult`
  - `OccasionTrendResult`
- Create `FashionExpertCapabilities` interface that unifies all capability functions:
  ```typescript
  export interface FashionExpertCapabilities {
    // Style Analysis
    analyzeStyle: typeof analyzeStyle;
    getStyleRecommendations: typeof getStyleRecommendations;
    matchStylingRules: typeof matchStylingRules;
    // Trend Awareness
    getCurrentTrends: typeof getCurrentTrends;
    getTrendingForOccasion: typeof getTrendingForOccasion;
  }
  ```
- Create and export `fashionExpertCapabilities` constant implementing the interface
- Add JSDoc documentation

### 5. Update frontend/lib/rag/index.ts
- Add capabilities module exports section after existing exports
- Add comment block: `// Capabilities exports (Phase 4)`
- Re-export all from capabilities:
  ```typescript
  export {
    analyzeStyle,
    getStyleRecommendations,
    matchStylingRules,
    getCurrentTrends,
    getTrendingForOccasion,
    detectCurrentThaiSeason,
    fashionExpertCapabilities,
  } from './capabilities';
  ```
- Re-export types from capabilities:
  ```typescript
  export type {
    StyleAnalysisResult,
    StyleRecommendationResult,
    StylingRulesResult,
    TrendResult,
    OccasionTrendResult,
    FashionExpertCapabilities,
  } from './capabilities';
  ```

### 6. Validate the implementation
- Run TypeScript compiler to check for type errors
- Verify all imports resolve correctly
- Ensure no circular dependencies exist
- Test that exports are accessible from `frontend/lib/rag`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && npx tsc --noEmit` - Verify TypeScript compilation passes with no errors
- `ls -la frontend/lib/rag/capabilities/` - Verify all three capability files exist
- `grep -l "analyzeStyle\|getCurrentTrends" frontend/lib/rag/index.ts` - Verify exports are added to main index

## Notes
- The ThaiSeason type already exists in `frontend/lib/rag/types.ts` with values: 'hot' | 'rainy' | 'cool' | 'all'
- UserProfile interface from chat-types.ts includes: stylePreferences, bodyType, colorPreferences, budgetTier
- The retrieval functions handle vector store initialization automatically
- Follow the existing pattern of JSDoc documentation with @version and @lastUpdated tags
- Use console.log with module prefix (e.g., `[StyleAnalyzer]`) for consistent logging
- The capabilities should be stateless functions that leverage the RAGService singleton
