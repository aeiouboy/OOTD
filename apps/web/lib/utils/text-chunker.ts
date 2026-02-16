import { RAG_CONFIG } from '@/lib/rag/config'

export interface ChunkedText {
  title: string
  content: string
}

interface ChunkerOptions {
  title: string
  targetTokens?: number
  minTokens?: number
  maxTokens?: number
  overlapTokens?: number
}

function estimateTokens(text: string): number {
  const thaiPattern = /[\u0E00-\u0E7F]/g
  const thaiMatches = text.match(thaiPattern)
  const thaiCharCount = thaiMatches ? thaiMatches.length : 0
  const nonThaiCharCount = text.length - thaiCharCount
  return Math.ceil(thaiCharCount / 2 + nonThaiCharCount / 4)
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitOversizedParagraph(paragraph: string, maxTokens: number): string[] {
  const sentenceParts = paragraph
    .split(/(?<=[.!?ฯ。！？])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const sourceParts = sentenceParts.length > 0 ? sentenceParts : paragraph.split(/\s+/).filter(Boolean)
  const output: string[] = []

  let current = ''
  for (const part of sourceParts) {
    const candidate = current ? `${current} ${part}` : part
    if (estimateTokens(candidate) <= maxTokens) {
      current = candidate
      continue
    }

    if (current) {
      output.push(current.trim())
      current = part
      continue
    }

    // Single sentence is still too long, split by words.
    const words = part.split(/\s+/)
    let wordChunk = ''
    for (const word of words) {
      const wordCandidate = wordChunk ? `${wordChunk} ${word}` : word
      if (estimateTokens(wordCandidate) <= maxTokens) {
        wordChunk = wordCandidate
      } else {
        if (wordChunk) output.push(wordChunk.trim())
        wordChunk = word
      }
    }
    if (wordChunk) output.push(wordChunk.trim())
    current = ''
  }

  if (current) output.push(current.trim())
  return output
}

function getOverlapText(content: string, overlapTokens: number): string {
  if (overlapTokens <= 0) return ''

  const words = content.split(/\s+/).filter(Boolean)
  const overlapWords: string[] = []
  let tokens = 0

  for (let index = words.length - 1; index >= 0; index -= 1) {
    const word = words[index]
    const estimate = estimateTokens(word)
    if (tokens + estimate > overlapTokens && overlapWords.length > 0) break

    overlapWords.unshift(word)
    tokens += estimate

    if (tokens >= overlapTokens) break
  }

  return overlapWords.join(' ').trim()
}

export function chunkTextByParagraph(text: string, options: ChunkerOptions): ChunkedText[] {
  const normalized = normalizeText(text)
  if (!normalized) return []

  const config = RAG_CONFIG.chunking
  const targetTokens = options.targetTokens ?? config.targetTokens
  const minTokens = options.minTokens ?? config.minTokens
  const maxTokens = options.maxTokens ?? config.maxTokens
  const overlapTokens = options.overlapTokens ?? config.overlapTokens

  const paragraphCandidates = normalized
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const paragraphs = paragraphCandidates.flatMap((paragraph) => {
    if (estimateTokens(paragraph) <= maxTokens) return [paragraph]
    return splitOversizedParagraph(paragraph, maxTokens)
  })

  const chunkContents: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph
    const candidateTokens = estimateTokens(candidate)

    if (candidateTokens <= targetTokens || !currentChunk) {
      currentChunk = candidate
      continue
    }

    const currentTokens = estimateTokens(currentChunk)
    if (currentTokens >= minTokens || chunkContents.length === 0) {
      chunkContents.push(currentChunk.trim())
      const overlap = getOverlapText(currentChunk, overlapTokens)
      currentChunk = overlap ? `${overlap}\n\n${paragraph}` : paragraph
    } else {
      currentChunk = `${currentChunk}\n\n${paragraph}`
      if (estimateTokens(currentChunk) > maxTokens) {
        chunkContents.push(currentChunk.trim())
        currentChunk = ''
      }
    }
  }

  if (currentChunk.trim()) {
    const currentTokens = estimateTokens(currentChunk)
    if (currentTokens < minTokens && chunkContents.length > 0) {
      const merged = `${chunkContents[chunkContents.length - 1]}\n\n${currentChunk.trim()}`
      chunkContents[chunkContents.length - 1] = merged.trim()
    } else {
      chunkContents.push(currentChunk.trim())
    }
  }

  return chunkContents.map((content, index) => {
    const suffix = chunkContents.length > 1 ? ` (Part ${index + 1})` : ''
    return {
      title: `${options.title}${suffix}`,
      content,
    }
  })
}
