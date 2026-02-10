/**
 * Knowledge Base Seeding Script (Supabase)
 *
 * Reads markdown files from data/personas/knowledge_base/ and inserts
 * them as chunks into the Supabase knowledge_chunks table.
 *
 * Usage (from apps/web/):
 *   npx tsx lib/supabase/migrations/003_seed_knowledge.ts
 */

import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { createServerClient } from '../client'

// Load env from apps/web/.env or .env.local
const webRoot = path.resolve(__dirname, '../../..')
const envLocalPath = path.join(webRoot, '.env.local')
const envPath = path.join(webRoot, '.env')
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : envPath })

// --- Configuration ---

interface DirConfig {
  dir: string
  category: string
  tier: number
}

const SUBDIRS: DirConfig[] = [
  { dir: 'foundation', category: 'foundation', tier: 1 },
  { dir: 'advanced', category: 'advanced', tier: 2 },
  { dir: 'implementation', category: 'implementation', tier: 3 },
  { dir: 'special', category: 'special', tier: 3 },
]

const SKIP_PATTERNS = [
  /^CLAUDE\.md$/i,
  /REPORT/i,
  /SUMMARY/i,
  /INDEX/i,
  /^README\.md$/i,
  /^EXTRACTION_/i,
  /^MIGRATION_/i,
  /^PLAN_/i,
  /^QUICK_START\.md$/i,
  /^GLOSSARY\.md$/i,
]

const CHUNK_TARGET_CHARS = 2000
const BATCH_SIZE = 50

// --- Helpers ---

function shouldSkip(filename: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(filename))
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)/m)
  return match ? match[1].trim() : null
}

interface Chunk {
  source_file: string
  category: string
  tier: number
  title: string | null
  content: string
  embedding: null
  metadata: Record<string, unknown>
}

function splitIntoChunks(
  content: string,
  sourceFile: string,
  category: string,
  tier: number,
  title: string | null
): Chunk[] {
  const paragraphs = content.split('\n\n')
  const chunks: Chunk[] = []
  let currentParagraphs: string[] = []
  let currentLength = 0

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    if (currentLength + trimmed.length > CHUNK_TARGET_CHARS && currentParagraphs.length > 0) {
      chunks.push({
        source_file: sourceFile,
        category,
        tier,
        title,
        content: currentParagraphs.join('\n\n'),
        embedding: null,
        metadata: {},
      })
      currentParagraphs = []
      currentLength = 0
    }

    currentParagraphs.push(trimmed)
    currentLength += trimmed.length
  }

  // Flush remaining
  if (currentParagraphs.length > 0) {
    chunks.push({
      source_file: sourceFile,
      category,
      tier,
      title,
      content: currentParagraphs.join('\n\n'),
      embedding: null,
      metadata: {},
    })
  }

  return chunks
}

// --- Main ---

async function main() {
  const projectRoot = path.resolve(webRoot, '../..')
  const kbRoot = path.join(projectRoot, 'data', 'personas', 'knowledge_base')

  if (!fs.existsSync(kbRoot)) {
    console.error(`Knowledge base directory not found: ${kbRoot}`)
    process.exit(1)
  }

  const supabase = createServerClient()
  const allChunks: Chunk[] = []
  let fileCount = 0

  for (const { dir, category, tier } of SUBDIRS) {
    const dirPath = path.join(kbRoot, dir)
    if (!fs.existsSync(dirPath)) {
      console.log(`Skipping missing directory: ${dir}/`)
      continue
    }

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md') && !shouldSkip(f))

    for (const filename of files) {
      const filePath = path.join(dirPath, filename)
      const content = fs.readFileSync(filePath, 'utf-8')
      const title = extractTitle(content)
      const sourceFile = `${dir}/${filename}`

      console.log(`Processing: ${sourceFile}`)

      const chunks = splitIntoChunks(content, sourceFile, category, tier, title)
      allChunks.push(...chunks)
      fileCount++

      console.log(`  Created ${chunks.length} chunks from ${filename}`)
    }
  }

  console.log(`\nTotal: ${allChunks.length} chunks from ${fileCount} files`)
  console.log(`\nInserting into Supabase...`)

  const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE)

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    const { error } = await supabase.from('knowledge_chunks').insert(batch)

    if (error) {
      console.error(`Error inserting batch ${batchNum}/${totalBatches}:`, error.message)
      process.exit(1)
    }

    console.log(`  Inserted batch ${batchNum}/${totalBatches} (${batch.length} rows)`)
  }

  console.log(`\nDone. Inserted ${allChunks.length} chunks from ${fileCount} files.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
