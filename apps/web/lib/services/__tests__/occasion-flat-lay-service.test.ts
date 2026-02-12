import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAIResponse, buildImagePromptFromItems, generateOccasionFlatLay } from '../occasion-flat-lay-service';
import { computeFlatLayLayout } from '@/lib/prompts/image-prompts';
import type { OccasionFlatLayRequest, FlatLayItem } from '@/lib/types/image-types';

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
  // Tests: computeFlatLayLayout
  // ---------------------------------------------------------------------------

  describe('computeFlatLayLayout', () => {
    it('assigns inverted triangle positions for 3 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress', color: 'Red' },
        { name: 'Heels', category: 'Shoes', color: 'Black' },
        { name: 'Ring', category: 'Ring', color: 'Gold' },
      ];

      const layout = computeFlatLayLayout(items);

      expect(layout).toHaveLength(3);
      expect(layout[0].position).toBe('TOP-CENTER');
      expect(layout[1].position).toBe('BOTTOM-LEFT');
      expect(layout[2].position).toBe('BOTTOM-RIGHT');
    });

    it('assigns 2x2 grid positions for 4 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Blazer', category: 'Blazer', color: 'Navy' },
        { name: 'Pants', category: 'Pants', color: 'Grey' },
        { name: 'Shoes', category: 'Shoes', color: 'Black' },
        { name: 'Watch', category: 'Watch', color: 'Silver' },
      ];

      const layout = computeFlatLayLayout(items);

      expect(layout).toHaveLength(4);
      expect(layout[0].position).toBe('UPPER-LEFT');
      expect(layout[1].position).toBe('UPPER-RIGHT');
      expect(layout[2].position).toBe('LOWER-LEFT');
      expect(layout[3].position).toBe('LOWER-RIGHT');
    });

    it('assigns cross/diamond positions for 5 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress', color: 'Red' },
        { name: 'Jacket', category: 'Jacket', color: 'Black' },
        { name: 'Shoes', category: 'Shoes', color: 'Nude' },
        { name: 'Bag', category: 'Bag', color: 'Tan' },
        { name: 'Earrings', category: 'Earrings', color: 'Gold' },
      ];

      const layout = computeFlatLayLayout(items);

      expect(layout).toHaveLength(5);
      expect(layout[0].position).toBe('CENTER');
      expect(layout[1].position).toBe('UPPER-LEFT');
      expect(layout[2].position).toBe('UPPER-RIGHT');
      expect(layout[3].position).toBe('LOWER-LEFT');
      expect(layout[4].position).toBe('LOWER-RIGHT');
    });

    it('assigns 2x3 grid positions for 6 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Top', category: 'Top', color: 'White' },
        { name: 'Skirt', category: 'Skirt', color: 'Black' },
        { name: 'Jacket', category: 'Jacket', color: 'Grey' },
        { name: 'Shoes', category: 'Shoes', color: 'Nude' },
        { name: 'Bag', category: 'Bag', color: 'Brown' },
        { name: 'Necklace', category: 'Necklace', color: 'Gold' },
      ];

      const layout = computeFlatLayLayout(items);

      expect(layout).toHaveLength(6);
      expect(layout[0].position).toBe('UPPER-LEFT');
      expect(layout[1].position).toBe('UPPER-CENTER');
      expect(layout[2].position).toBe('UPPER-RIGHT');
      expect(layout[3].position).toBe('LOWER-LEFT');
      expect(layout[4].position).toBe('LOWER-CENTER');
      expect(layout[5].position).toBe('LOWER-RIGHT');
    });

    it('classifies sizes correctly: Dress=large, Shoes=medium, Jewelry=small', () => {
      const items: FlatLayItem[] = [
        { name: 'Earrings', category: 'Jewelry', color: 'Gold' },
        { name: 'Sneakers', category: 'Shoes', color: 'White' },
        { name: 'Wrap Dress', category: 'Dress', color: 'Blue' },
      ];

      const layout = computeFlatLayLayout(items);

      // After sorting: Dress (large), Shoes (medium), Jewelry (small)
      expect(layout[0].sizeHint).toBe('large');
      expect(layout[0].item.name).toBe('Wrap Dress');
      expect(layout[1].sizeHint).toBe('medium');
      expect(layout[1].item.name).toBe('Sneakers');
      expect(layout[2].sizeHint).toBe('small');
      expect(layout[2].item.name).toBe('Earrings');
    });

    it('handles case-insensitive category matching', () => {
      const items: FlatLayItem[] = [
        { name: 'Item1', category: 'DRESS', color: 'Red' },
        { name: 'Item2', category: 'shoes', color: 'Black' },
        { name: 'Item3', category: 'Jewelry', color: 'Gold' },
      ];

      const layout = computeFlatLayLayout(items);

      expect(layout[0].sizeHint).toBe('large');
      expect(layout[1].sizeHint).toBe('medium');
      expect(layout[2].sizeHint).toBe('small');
    });

    it('returns empty array for empty input', () => {
      const layout = computeFlatLayLayout([]);
      expect(layout).toHaveLength(0);
    });

    it('sorts large items to prominent positions', () => {
      const items: FlatLayItem[] = [
        { name: 'Ring', category: 'Ring', color: 'Gold' },
        { name: 'Sneakers', category: 'Sneakers', color: 'White' },
        { name: 'Blazer', category: 'Blazer', color: 'Navy' },
      ];

      const layout = computeFlatLayLayout(items);

      // After sorting: Blazer (large) -> TOP-CENTER, Sneakers (medium) -> BOTTOM-LEFT, Ring (small) -> BOTTOM-RIGHT
      expect(layout[0].item.name).toBe('Blazer');
      expect(layout[0].position).toBe('TOP-CENTER');
      expect(layout[1].item.name).toBe('Sneakers');
      expect(layout[2].item.name).toBe('Ring');
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: buildImagePromptFromItems
  // ---------------------------------------------------------------------------

  describe('buildImagePromptFromItems', () => {
    it('includes exact item count in the prompt', () => {
      const items: FlatLayItem[] = [
        { name: 'Silk Dress', category: 'Dress', color: 'Red', visualDescription: 'A silk dress' },
        { name: 'Heels', category: 'Shoes', color: 'Black', visualDescription: 'Black heels' },
        { name: 'Clutch', category: 'Bag', color: 'Gold', visualDescription: 'A gold clutch' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('exactly 3 fashion items');
      expect(prompt).toContain('All 3 items');
    });

    it('includes anti-text instructions near the start of the prompt', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress', color: 'Navy', visualDescription: 'A navy dress' },
        { name: 'Heels', category: 'Shoes', color: 'Nude', visualDescription: 'Nude heels' },
        { name: 'Bag', category: 'Bag', color: 'Black', visualDescription: 'A black bag' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      // Anti-text instructions appear at the very beginning
      const first100 = prompt.substring(0, 100);
      expect(first100).toContain('NO text');
    });

    it('includes spatial position strings', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress', color: 'Navy' },
        { name: 'Heels', category: 'Shoes', color: 'Nude' },
        { name: 'Bracelet', category: 'Bracelet', color: 'Gold' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('TOP-CENTER');
      expect(prompt).toContain('BOTTOM-LEFT');
      expect(prompt).toContain('BOTTOM-RIGHT');
    });

    it('includes size hints in the prompt', () => {
      const items: FlatLayItem[] = [
        { name: 'Blazer', category: 'Blazer', color: 'Navy' },
        { name: 'Heels', category: 'Heels', color: 'Nude' },
        { name: 'Watch', category: 'Watch', color: 'Silver' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Work');

      expect(prompt).toContain('(large)');
      expect(prompt).toContain('(medium)');
      expect(prompt).toContain('(small)');
    });

    it('includes occasion label in the prompt', () => {
      const items: FlatLayItem[] = [
        { name: 'Tee', category: 'Top', color: 'White' },
        { name: 'Shorts', category: 'Bottom', color: 'Khaki' },
        { name: 'Sandals', category: 'Shoes', color: 'Brown' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Weekend & Social');

      expect(prompt).toContain('weekend & social outfit');
    });

    it('scales count references correctly for 5 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Top', category: 'Top', color: 'White' },
        { name: 'Bottom', category: 'Bottom', color: 'Blue' },
        { name: 'Shoes', category: 'Shoes', color: 'Black' },
        { name: 'Bag', category: 'Bag', color: 'Tan' },
        { name: 'Earrings', category: 'Accessory', color: 'Gold' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('exactly 5 fashion items');
      expect(prompt).toContain('cross/diamond arrangement');
      expect(prompt).toContain('CENTER');
    });

    it('uses inverted triangle layout for 3 items', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress', color: 'Red' },
        { name: 'Shoes', category: 'Shoes', color: 'Black' },
        { name: 'Ring', category: 'Ring', color: 'Gold' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Date Night');

      expect(prompt).toContain('inverted triangle arrangement');
    });

    it('handles items without color gracefully', () => {
      const items: FlatLayItem[] = [
        { name: 'Dress', category: 'Dress' },
        { name: 'Shoes', category: 'Shoes' },
        { name: 'Belt', category: 'Belt' },
      ];

      const prompt = buildImagePromptFromItems(items, 'Casual');

      // Should not contain "undefined" and should still produce valid prompt
      expect(prompt).not.toContain('undefined');
      expect(prompt).toContain('dress');
      expect(prompt).toContain('shoes');
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
      // imagePrompt is now the structured prompt built from curated items with spatial layout
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

      // Verify image generation received structured prompt with spatial positions + anti-text
      expect(mockGenerateRawFlatLay).toHaveBeenCalledTimes(1);
      const imagePromptArg = mockGenerateRawFlatLay.mock.calls[0][0];
      expect(imagePromptArg).toContain('exactly 3 fashion items');
      expect(imagePromptArg).toContain('NO text');
      expect(imagePromptArg).toContain('TOP-CENTER');
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
