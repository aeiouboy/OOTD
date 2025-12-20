/**
 * Prompt Builder for Knowledge-Enhanced Prompts
 *
 * Formats retrieved documents for prompt injection,
 * manages token limits, and orders by relevance.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import { RAG_CONFIG, getRAGConfig, getCategoryConfig } from './config';
import type {
  KnowledgeDocument,
  KnowledgeCategory,
  RetrievalResult,
  FormattedContext,
} from './types';

/**
 * Simple token estimation (4 chars ~ 1 token for English, 2 chars ~ 1 token for Thai)
 */
function estimateTokens(text: string): number {
  const thaiPattern = /[\u0E00-\u0E7F]/g;
  const thaiMatches = text.match(thaiPattern);
  const thaiCharCount = thaiMatches ? thaiMatches.length : 0;
  const nonThaiCharCount = text.length - thaiCharCount;
  return Math.ceil(thaiCharCount / 2 + nonThaiCharCount / 4);
}

/**
 * Category display names and icons
 */
const CATEGORY_DISPLAY: Record<KnowledgeCategory, { name: string; icon: string }> = {
  styling_rules: { name: 'Styling Rules', icon: '👗' },
  color_theory: { name: 'Color Theory', icon: '🎨' },
  body_types: { name: 'Body Types', icon: '💪' },
  occasions: { name: 'Occasions', icon: '🎭' },
  thai_culture: { name: 'Thai Culture', icon: '🇹🇭' },
  brand_intelligence: { name: 'Brand Intelligence', icon: '🏬' },
  seasonal_trends: { name: 'Seasonal Trends', icon: '🌡️' },
};

/**
 * Format a single document for prompt injection
 *
 * @param document - Knowledge document
 * @param score - Similarity score
 * @param includeMetadata - Whether to include metadata hints
 * @returns Formatted document string
 */
function formatDocument(
  document: KnowledgeDocument,
  score: number,
  includeMetadata: boolean = true
): string {
  const categoryInfo = CATEGORY_DISPLAY[document.category];
  const lines: string[] = [];

  // Header with category
  lines.push(`### ${categoryInfo.icon} ${document.title}`);

  // Content
  lines.push(document.content);

  // Metadata hints (optional)
  if (includeMetadata) {
    const hints: string[] = [];

    if (document.metadata.topics.length > 0) {
      hints.push(`Topics: ${document.metadata.topics.slice(0, 3).join(', ')}`);
    }

    if (document.metadata.occasions && document.metadata.occasions.length > 0) {
      hints.push(`Occasions: ${document.metadata.occasions.join(', ')}`);
    }

    if (document.metadata.gender && document.metadata.gender.length > 0) {
      hints.push(`For: ${document.metadata.gender.join(', ')}`);
    }

    if (hints.length > 0) {
      lines.push(`_[${hints.join(' | ')}]_`);
    }
  }

  return lines.join('\n');
}

/**
 * Format multiple documents as context for prompt injection
 *
 * @param documents - Array of knowledge documents
 * @param scores - Similarity scores for each document
 * @param maxTokens - Maximum tokens for context
 * @param includeMetadata - Whether to include metadata hints
 * @returns Formatted context object
 */
