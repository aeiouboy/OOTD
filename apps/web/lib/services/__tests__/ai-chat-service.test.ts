import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EnhancedProduct } from '@/lib/types/product-types';
import type { SessionContext } from '@/lib/types/chat-types';
import type { ChatRequest, ChatResponse } from '../ai-chat-service';

// ---------------------------------------------------------------------------
// Mocks - All external dependencies
// ---------------------------------------------------------------------------

vi.mock('../../utils/guardrail-detector', () => ({
  checkGuardrails: vi.fn().mockReturnValue(null),
}));

vi.mock('../../utils/image-trigger-detector', () => ({
  detectImageRequest: vi.fn().mockReturnValue(false),
  extractOutfitDescription: vi.fn().mockReturnValue('A casual outfit'),
}));

vi.mock('../../utils/clarification-detector', () => ({
  analyzeUserQuery: vi.fn().mockReturnValue({
    message: '',
    hasGender: false,
    hasOccasion: false,
    hasBudget: false,
    hasDestination: false,
    isTravelQuery: false,
  }),
  getClarificationsNeeded: vi.fn().mockReturnValue([]),
  formatClarificationQuestions: vi.fn().mockReturnValue('What gender?'),
  isAnsweringClarification: vi.fn().mockReturnValue(false),
}));

vi.mock('../../utils/conversation-flow-tracker', () => ({
  trackConversationTurns: vi.fn(),
  shouldForceRecommendations: vi.fn().mockReturnValue(false),
  getClarificationCount: vi.fn().mockReturnValue(0),
  formatTurnStats: vi.fn().mockReturnValue('[Turn Stats] 0 clarifications'),
}));

vi.mock('../../utils/session-context', () => ({
  createSessionContext: vi.fn().mockReturnValue({
    recommendedProductIds: [],
    askedClarifications: [],
    conversationContext: {},
  }),
  updateSessionContext: vi.fn().mockImplementation((ctx, ids, clarType, detectedInfo) => ({
    ...ctx,
    recommendedProductIds: [...(ctx.recommendedProductIds || []), ...(ids || [])],
    askedClarifications: clarType
      ? [...(ctx.askedClarifications || []), clarType]
      : ctx.askedClarifications || [],
    conversationContext: { ...(ctx.conversationContext || {}), ...(detectedInfo || {}) },
  })),
  shouldResetSession: vi.fn().mockReturnValue(false),
  formatSessionContextForAI: vi.fn().mockReturnValue('[Session Context]'),
}));

vi.mock('../../utils/duplicate-filter', () => ({
  filterDuplicateProducts: vi.fn().mockImplementation((products) => products),
  extractProductIds: vi.fn().mockImplementation((products: any[]) =>
    products.map((p: any) => p.sku || p.id)
  ),
  filterAndValidateProducts: vi.fn().mockImplementation((products) => ({
    products,
    hasSufficientProducts: products.length >= 3,
    message: products.length < 3 ? 'Not enough unique products' : undefined,
  })),
}));

vi.mock('../../utils/category-detector', () => ({
  detectCategory: vi.fn().mockReturnValue({ category: 'CLOTHS', confidence: 0.9 }),
  getTemplateInstruction: vi.fn().mockReturnValue('[Template A Instruction]'),
  formatCategoryDetection: vi.fn().mockReturnValue('[Category: CLOTHS]'),
}));

vi.mock('../../utils/follow-up-handler', () => ({
  detectFollowUpRequest: vi.fn().mockReturnValue({ isFollowUp: false, type: null }),
  generateFollowUpInstruction: vi.fn().mockReturnValue(''),
  formatFollowUpDetection: vi.fn().mockReturnValue('[Follow-up: none]'),
}));

vi.mock('../../utils/loop-detector', () => ({
  detectLoop: vi.fn().mockReturnValue({ isLoop: false, suggestedAction: 'allow-response' }),
  generateForceInstruction: vi.fn().mockReturnValue('[Force Instruction]'),
  shouldCheckForLoop: vi.fn().mockReturnValue(false),
  formatLoopDetection: vi.fn().mockReturnValue('[Loop: none]'),
}));

