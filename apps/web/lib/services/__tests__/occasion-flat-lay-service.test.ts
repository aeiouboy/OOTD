import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAIResponse, buildImagePromptFromItems, generateOccasionFlatLay } from '../occasion-flat-lay-service';
import type { OccasionFlatLayRequest } from '@/lib/types/image-types';

// ---------------------------------------------------------------------------
// Mock OpenRouterImageClient
// ---------------------------------------------------------------------------

const mockGenerateRawFlatLay = vi.fn();

vi.mock('../../services/image-generation-service', () => ({
  OpenRouterImageClient: vi.fn().mockImplementation(() => ({
    generateRawFlatLay: mockGenerateRawFlatLay,
  })),
}));

// ---------------------------------------------------------------------------
// Mock global.fetch for AI curation calls
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WELL_FORMATTED_AI_RESPONSE = `CURATED_ITEMS:
1. Linen Wrap Dress | Dress | Sage Green | A relaxed linen wrap dress with a V-neckline
2. Woven Straw Tote | Bag | Natural Tan | A spacious woven straw tote bag
3. Leather Slide Sandals | Shoes | White | Minimalist flat leather slide sandals

IMAGE_PROMPT:
A high-resolution, studio-lit flat-lay photograph showing 3 fashion items arranged as a coordinated weekend outfit on a pristine white surface. The items are: a sage green linen wrap dress, a natural tan woven straw tote bag, and white leather slide sandals. Square 1:1 format.`;

const baseRequest: OccasionFlatLayRequest = {
  occasion: 'weekend-social',
  userName: 'Ploy',
  userAge: '20-29',
  stylePreferences: ['clean-girl', 'minimalist'],
};

const TEST_API_KEY = 'test-api-key-12345';

/** Builds a mock Response that resembles a successful OpenRouter chat completion */
function makeCurationResponse(content: string): Response {
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        choices: [{ message: { content } }],
      }),
  } as unknown as Response;
}

/** Builds a mock Response for a failed OpenRouter call */
function makeErrorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: { message } }),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests: parseAIResponse
// ---------------------------------------------------------------------------