export function formatDocumentsAsContext(
  documents: KnowledgeDocument[],
  scores: number[],
  maxTokens: number = RAG_CONFIG.retrieval.maxContextTokens,
  includeMetadata: boolean = true
): FormattedContext {
  const config = getRAGConfig();
  const formattedDocs: string[] = [];
  const sourceIds: string[] = [];
  const categoriesSet = new Set<KnowledgeCategory>();
  let totalTokens = 0;

  // Sort by score (should already be sorted, but ensure)
  const sortedIndices = documents
    .map((_, index) => index)
    .sort((a, b) => scores[b] - scores[a]);

  for (const index of sortedIndices) {
    const document = documents[index];
    const score = scores[index];

    // Apply priority boost if configured
    const categoryConfig = getCategoryConfig(document.category);
    const priorityBoost = document.metadata.priority || categoryConfig?.priority || 1.0;
    const adjustedScore = score * priorityBoost;

    const formattedDoc = formatDocument(document, adjustedScore, includeMetadata);
    const docTokens = estimateTokens(formattedDoc);

    // Check if adding this document would exceed token limit
    if (totalTokens + docTokens > maxTokens) {
      // Try to fit a truncated version
      const remainingTokens = maxTokens - totalTokens;
      if (remainingTokens > 100) {
        // Truncate content to fit
        const truncatedContent = truncateToTokens(document.content, remainingTokens - 50);
        const truncatedDoc = `### ${CATEGORY_DISPLAY[document.category].icon} ${document.title}\n${truncatedContent}...\n_[truncated]_`;
        formattedDocs.push(truncatedDoc);
        sourceIds.push(document.id);
        categoriesSet.add(document.category);
        totalTokens += estimateTokens(truncatedDoc);
      }
      break;
    }

    formattedDocs.push(formattedDoc);
    sourceIds.push(document.id);
    categoriesSet.add(document.category);
    totalTokens += docTokens;
  }

  // Build context string
  const contextParts: string[] = [];

  contextParts.push('=== FASHION KNOWLEDGE CONTEXT ===');
  contextParts.push(`Retrieved ${formattedDocs.length} relevant knowledge snippets:\n`);

  // Group by category for better organization
  const byCategory = new Map<KnowledgeCategory, string[]>();
  formattedDocs.forEach((doc, i) => {
    const category = documents[sortedIndices[i]]?.category || 'styling_rules';
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(doc);
  });

  byCategory.forEach((docs, category) => {
    const categoryInfo = CATEGORY_DISPLAY[category];
    contextParts.push(`\n## ${categoryInfo.icon} ${categoryInfo.name}\n`);
    contextParts.push(docs.join('\n\n---\n\n'));
  });

  contextParts.push('\n=== END FASHION KNOWLEDGE ===');

  return {
    context: contextParts.join('\n'),
    tokenCount: totalTokens,
    sourceIds,
    categories: Array.from(categoriesSet),
  };
}

/**
 * Truncate text to approximate token count
 */
function truncateToTokens(text: string, maxTokens: number): string {
  const sentences = text.split(/[.!?។]+/).filter((s) => s.trim().length > 0);
  let result = '';
  let tokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);
    if (tokens + sentenceTokens > maxTokens) {
      break;
    }
    result += sentence + '. ';
    tokens += sentenceTokens;
  }

  return result.trim();
}

/**
 * Build a knowledge-enhanced system prompt
 *
 * @param basePrompt - Original system prompt
 * @param retrievalResult - RAG retrieval results
 * @param options - Formatting options
 * @returns Enhanced system prompt
 */
export function buildEnhancedPrompt(
  basePrompt: string,
  retrievalResult: RetrievalResult,
  options: {
    maxTokens?: number;
    position?: 'before' | 'after' | 'inline';
    includeMetadata?: boolean;
  } = {}
): string {
  const config = getRAGConfig();
  const {
    maxTokens = config.retrieval.maxContextTokens,
    position = 'after',
    includeMetadata = true,
  } = options;

  // Format retrieved documents
  const formattedContext = formatDocumentsAsContext(
    retrievalResult.documents,
    retrievalResult.scores,
    maxTokens,
    includeMetadata
  );

  // If no documents retrieved, return base prompt
  if (retrievalResult.documents.length === 0) {
    return basePrompt;
  }

  // Build enhanced prompt based on position
  let enhancedPrompt: string;

  switch (position) {
    case 'before':
      enhancedPrompt = `${formattedContext.context}\n\n${basePrompt}`;
      break;

    case 'inline':
      // Try to inject after first paragraph
      const firstBreak = basePrompt.indexOf('\n\n');
      if (firstBreak > 0) {
        enhancedPrompt =
          basePrompt.slice(0, firstBreak) +
          '\n\n' +
          formattedContext.context +
          '\n\n' +
          basePrompt.slice(firstBreak + 2);
      } else {
        enhancedPrompt = `${basePrompt}\n\n${formattedContext.context}`;
      }
      break;

    case 'after':
    default:
      enhancedPrompt = `${basePrompt}\n\n${formattedContext.context}`;
      break;
  }

  return enhancedPrompt;
}