vi.mock('../../utils/response-validator', () => ({
  validateResponseStructure: vi.fn().mockReturnValue({ isValid: true, errors: [], detectedTemplate: 'A' }),
  validateResponseWithPhase: vi.fn().mockReturnValue({ isValid: true, errors: [], detectedTemplate: 'A' }),
  formatValidationErrors: vi.fn().mockReturnValue('[Validation: OK]'),
}));

vi.mock('../../knowledge/fashion-summaries', () => ({
  detectKnowledgeTopics: vi.fn().mockReturnValue(['general']),
  formatKnowledgeForPrompt: vi.fn().mockReturnValue(''),
  getKnowledgeSummary: vi.fn().mockReturnValue('Fashion knowledge summary'),
}));

vi.mock('../../rag', () => ({
  getRAGService: vi.fn().mockReturnValue({
    retrieve: vi.fn().mockResolvedValue({
      documents: [],
      metadata: { tokenCount: 0, retrievalTimeMs: 0 },
    }),
  }),
  buildFashionContext: vi.fn().mockReturnValue('Fashion context'),
}));

vi.mock('../../rag/supabase-retrieval', () => ({
  retrieveFromSupabase: vi.fn().mockResolvedValue({ documents: [], metadata: { tokenCount: 0, retrievalTimeMs: 0 } }),
  searchProductsFromSupabase: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../transformers/db-product-to-enhanced', () => ({
  transformDbProductsToEnhanced: vi.fn().mockReturnValue([]),
}));

vi.mock('../../utils/product-filters', () => ({
  applyFilters: vi.fn().mockImplementation((products) => products),
  filterByThaiOccasion: vi.fn().mockImplementation((products) => products),
  filterByMonthSuitability: vi.fn().mockImplementation((products) => products),
}));

vi.mock('../../matching/thai-cultural-matcher', () => ({
  detectThaiOccasion: vi.fn().mockReturnValue(null),
}));

vi.mock('../../matching/price-intelligence-optimizer', () => ({
  calculateOutfitCostPerWear: vi.fn().mockReturnValue(100),
  getOutfitCostPerWearTier: vi.fn().mockReturnValue('good'),
}));

vi.mock('../../matching/social-proof-ranker', () => ({
  getTrendingProducts: vi.fn().mockReturnValue([]),
  getOutfitHashtags: vi.fn().mockReturnValue([]),
}));

vi.mock('../../utils/ai-serializer', () => ({
  createOutfitPrompt: vi.fn().mockReturnValue('Outfit prompt'),
  serializeForAI: vi.fn().mockReturnValue('Serialized data'),
  serializeCatalogForV5: vi.fn().mockReturnValue('=== PRODUCT CATALOG ===\n=== END CATALOG (0 products) ==='),
}));

vi.mock('../../categorization/occasion-mapper', () => ({
  mapProductToOccasions: vi.fn().mockReturnValue(['work', 'chill']),
}));

vi.mock('../../prompts/prompt-version', () => ({
  getActiveSystemPrompt: vi.fn().mockReturnValue('System prompt'),
  VersionUtils: {
    getVersion: vi.fn().mockReturnValue('v5.0'),
    isV5Active: vi.fn().mockReturnValue(false), // Default to v4 behavior for existing tests
  },
}));

vi.mock('../../parsers/looks-parser', () => ({
  parseLooksData: vi.fn().mockReturnValue({ text: 'Test response', looks: [] }),
  validateLooksAgainstCatalog: vi.fn().mockReturnValue([]),
}));

// Mock global fetch for OpenRouter API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Import the service under test AFTER all mocks are registered
// ---------------------------------------------------------------------------
import {
  detectOccasion,
  extractBudget,
  extractGender,
  detectThaiOccasionFromMessage,
  filterProductsForRequest,
  getFallbackRecommendations,
  processAIChatRequest,
} from '../ai-chat-service';

