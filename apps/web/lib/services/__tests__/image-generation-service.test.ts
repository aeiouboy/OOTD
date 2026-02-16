import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterImageClient } from '../image-generation-service';
import type { FlatLayRequest } from '@/lib/types/image-types';

const mockFetch = vi.fn();

global.fetch = mockFetch;

function makeOpenRouterResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(payload),
  } as unknown as Response;
}

const baseRequest: FlatLayRequest = {
  items: [
    {
      name: 'Women Dress Fancy Rose Red',
      category: 'Dress',
      color: 'Red',
    },
  ],
  occasionContext: 'party',
};

describe('image-generation-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses image payload from array-based content responses', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOpenRouterResponse({
        choices: [
          {
            message: {
              content: [
                { type: 'output_text', text: 'done' },
                {
                  type: 'image_url',
                  image_url: {
                    url: 'data:image/png;base64,ZmFrZS1pbWFnZQ==',
                  },
                },
              ],
            },
          },
        ],
      })
    );

    const client = new OpenRouterImageClient('test-api-key');
    (client as any).sleep = vi.fn().mockResolvedValue(undefined);

    const result = await client.generateFlatLayImage(baseRequest);

    expect(result.success).toBe(true);
    expect(result.imageBase64).toBe('data:image/png;base64,ZmFrZS1pbWFnZQ==');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fails with retries when provider response has no image payload', async () => {
    mockFetch.mockResolvedValue(
      makeOpenRouterResponse({
        choices: [
          {
            message: {
              content: 'Flat-lay image generated successfully',
            },
          },
        ],
      })
    );

    const client = new OpenRouterImageClient('test-api-key');
    (client as any).sleep = vi.fn().mockResolvedValue(undefined);

    const result = await client.generateFlatLayImage(baseRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GENERATION_FAILED');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('falls back to text-only generation when multimodal flat-lay fails', async () => {
    mockFetch
      .mockResolvedValueOnce(
        makeOpenRouterResponse({
          choices: [
            {
              message: {
                content: 'no image payload yet',
              },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        makeOpenRouterResponse({
          choices: [
            {
              message: {
                content: 'still no image payload',
              },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        makeOpenRouterResponse({
          choices: [
            {
              message: {
                content: 'multimodal retries exhausted',
              },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        makeOpenRouterResponse({
          choices: [
            {
              message: {
                images: [
                  {
                    image_url: {
                      url: 'data:image/png;base64,ZmFrZS1mYWxsYmFjay1pbWFnZQ==',
                    },
                  },
                ],
              },
            },
          ],
        })
      );

    const requestWithReferenceImage: FlatLayRequest = {
      ...baseRequest,
      items: [
        {
          ...baseRequest.items[0],
          thumbnailUrl: 'https://example.com/dress.png',
        },
      ],
    };

    const client = new OpenRouterImageClient('test-api-key');
    (client as any).sleep = vi.fn().mockResolvedValue(undefined);

    const result = await client.generateFlatLayImage(requestWithReferenceImage);

    expect(result.success).toBe(true);
    expect(result.imageBase64).toBe('data:image/png;base64,ZmFrZS1mYWxsYmFjay1pbWFnZQ==');
    expect(mockFetch).toHaveBeenCalledTimes(4);

    const firstRequest = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    const fallbackRequest = JSON.parse(mockFetch.mock.calls[3][1].body as string);
    expect(Array.isArray(firstRequest.messages[0].content)).toBe(true);
    expect(typeof fallbackRequest.messages[0].content).toBe('string');
  });
});