describe('occasion-flat-lay-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseAIResponse', () => {
    it('extracts curated items correctly from a well-formatted response', () => {
      const { curatedItems } = parseAIResponse(WELL_FORMATTED_AI_RESPONSE);

      expect(curatedItems).toHaveLength(3);

      expect(curatedItems[0]).toEqual({
        name: 'Linen Wrap Dress',
        category: 'Dress',
        color: 'Sage Green',
        visualDescription: 'A relaxed linen wrap dress with a V-neckline',
      });

      expect(curatedItems[1]).toEqual({
        name: 'Woven Straw Tote',
        category: 'Bag',
        color: 'Natural Tan',
        visualDescription: 'A spacious woven straw tote bag',
      });

      expect(curatedItems[2]).toEqual({
        name: 'Leather Slide Sandals',
        category: 'Shoes',
        color: 'White',
        visualDescription: 'Minimalist flat leather slide sandals',
      });
    });

    it('extracts image prompt correctly', () => {
      const { imagePrompt } = parseAIResponse(WELL_FORMATTED_AI_RESPONSE);

      expect(imagePrompt).toBeTruthy();
      expect(imagePrompt).toContain('high-resolution');
      expect(imagePrompt).toContain('sage green linen wrap dress');
      expect(imagePrompt).toContain('1:1 format');
    });

    it('handles malformed response without proper sections', () => {
      const malformed = 'Here is a nice outfit for you! Wear a blue dress.';
      const { curatedItems, imagePrompt } = parseAIResponse(malformed);

      expect(curatedItems).toHaveLength(0);
      expect(imagePrompt).toBeNull();
    });

    it('handles response with CURATED_ITEMS but no IMAGE_PROMPT', () => {
      const partial = `CURATED_ITEMS:
1. Silk Blouse | Top | Ivory | A luxurious silk blouse with pearl buttons`;

      const { curatedItems, imagePrompt } = parseAIResponse(partial);

      expect(curatedItems).toHaveLength(1);
      expect(curatedItems[0].name).toBe('Silk Blouse');
      expect(imagePrompt).toBeNull();
    });

    it('handles response with IMAGE_PROMPT but no CURATED_ITEMS', () => {
      const promptOnly = `Some intro text here.

IMAGE_PROMPT:
A beautiful flat-lay photograph of a weekend outfit on white marble.`;

      const { curatedItems, imagePrompt } = parseAIResponse(promptOnly);

      expect(curatedItems).toHaveLength(0);
      expect(imagePrompt).toContain('flat-lay photograph');
    });

    it('handles items with irregular spacing', () => {
      const spaced = `CURATED_ITEMS:
1.   Denim Jacket   |   Outerwear   |   Light Blue   |   Classic relaxed fit denim jacket

IMAGE_PROMPT:
A flat lay image.`;

      const { curatedItems } = parseAIResponse(spaced);

      expect(curatedItems).toHaveLength(1);
      expect(curatedItems[0].name).toBe('Denim Jacket');
      expect(curatedItems[0].category).toBe('Outerwear');
      expect(curatedItems[0].color).toBe('Light Blue');
    });

    it('deduplicates items with the same category (keeps first)', () => {
      const duplicated = `CURATED_ITEMS:
1. Silk Blouse | Top | Ivory | A luxurious silk blouse
2. Cotton T-Shirt | Top | White | A basic cotton tee
3. Slim Jeans | Bottom | Dark Blue | Fitted dark wash jeans
4. Ankle Boots | Shoes | Black | Classic ankle boots

IMAGE_PROMPT:
A flat lay image.`;

      const { curatedItems } = parseAIResponse(duplicated);

      expect(curatedItems).toHaveLength(3);
      expect(curatedItems[0].name).toBe('Silk Blouse');
      expect(curatedItems[1].name).toBe('Slim Jeans');
      expect(curatedItems[2].name).toBe('Ankle Boots');
      // The duplicate "Top" (Cotton T-Shirt) should be removed
      expect(curatedItems.find(i => i.name === 'Cotton T-Shirt')).toBeUndefined();
    });

    it('deduplicates case-insensitively', () => {
      const mixedCase = `CURATED_ITEMS:
1. Leather Bag | Bag | Brown | A leather crossbody bag
2. Canvas Tote | bag | Beige | A large canvas tote
3. Sneakers | Shoes | White | Minimalist sneakers

IMAGE_PROMPT:
A flat lay image.`;

      const { curatedItems } = parseAIResponse(mixedCase);

      expect(curatedItems).toHaveLength(2);
      expect(curatedItems[0].name).toBe('Leather Bag');
      expect(curatedItems[1].name).toBe('Sneakers');
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: buildImagePromptFromItems
  // ---------------------------------------------------------------------------

  describe('buildImagePromptFromItems', () => {
    it('includes exact item count multiple times for reinforcement', () => {
      const items = [
        { name: 'Silk Dress', category: 'Dress', color: 'Red', visualDescription: 'A silk dress' },
        { name: 'Heels', category: 'Shoes', color: 'Black', visualDescription: 'Black heels' },
        { name: 'Clutch', category: 'Bag', color: 'Gold', visualDescription: 'A gold clutch' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('exactly 3 fashion items');
      expect(prompt).toContain('MUST include ALL 3 items');
      expect(prompt).toContain('all 3 items');
      expect(prompt).toContain('each of the 3 pieces');
    });

    it('lists every item explicitly with number, color, and category', () => {
      const items = [
        { name: 'Cotton Tee', category: 'Top', color: 'White', visualDescription: 'A white tee' },
        { name: 'Wide Jeans', category: 'Bottom', color: 'Blue', visualDescription: 'Wide jeans' },
        { name: 'Sneakers', category: 'Shoes', color: 'Grey', visualDescription: 'Grey sneakers' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Everyday Casual');

      expect(prompt).toContain('1. a white cotton tee (top)');
      expect(prompt).toContain('2. a blue wide jeans (bottom)');
      expect(prompt).toContain('3. a grey sneakers (shoes)');
    });

    it('includes anti-text instructions', () => {
      const items = [
        { name: 'Dress', category: 'Dress', color: 'Navy', visualDescription: 'A navy dress' },
        { name: 'Heels', category: 'Shoes', color: 'Nude', visualDescription: 'Nude heels' },
        { name: 'Bag', category: 'Bag', color: 'Black', visualDescription: 'A black bag' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('Do NOT include any text');
      expect(prompt).toContain('no text of any kind');
    });

    it('includes occasion label in the prompt', () => {
      const items = [
        { name: 'Tee', category: 'Top', color: 'White', visualDescription: 'A tee' },
        { name: 'Shorts', category: 'Bottom', color: 'Khaki', visualDescription: 'Shorts' },
        { name: 'Sandals', category: 'Shoes', color: 'Brown', visualDescription: 'Sandals' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Weekend & Social');

      expect(prompt).toContain('weekend & social outfit');
    });

    it('scales count references correctly for 5 items', () => {
      const items = [
        { name: 'Top', category: 'Top', color: 'White', visualDescription: 'A top' },
        { name: 'Bottom', category: 'Bottom', color: 'Blue', visualDescription: 'A bottom' },
        { name: 'Shoes', category: 'Shoes', color: 'Black', visualDescription: 'Shoes' },
        { name: 'Bag', category: 'Bag', color: 'Tan', visualDescription: 'A bag' },
        { name: 'Earrings', category: 'Accessory', color: 'Gold', visualDescription: 'Earrings' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('exactly 5 fashion items');
      expect(prompt).toContain('MUST include ALL 5 items');
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: generateOccasionFlatLay
  // ---------------------------------------------------------------------------

  describe('generateOccasionFlatLay', () => {
    it('succeeds end-to-end with valid curation and image generation', async () => {
      // Mock fetch: AI curation returns well-formatted response
      mockFetch.mockResolvedValueOnce(makeCurationResponse(WELL_FORMATTED_AI_RESPONSE));

      // Mock image generation: success
      mockGenerateRawFlatLay.mockResolvedValueOnce({
        success: true,
        imageBase64: 'base64-image-data',
        imageUrl: 'https://example.com/flat-lay.png',
      });

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(true);
      expect(result.imageBase64).toBe('base64-image-data');
      expect(result.imageUrl).toBe('https://example.com/flat-lay.png');
      expect(result.curatedItems).toHaveLength(3);
      // imagePrompt is now the structured prompt built from curated items
      expect(result.imagePrompt).toContain('exactly 3 fashion items');
      expect(result.imagePrompt).toContain('linen wrap dress');
      expect(result.imagePrompt).toContain('woven straw tote');
      expect(result.imagePrompt).toContain('leather slide sandals');
      expect(result.message).toContain('successfully');

      // Verify fetch was called with correct structure
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchArgs = mockFetch.mock.calls[0];
      expect(fetchArgs[0]).toContain('openrouter.ai');
      expect(fetchArgs[1].method).toBe('POST');
      expect(fetchArgs[1].headers.Authorization).toBe(`Bearer ${TEST_API_KEY}`);

      // Verify image generation received structured prompt with all items + anti-text
      expect(mockGenerateRawFlatLay).toHaveBeenCalledTimes(1);
      const imagePromptArg = mockGenerateRawFlatLay.mock.calls[0][0];
      expect(imagePromptArg).toContain('exactly 3 fashion items');
      expect(imagePromptArg).toContain('MUST include ALL 3 items');
      expect(imagePromptArg).toContain('Do NOT include any text');
      expect(imagePromptArg).toContain('no text of any kind');
    });

    it('handles AI curation fetch failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_ERROR');
      expect(result.message).toContain('Network error');

      // Image generation should NOT be called
      expect(mockGenerateRawFlatLay).not.toHaveBeenCalled();
    });

    it('handles non-OK HTTP response from AI curation', async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse(429, 'Rate limited'));

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_ERROR');
      expect(result.message).toContain('Rate limited');
      expect(mockGenerateRawFlatLay).not.toHaveBeenCalled();
    });

    it('handles missing IMAGE_PROMPT in AI response', async () => {
      const responseWithoutPrompt = `CURATED_ITEMS:
1. Cotton T-shirt | Top | White | A classic crew-neck cotton tee`;

      mockFetch.mockResolvedValueOnce(makeCurationResponse(responseWithoutPrompt));

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI_PARSE_ERROR');
      expect(result.message).toContain('Could not extract image prompt');
      expect(result.curatedItems).toHaveLength(1);

      // Image generation should NOT be called when there's no prompt
      expect(mockGenerateRawFlatLay).not.toHaveBeenCalled();
    });

    it('fails when AI returns fewer than 3 curated items', async () => {
      const tooFewItems = `CURATED_ITEMS:
1. Cotton T-shirt | Top | White | A classic crew-neck cotton tee
2. Slim Jeans | Bottom | Blue | Fitted dark wash jeans

IMAGE_PROMPT:
A high-resolution flat-lay photograph of a casual outfit.`;

      mockFetch.mockResolvedValueOnce(makeCurationResponse(tooFewItems));

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_ITEMS');
      expect(result.message).toContain('at least 3');
      expect(result.curatedItems).toHaveLength(2);
      expect(result.imagePrompt).toContain('flat-lay');

      // Image generation should NOT be called with insufficient items
      expect(mockGenerateRawFlatLay).not.toHaveBeenCalled();
    });

    it('fails when deduplication reduces items below minimum', async () => {
      const duplicatesReduceBelow3 = `CURATED_ITEMS:
1. Silk Blouse | Top | Ivory | A luxurious silk blouse
2. Cotton Tee | Top | White | A basic cotton tee
3. Linen Shirt | Top | Beige | A relaxed linen shirt

IMAGE_PROMPT:
A high-resolution flat-lay photograph.`;

      mockFetch.mockResolvedValueOnce(makeCurationResponse(duplicatesReduceBelow3));

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_ITEMS');
      expect(result.message).toContain('1 items');
      expect(result.curatedItems).toHaveLength(1); // Only first "Top" kept
      expect(mockGenerateRawFlatLay).not.toHaveBeenCalled();
    });

    it('handles image generation failure after successful curation', async () => {
      mockFetch.mockResolvedValueOnce(makeCurationResponse(WELL_FORMATTED_AI_RESPONSE));

      mockGenerateRawFlatLay.mockResolvedValueOnce({
        success: false,
        error: 'GENERATION_FAILED',
        message: 'Model timeout',
      });

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_FAILED');
      expect(result.message).toContain('Model timeout');
      // Curated items and structured image prompt should still be present
      expect(result.curatedItems).toHaveLength(3);
      expect(result.imagePrompt).toContain('exactly 3 fashion items');
    });

    it('handles empty AI curation response', async () => {
      const emptyResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [{ message: { content: '' } }] }),
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(emptyResponse);

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_ERROR');
      expect(result.message).toContain('Empty or invalid response');
    });

    it('handles AI curation response with no choices', async () => {
      const noChoicesResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [] }),
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(noChoicesResponse);

      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_ERROR');
    });

    it('includes curated items even when image generation fails', async () => {
      mockFetch.mockResolvedValueOnce(makeCurationResponse(WELL_FORMATTED_AI_RESPONSE));

      mockGenerateRawFlatLay.mockRejectedValueOnce(new Error('Unexpected image error'));

      // The outer try/catch in generateOccasionFlatLay should catch this
      const result = await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GENERATION_ERROR');
      expect(result.message).toContain('Unexpected image error');
    });

    it('passes correct model and headers to OpenRouter API', async () => {
      mockFetch.mockResolvedValueOnce(makeCurationResponse(WELL_FORMATTED_AI_RESPONSE));
      mockGenerateRawFlatLay.mockResolvedValueOnce({
        success: true,
        imageBase64: 'img-data',
      });

      await generateOccasionFlatLay(baseRequest, TEST_API_KEY);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');

      const body = JSON.parse(options.body);
      expect(body.model).toBe('google/gemini-3-flash-preview');
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[1].role).toBe('user');
      expect(body.max_tokens).toBe(2048);

      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['HTTP-Referer']).toBe('https://ootday.com');
      expect(options.headers['X-Title']).toBe('OOTDay Fashion Assistant');
    });
  });
});