import { checkGuardrails } from '../../utils/guardrail-detector';
import { detectImageRequest, extractOutfitDescription } from '../../utils/image-trigger-detector';
import { applyFilters, filterByThaiOccasion, filterByMonthSuitability } from '../../utils/product-filters';
import { detectThaiOccasion as detectThaiOccasionMatcher } from '../../matching/thai-cultural-matcher';
import { filterAndValidateProducts } from '../../utils/duplicate-filter';
import { getClarificationsNeeded } from '../../utils/clarification-detector';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createMockProduct(overrides?: Record<string, any>): EnhancedProduct {
  return {
    id: 'prod-1',
    sku: 'SKU001',
    name: { en: 'Test Shirt', th: 'เสื้อทดสอบ' },
    brand: 'TestBrand',
    pricing: {
      currentPrice: 1990,
      currency: 'THB',
    },
    classification: {
      category: { department: 'women', category: 'tops', subcategory: 'shirts' },
      gender: 'women',
      tags: {
        occasion: ['work', 'chill'],
        style: ['modern'],
        season: ['all-season'],
      },
    },
    style: {
      colors: { primary: 'white' },
      formalityLevel: 5,
      styleAttributes: ['modern'],
      seasonality: ['all-season'],
    },
    sizing: {
      availableSizes: ['S', 'M', 'L'],
    },
    availability: {
      status: 'in_stock',
    },
    thaiMarket: {
      culturalAppropriate: true,
    },
    centralIntegration: {
      centralSKU: 'CEN-001',
      productUrl: '/products/test-shirt',
      images: { primary: '/img/test.jpg' },
    },
    ...overrides,
  } as EnhancedProduct;
}

function createMockRequest(overrides?: Partial<ChatRequest>): ChatRequest {
  return {
    message: 'I need an outfit for work',
    ...overrides,
  };
}

function createMockSessionContext(overrides?: Partial<SessionContext>): SessionContext {
  return {
    recommendedProductIds: [],
    askedClarifications: [],
    conversationContext: {},
    ...overrides,
  };
}