/**
 * Build context specifically for fashion queries
 *
 * @param retrievalResult - RAG retrieval results
 * @param userQuery - Original user query
 * @returns Fashion-specific context string
 */
export function buildFashionContext(
  retrievalResult: RetrievalResult,
  userQuery: string
): string {
  const config = getRAGConfig();

  if (retrievalResult.documents.length === 0) {
    return '';
  }

  const formattedContext = formatDocumentsAsContext(
    retrievalResult.documents,
    retrievalResult.scores,
    config.retrieval.maxContextTokens,
    true
  );

  // Add query-specific instructions
  const instructions: string[] = [];

  // Check if query is about Thai culture
  if (retrievalResult.metadata.appliedFilters.category === 'thai_culture') {
    instructions.push('- Pay special attention to Thai cultural context and etiquette');
  }

  // Check if query is occasion-specific
  if (retrievalResult.metadata.appliedFilters.occasion) {
    instructions.push(
      `- Focus on ${retrievalResult.metadata.appliedFilters.occasion} dress code requirements`
    );
  }

  // Check if query is gender-specific
  if (retrievalResult.metadata.appliedFilters.gender) {
    instructions.push(
      `- Tailor recommendations for ${retrievalResult.metadata.appliedFilters.gender}`
    );
  }

  let contextWithInstructions = formattedContext.context;

  if (instructions.length > 0) {
    contextWithInstructions += `\n\n**Context-Specific Guidelines:**\n${instructions.join('\n')}`;
  }

  return contextWithInstructions;
}

/**
 * Create a minimal context summary for token-constrained scenarios
 *
 * @param retrievalResult - RAG retrieval results
 * @param maxTokens - Maximum tokens for summary
 * @returns Condensed context string
 */
export function buildMinimalContext(
  retrievalResult: RetrievalResult,
  maxTokens: number = 500
): string {
  if (retrievalResult.documents.length === 0) {
    return '';
  }

  const summaryLines: string[] = ['[RELEVANT FASHION KNOWLEDGE]'];

  let tokens = estimateTokens(summaryLines[0]);

  for (let i = 0; i < retrievalResult.documents.length; i++) {
    const doc = retrievalResult.documents[i];
    const categoryInfo = CATEGORY_DISPLAY[doc.category];

    // Create a one-line summary
    const summary = `${categoryInfo.icon} ${doc.title}: ${doc.content.split('.')[0]}.`;
    const summaryTokens = estimateTokens(summary);

    if (tokens + summaryTokens > maxTokens) {
      break;
    }

    summaryLines.push(summary);
    tokens += summaryTokens;
  }

  return summaryLines.join('\n');
}

/**
 * Format context for conversational follow-up
 *
 * @param retrievalResult - RAG retrieval results
 * @param previousContext - Previous conversation context
 * @returns Context optimized for follow-up questions
 */
export function buildFollowUpContext(
  retrievalResult: RetrievalResult,
  previousContext?: string
): string {
  const newContext = formatDocumentsAsContext(
    retrievalResult.documents,
    retrievalResult.scores,
    800, // Smaller for follow-ups
    false // No metadata in follow-ups
  );

  if (previousContext) {
    return `[ADDITIONAL CONTEXT]\n${newContext.context}\n\n[PREVIOUS CONTEXT SUMMARY]\n${truncateToTokens(previousContext, 300)}`;
  }

  return newContext.context;
}

/**
 * Get statistics about formatted context
 *
 * @param context - Formatted context string
 * @returns Context statistics
 */
export function getContextStats(context: string): {
  tokenCount: number;
  characterCount: number;
  lineCount: number;
} {
  return {
    tokenCount: estimateTokens(context),
    characterCount: context.length,
    lineCount: context.split('\n').length,
  };
}

export default {
  formatDocumentsAsContext,
  buildEnhancedPrompt,
  buildFashionContext,
  buildMinimalContext,
  buildFollowUpContext,
  getContextStats,
};
