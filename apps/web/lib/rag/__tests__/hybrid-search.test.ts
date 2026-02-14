import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Mock the modules before imports
vi.mock('../query-translator', () => ({
  translateQueryForRAG: vi.fn((msg: string) => Promise.resolve(msg)),
}))

vi.mock('../supabase-retrieval', () => ({
  retrieveFromSupabase: vi.fn(),
}))

vi.mock('../../knowledge/fashion-summaries', () => ({
  detectKnowledgeTopics: vi.fn(() => ['occasion', 'thai_culture']),
  formatKnowledgeForPrompt: vi.fn(() => 'Mock fashion knowledge context'),
}))

describe('Hybrid Search Architecture', () => {
  const sourcePath = resolve(__dirname, '../../services/ai-chat-service.ts')

  it('should be implemented in ai-chat-service.ts', () => {
    const source = readFileSync(sourcePath, 'utf-8')

    // Verify hybrid architecture markers
    expect(source).toContain('translateQueryForRAG')
    expect(source).toContain('Promise.allSettled')
    expect(source).toContain('mergeRAGResults')
    expect(source).toContain('retrieveVectorKnowledge')
    expect(source).toContain('useKeywordFallback(message)')
  })

  it('should use translated query for vector search and original for keyword', () => {
    const source = readFileSync(sourcePath, 'utf-8')

    // Verify translatedQuery goes to vector search, original message to keyword
    expect(source).toContain('retrieveVectorKnowledge(translatedQuery')
    expect(source).toContain('useKeywordFallback(message)')
  })
})