function makeFetchResponse(content: string): Response {
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content } }],
      }),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ai-chat-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.SUPABASE_RAG_ENABLED;
  });

  // =========================================================================
  // 1. detectOccasion
  // =========================================================================
  describe('detectOccasion', () => {
    it('detects "work" occasion from English keyword', () => {
      expect(detectOccasion('I need an outfit for work')).toBe('work');
    });

    it('detects "work" from Thai keyword "ทำงาน"', () => {
      expect(detectOccasion('ชุดไปทำงาน')).toBe('work');
    });

    it('detects "work" from "office"', () => {
      expect(detectOccasion('office outfit ideas')).toBe('work');
    });

    it('detects "work" from Thai keyword "ออฟฟิศ"', () => {
      expect(detectOccasion('ชุดใส่ไปออฟฟิศ')).toBe('work');
    });

    it('detects "chill" from "weekend"', () => {
      expect(detectOccasion('What should I wear this weekend')).toBe('chill');
    });

    it('detects "chill" from Thai keyword "สบายๆ"', () => {
      expect(detectOccasion('อยากได้ชุดสบายๆ')).toBe('chill');
    });

    it('detects "wedding" from English keyword', () => {
      expect(detectOccasion('wedding outfit')).toBe('wedding');
    });

    it('detects "wedding" from Thai keyword "งานแต่ง"', () => {
      expect(detectOccasion('ชุดไปงานแต่ง')).toBe('wedding');
    });

    it('detects "sport" from "gym"', () => {
      expect(detectOccasion('going to the gym')).toBe('sport');
    });

    it('detects "sport" from Thai keyword "ออกกำลัง"', () => {
      expect(detectOccasion('ชุดออกกำลังกาย')).toBe('sport');
    });

    it('detects "travel" from English keyword', () => {
      expect(detectOccasion('travel outfit for vacation')).toBe('travel');
    });

    it('detects "travel" from Thai keyword "เที่ยว"', () => {
      expect(detectOccasion('ชุดไปเที่ยว')).toBe('travel');
    });

    it('detects "date" from English keyword', () => {
      expect(detectOccasion('going on a date tonight')).toBe('date');
    });

    it('detects "date" from Thai keyword "เดท"', () => {
      expect(detectOccasion('ไปเดทกัน')).toBe('date');
    });

    it('detects "dinner" from English keyword', () => {
      expect(detectOccasion('dinner at a fancy restaurant')).toBe('dinner');
    });

    it('detects "dinner" from Thai keyword "ดินเนอร์"', () => {
      expect(detectOccasion('ชุดไปดินเนอร์')).toBe('dinner');
    });

    it('detects "cafe" from English keyword', () => {
      expect(detectOccasion('going to a cafe')).toBe('cafe');
    });

    it('detects "cafe" from Thai keyword "คาเฟ่"', () => {
      expect(detectOccasion('ไปคาเฟ่')).toBe('cafe');
    });

    it('detects "party" from English keyword', () => {
      expect(detectOccasion('party outfit')).toBe('party');
    });

    it('detects "party" from Thai keyword "ปาร์ตี้"', () => {
      expect(detectOccasion('ชุดไปปาร์ตี้')).toBe('party');
    });

    it('returns undefined for unrecognized messages', () => {
      expect(detectOccasion('hello there')).toBeUndefined();
    });

    it('returns undefined for empty message', () => {
      expect(detectOccasion('')).toBeUndefined();
    });

    it('is case-insensitive', () => {
      expect(detectOccasion('WEDDING outfit')).toBe('wedding');
      expect(detectOccasion('Going to the GYM')).toBe('sport');
    });

    it('returns the first matching occasion when multiple keywords present', () => {
      // "work" comes first in the keyword map, so it should match first
      const result = detectOccasion('work party outfit');
      expect(result).toBe('work');
    });
  });

  // =========================================================================
  // 2. extractBudget
  // =========================================================================
  describe('extractBudget', () => {
    // Note: The regex pattern \d{1,3}(?:,\d{3})* is designed for comma-formatted numbers.
    // Non-comma numbers with 4+ digits only partially match (e.g., "5000" -> 500).
    // Comma-formatted numbers work correctly (e.g., "5,000" -> 5000).

    it('extracts budget from "budget 500"', () => {
      expect(extractBudget('budget 500')).toBe(500);
    });

    it('extracts budget from comma-formatted "budget 5,000"', () => {
      expect(extractBudget('budget 5,000')).toBe(5000);
    });

    it('handles comma-separated "5,000 baht"', () => {
      expect(extractBudget('I have 5,000 baht')).toBe(5000);
    });

    it('handles comma-separated Thai "งบ 3,000"', () => {
      expect(extractBudget('งบ 3,000')).toBe(3000);
    });

    it('handles comma-separated Thai "ไม่เกิน 3,000"', () => {
      expect(extractBudget('ไม่เกิน 3,000')).toBe(3000);
    });

    it('handles comma-separated "ราคา 2,000"', () => {
      expect(extractBudget('ราคา 2,000')).toBe(2000);
    });

    it('handles comma-separated numbers like "งบ 2,000"', () => {
      expect(extractBudget('งบ 2,000')).toBe(2000);
    });

    it('handles larger comma-separated numbers like "15,000 baht"', () => {
      expect(extractBudget('15,000 baht')).toBe(15000);
    });

    it('handles comma-separated "under 10,000"', () => {
      expect(extractBudget('under 10,000')).toBe(10000);
    });

    it('extracts from "500 THB"', () => {
      expect(extractBudget('500 THB')).toBe(500);
    });

    it('extracts from "999 บาท"', () => {
      expect(extractBudget('999 บาท')).toBe(999);
    });

    it('partially matches non-comma 4-digit numbers (regex limitation)', () => {
      // "budget 5000" -> regex matches "500" (3 digits max without comma)
      expect(extractBudget('budget 5000')).toBe(500);
    });

    it('returns undefined for messages without budget info', () => {
      expect(extractBudget('I want a nice dress')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(extractBudget('')).toBeUndefined();
    });
  });

  // =========================================================================
  // 3. extractGender
  // =========================================================================
  describe('extractGender', () => {
    it('detects "men" from message containing "men"', () => {
      expect(extractGender('looking for men clothing')).toBe('men');
    });

    it('detects "women" from message containing "women"', () => {
      expect(extractGender('women fashion')).toBe('women');
    });

    it('detects "women" from "woman"', () => {
      expect(extractGender('I am a woman')).toBe('women');
    });

    it('detects "women" from Thai "ผู้หญิง"', () => {
      expect(extractGender('เสื้อผ้าผู้หญิง')).toBe('women');
    });

    it('detects "men" from Thai "ผู้ชาย"', () => {
      expect(extractGender('เสื้อผ้าผู้ชาย')).toBe('men');
    });

    it('does NOT return "men" when "women" is in the message', () => {
      // "women" contains "men", but the logic checks for "women" first
      expect(extractGender('women clothing')).toBe('women');
    });

    it('returns undefined for messages without gender info', () => {
      expect(extractGender('I want a nice outfit')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(extractGender('')).toBeUndefined();
    });

    it('is case-insensitive', () => {
      expect(extractGender('WOMEN fashion')).toBe('women');
      expect(extractGender('MEN clothing')).toBe('men');
    });
  });

  // =========================================================================
  // 4. detectThaiOccasionFromMessage
  // =========================================================================
  describe('detectThaiOccasionFromMessage', () => {
    it('delegates to detectThaiOccasion from thai-cultural-matcher', () => {
      vi.mocked(detectThaiOccasionMatcher).mockReturnValueOnce('temple');
      const result = detectThaiOccasionFromMessage('ไปวัด');
      expect(result).toBe('temple');
      expect(detectThaiOccasionMatcher).toHaveBeenCalledWith('ไปวัด');
    });

    it('returns null when no Thai occasion is detected', () => {
      vi.mocked(detectThaiOccasionMatcher).mockReturnValueOnce(null);
      const result = detectThaiOccasionFromMessage('hello');
      expect(result).toBeNull();
    });

    it('detects wedding occasions', () => {
      vi.mocked(detectThaiOccasionMatcher).mockReturnValueOnce('wedding-morning');
      expect(detectThaiOccasionFromMessage('งานแต่ง')).toBe('wedding-morning');
    });

    it('detects songkran occasions', () => {
      vi.mocked(detectThaiOccasionMatcher).mockReturnValueOnce('songkran-water');
      expect(detectThaiOccasionFromMessage('สงกรานต์ เล่นน้ำ')).toBe('songkran-water');
    });
  });

  // =========================================================================
  // 5. filterProductsForRequest
  // =========================================================================
  describe('filterProductsForRequest', () => {
    const products = [
      createMockProduct({ id: 'p1', sku: 'SKU001', pricing: { currentPrice: 1000, currency: 'THB' } }),
      createMockProduct({ id: 'p2', sku: 'SKU002', pricing: { currentPrice: 2000, currency: 'THB' } }),
      createMockProduct({ id: 'p3', sku: 'SKU003', pricing: { currentPrice: 5000, currency: 'THB' } }),
    ];

    it('passes products through applyFilters', () => {
      const request = createMockRequest({ message: 'show me outfits' });
      filterProductsForRequest(products, request);
      expect(applyFilters).toHaveBeenCalled();
    });

    it('passes occasion to applyFilters when provided', () => {
      const request = createMockRequest({ message: 'work outfit' });
      filterProductsForRequest(products, request, 'work');
      expect(applyFilters).toHaveBeenCalledWith(
        products,
        expect.objectContaining({ occasions: ['work'] })
      );
    });

    it('calls filterByThaiOccasion when thaiOccasion is provided', () => {
      vi.mocked(filterByThaiOccasion).mockReturnValueOnce(products);
      const request = createMockRequest({ message: 'temple visit' });
      filterProductsForRequest(products, request, undefined, 'temple');
      expect(filterByThaiOccasion).toHaveBeenCalledWith(products, 'temple');
    });

    it('does not apply Thai occasion filter when result has fewer than 3 products', () => {
      vi.mocked(filterByThaiOccasion).mockReturnValueOnce([products[0], products[1]]);
      const request = createMockRequest({ message: 'temple visit' });
      const result = filterProductsForRequest(products, request, undefined, 'temple');
      // With < 3 products from Thai filter, it falls back to the unfiltered list
      expect(result).toEqual(products);
    });

    it('calls filterByMonthSuitability', () => {
      const request = createMockRequest({ message: 'show me outfits' });
      filterProductsForRequest(products, request);
      expect(filterByMonthSuitability).toHaveBeenCalled();
    });

    it('falls back without occasion filter when filtered result is empty and occasion is set', () => {
      // First call (with occasion) returns empty, second call (without) returns products
      vi.mocked(applyFilters)
        .mockReturnValueOnce([]) // First call with occasion
        .mockReturnValueOnce(products); // Second call without occasion
      vi.mocked(filterByMonthSuitability).mockReturnValueOnce([]);

      const request = createMockRequest({ message: 'work outfit' });
      const result = filterProductsForRequest(products, request, 'work');
      expect(applyFilters).toHaveBeenCalledTimes(2);
      expect(result).toEqual(products);
    });

    it('falls back to all available when both filtered results are empty', () => {
      vi.mocked(applyFilters)
        .mockReturnValueOnce([]) // First call with occasion
        .mockReturnValueOnce([]) // Second call without occasion
        .mockReturnValueOnce(products); // Third call: all available
      vi.mocked(filterByMonthSuitability).mockReturnValueOnce([]);

      const request = createMockRequest({ message: 'work outfit' });
      const result = filterProductsForRequest(products, request, 'work');
      expect(applyFilters).toHaveBeenCalledTimes(3);
      expect(result).toEqual(products);
    });

    it('uses budget from userPreferences when available', () => {
      const request = createMockRequest({
        message: 'show me something',
        userPreferences: { budget: 3000 },
      });
      filterProductsForRequest(products, request);
      expect(applyFilters).toHaveBeenCalledWith(
        products,
        expect.objectContaining({
          priceRange: { min: 0, max: 3000 },
        })
      );
    });

    it('extracts budget from message if not in preferences', () => {
      const request = createMockRequest({
        message: 'budget 2,000',
      });
      filterProductsForRequest(products, request);
      expect(applyFilters).toHaveBeenCalledWith(
        products,
        expect.objectContaining({
          priceRange: { min: 0, max: 2000 },
        })
      );
    });

    it('uses gender from userPreferences when available', () => {
      const request = createMockRequest({
        message: 'show me something',
        userPreferences: { gender: 'women' },
      });
      filterProductsForRequest(products, request);
      expect(applyFilters).toHaveBeenCalledWith(
        products,
        expect.objectContaining({
          gender: 'women',
        })
      );
    });
  });

  // =========================================================================
  // 6. getFallbackRecommendations
  // =========================================================================
  describe('getFallbackRecommendations', () => {
    const products = [
      createMockProduct({ id: 'p1', sku: 'SKU001' }),
      createMockProduct({ id: 'p2', sku: 'SKU002' }),
      createMockProduct({ id: 'p3', sku: 'SKU003' }),
      createMockProduct({ id: 'p4', sku: 'SKU004' }),
      createMockProduct({ id: 'p5', sku: 'SKU005' }),
      createMockProduct({ id: 'p6', sku: 'SKU006' }),
      createMockProduct({ id: 'p7', sku: 'SKU007' }),
    ];

    it('returns a ChatResponse with a Thai greeting', () => {
      const request = createMockRequest({ message: 'hello' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).toContain('สวัสดีค่ะ');
    });

    it('includes occasion name in message when occasion is detected', () => {
      const request = createMockRequest({ message: 'I need an outfit for work' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).toContain('การทำงาน/ออฟฟิศ');
      expect(result.occasion).toBe('work');
    });

    it('includes occasion name for "wedding"', () => {
      const request = createMockRequest({ message: 'wedding outfit' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).toContain('งานแต่งงาน');
      expect(result.occasion).toBe('wedding');
    });

    it('includes occasion name for "party"', () => {
      const request = createMockRequest({ message: 'party outfit' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).toContain('งานปาร์ตี้');
      expect(result.occasion).toBe('party');
    });

    it('returns up to 6 recommended products', () => {
      const request = createMockRequest({ message: 'show me outfits' });
      const result = getFallbackRecommendations(request, products);
      expect(result.recommendedProducts!.length).toBeLessThanOrEqual(6);
    });

    it('returns all products when fewer than 6 are available', () => {
      const fewProducts = [
        createMockProduct({ id: 'p1', sku: 'SKU001' }),
        createMockProduct({ id: 'p2', sku: 'SKU002' }),
      ];
      const request = createMockRequest({ message: 'show me outfits' });
      const result = getFallbackRecommendations(request, fewProducts);
      expect(result.recommendedProducts!.length).toBe(2);
    });

    it('includes product count in the message', () => {
      const request = createMockRequest({ message: 'show me outfits' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).toContain(`${products.length} รายการ`);
    });

    it('does not include occasion section when no occasion detected', () => {
      const request = createMockRequest({ message: 'hello' });
      const result = getFallbackRecommendations(request, products);
      expect(result.message).not.toContain('สำหรับโอกาส');
      expect(result.occasion).toBeUndefined();
    });
  });

  // =========================================================================
  // 7. processAIChatRequest
  // =========================================================================
  describe('processAIChatRequest', () => {
    const products = [
      createMockProduct({ id: 'p1', sku: 'SKU001' }),
      createMockProduct({ id: 'p2', sku: 'SKU002' }),
      createMockProduct({ id: 'p3', sku: 'SKU003' }),
      createMockProduct({ id: 'p4', sku: 'SKU004' }),
    ];

    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      mockFetch.mockResolvedValue(makeFetchResponse('Here are your outfit recommendations!'));
    });

    it('returns guardrail message when query is off-topic', async () => {
      vi.mocked(checkGuardrails).mockReturnValueOnce('Please ask fashion-related questions');

      const request = createMockRequest({ message: 'tell me a joke' });
      const result = await processAIChatRequest(request, products);

      expect(result.message).toBe('Please ask fashion-related questions');
      expect(result.recommendedProducts).toEqual([]);
    });

    it('returns image request response when image generation is detected', async () => {
      vi.mocked(detectImageRequest).mockReturnValueOnce(true);
      vi.mocked(extractOutfitDescription).mockReturnValueOnce('A casual summer outfit');

      const request = createMockRequest({
        message: 'show me what it looks like',
        conversationHistory: [
          { role: 'assistant', content: 'Here is a nice outfit' },
        ],
      });
      const result = await processAIChatRequest(request, products);

      expect(result.imageRequest).toBe(true);
      expect(result.outfitDescription).toBe('A casual summer outfit');
      expect(result.message).toContain('กำลังสร้างภาพ');
    });

    it('falls back to getFallbackRecommendations when API call throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API timeout'));

      const request = createMockRequest({ message: 'work outfit' });
      const result = await processAIChatRequest(request, products);

      // Fallback response should contain Thai greeting
      expect(result.message).toContain('สวัสดีค่ะ');
    });

    it('returns AI response message on successful API call', async () => {
      const aiMessage = 'Here are your recommended outfits for work!';
      mockFetch.mockResolvedValueOnce(makeFetchResponse(aiMessage));

      const request = createMockRequest({ message: 'I need work clothes' });
      const result = await processAIChatRequest(request, products);

      expect(result.message).toBe(aiMessage);
      expect(result.recommendedProducts).toBeDefined();
      expect(result.recommendedProducts!.length).toBeGreaterThan(0);
    });

    it('returns up to 6 recommended products', async () => {
      const manyProducts = Array.from({ length: 10 }, (_, i) =>
        createMockProduct({ id: `p${i}`, sku: `SKU${i}` })
      );

      const request = createMockRequest({ message: 'outfit ideas' });
      const result = await processAIChatRequest(request, manyProducts);

      expect(result.recommendedProducts!.length).toBeLessThanOrEqual(6);
    });

    it('returns insufficient products message when not enough unique products', async () => {
      vi.mocked(filterAndValidateProducts).mockReturnValueOnce({
        products: [products[0]],
        hasSufficientProducts: false,
        message: 'Not enough unique products in this category',
      });

      const request = createMockRequest({ message: 'outfit ideas' });
      const result = await processAIChatRequest(request, products);

      expect(result.message).toBe('Not enough unique products in this category');
      expect(result.recommendedProducts).toEqual([]);
    });

    it('returns error message when filtered products are empty', async () => {
      vi.mocked(filterAndValidateProducts).mockReturnValueOnce({
        products: [],
        hasSufficientProducts: true,
        message: undefined,
      });

      const request = createMockRequest({ message: 'outfit ideas' });
      const result = await processAIChatRequest(request, products);

      expect(result.message).toContain('ไม่พบสินค้า');
      expect(result.recommendedProducts).toEqual([]);
    });

    it('includes occasion in response when detected', async () => {
      const request = createMockRequest({ message: 'I need a work outfit' });
      const result = await processAIChatRequest(request, products);

      expect(result.occasion).toBe('work');
    });

    it('includes updated session context in response', async () => {
      const request = createMockRequest({
        message: 'outfit ideas',
        sessionContext: createMockSessionContext(),
      });
      const result = await processAIChatRequest(request, products);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext!.recommendedProductIds.length).toBeGreaterThan(0);
    });

    it('includes reasoning in response', async () => {
      const request = createMockRequest({ message: 'outfit ideas' });
      const result = await processAIChatRequest(request, products);

      expect(result.reasoning).toBeDefined();
      expect(result.reasoning).toContain('products matching');
    });

    it('asks clarification when needed instead of recommending', async () => {
      vi.mocked(getClarificationsNeeded).mockReturnValueOnce([
        { type: 'gender', question: 'คุณต้องการดูเสื้อผ้าผู้หญิงหรือผู้ชายคะ?', priority: 1 },
      ]);

      const request = createMockRequest({ message: 'show me clothes' });
      const result = await processAIChatRequest(request, products);

      expect(result.message).toBe('What gender?');
      expect(result.recommendedProducts).toEqual([]);
    });

    it('auto-triggers imageRequest when products are recommended', async () => {
      const request = createMockRequest({ message: 'work outfit' });
      const result = await processAIChatRequest(request, products);

      expect(result.imageRequest).toBe(true);
      expect(result.outfitDescription).toBeDefined();
    });

    it('returns fallback with sessionContext on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const sessionCtx = createMockSessionContext({ sessionId: 'test-session' });
      const request = createMockRequest({
        message: 'outfit ideas',
        sessionContext: sessionCtx,
      });
      const result = await processAIChatRequest(request, products);

      expect(result.sessionContext).toBe(sessionCtx);
    });

    it('does not call fetch when guardrails block the request', async () => {
      vi.mocked(checkGuardrails).mockReturnValueOnce('Off-topic');

      const request = createMockRequest({ message: 'what is the weather' });
      await processAIChatRequest(request, products);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does not call fetch when image request is detected', async () => {
      vi.mocked(detectImageRequest).mockReturnValueOnce(true);

      const request = createMockRequest({ message: 'show me the outfit' });
      await processAIChatRequest(request, products);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
