/**
 * Incremental Knowledge Base Seeding Script (Supabase)
 *
 * Reads markdown files from data/personas/knowledge_base/ and inserts ONLY
 * new files (not already in DB) as chunks into the knowledge_chunks table.
 *
 * Usage (from apps/web/):
 *   npx tsx lib/supabase/seeds/006_seed_new_knowledge.ts
 *
 * After running, generate embeddings with:
 *   npx tsx lib/supabase/seeds/005_generate_knowledge_embeddings.ts
 */

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createServerClient } from '../client';

// Load env from apps/web/.env or .env.local
const webRoot = path.resolve(__dirname, '../../..');
const envLocalPath = path.join(webRoot, '.env.local');
const envPath = path.join(webRoot, '.env');
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : envPath });

// --- Configuration ---

interface DirConfig {
  dir: string;
  category: string;
  tier: number;
}

const SUBDIRS: DirConfig[] = [
  { dir: 'foundation', category: 'foundation', tier: 1 },
  { dir: 'advanced', category: 'advanced', tier: 2 },
  { dir: 'implementation', category: 'implementation', tier: 3 },
  { dir: 'special', category: 'special', tier: 3 },
];

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
];

const CHUNK_TARGET_CHARS = 2000;
const BATCH_SIZE = 50;

// --- Helpers ---

function shouldSkip(filename: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(filename));
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

function extractTopics(content: string): string[] {
  const topics: string[] = [];
  // Extract from h2 headers
  const h2Matches = content.matchAll(/^##\s+(?:\d+\.\s+)?(.+)/gm);
  for (const m of h2Matches) {
    const topic = m[1]
      .replace(/[\/|]/g, ' ')
      .replace(/[#*_`]/g, '')
      .trim()
      .toLowerCase();
    if (topic.length > 3 && topic.length < 80) {
      topics.push(topic);
    }
  }
  return topics.slice(0, 10); // max 10 topics
}

function detectOccasions(content: string): string[] {
  const occasionKeywords: Record<string, string[]> = {
    work: ['work', 'ทำงาน', 'ออฟฟิศ', 'office'],
    wedding: ['wedding', 'งานแต่ง', 'แต่งงาน'],
    party: ['party', 'ปาร์ตี้', 'งานเลี้ยง'],
    date: ['date', 'เดท', 'นัด'],
    cafe: ['cafe', 'คาเฟ่', 'กาแฟ'],
    chill: ['chill', 'ชิลล์', 'วันหยุด', 'สบาย'],
    sport: ['sport', 'ออกกำลัง', 'gym', 'กีฬา'],
    travel: ['travel', 'ท่องเที่ยว', 'เที่ยว', 'ทริป'],
    dinner: ['dinner', 'ดินเนอร์', 'อาหารค่ำ'],
  };

  const detected: string[] = [];
  const lowerContent = content.toLowerCase();

  for (const [occasion, keywords] of Object.entries(occasionKeywords)) {
    const matchCount = keywords.filter((kw) => lowerContent.includes(kw)).length;
    if (matchCount >= 2) {
      detected.push(occasion);
    }
  }

  return detected;
}

interface Chunk {
  source_file: string;
  category: string;
  tier: number;
  title: string | null;
  content: string;
  embedding: null;
  metadata: Record<string, unknown>;
}

function splitIntoChunks(
  content: string,
  sourceFile: string,
  category: string,
  tier: number,
  title: string | null,
  metadata: Record<string, unknown>
): Chunk[] {
  const paragraphs = content.split('\n\n');
  const chunks: Chunk[] = [];
  let currentParagraphs: string[] = [];
  let currentLength = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentLength + trimmed.length > CHUNK_TARGET_CHARS && currentParagraphs.length > 0) {
      chunks.push({
        source_file: sourceFile,
        category,
        tier,
        title,
        content: currentParagraphs.join('\n\n'),
        embedding: null,
        metadata,
      });
      currentParagraphs = [];
      currentLength = 0;
    }

    currentParagraphs.push(trimmed);
    currentLength += trimmed.length;
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
      metadata,
    });
  }

  return chunks;
}

// --- Main ---

async function main() {
  const projectRoot = path.resolve(webRoot, '../..');
  const kbRoot = path.join(projectRoot, 'data', 'personas', 'knowledge_base');

  if (!fs.existsSync(kbRoot)) {
    console.error(`Knowledge base directory not found: ${kbRoot}`);
    process.exit(1);
  }

  const supabase = createServerClient();

  // Step 1: Get existing source_file values from DB
  console.log('Fetching existing source files from Supabase...');
  const { data: existingRows, error: fetchError } = await supabase
    .from('knowledge_chunks')
    .select('source_file');

  if (fetchError) {
    console.error('Failed to fetch existing source files:', fetchError.message);
    process.exit(1);
  }

  const existingFiles = new Set((existingRows || []).map((r) => r.source_file));
  console.log(`Found ${existingFiles.size} existing source files in DB.`);

  // Step 2: Process markdown files, skipping existing ones
  const allChunks: Chunk[] = [];
  let newFileCount = 0;
  let skippedFileCount = 0;

  for (const { dir, category, tier } of SUBDIRS) {
    const dirPath = path.join(kbRoot, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Skipping missing directory: ${dir}/`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md') && !shouldSkip(f));

    for (const filename of files) {
      const sourceFile = `${dir}/${filename}`;

      // Skip if already in DB
      if (existingFiles.has(sourceFile)) {
        skippedFileCount++;
        continue;
      }

      const filePath = path.join(dirPath, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = extractTitle(content);
      const topics = extractTopics(content);
      const occasions = detectOccasions(content);

      const metadata: Record<string, unknown> = {};
      if (topics.length > 0) metadata.topics = topics;
      if (occasions.length > 0) metadata.occasions = occasions;

      console.log(`NEW: ${sourceFile} (${topics.length} topics, ${occasions.length} occasions)`);

      const chunks = splitIntoChunks(content, sourceFile, category, tier, title, metadata);
      allChunks.push(...chunks);
      newFileCount++;

      console.log(`  Created ${chunks.length} chunks from ${filename}`);
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Skipped (already in DB): ${skippedFileCount} files`);
  console.log(`  New files to insert: ${newFileCount} files`);
  console.log(`  Total new chunks: ${allChunks.length}`);

  if (allChunks.length === 0) {
    console.log('\nNo new files to seed. All knowledge documents are already in DB.');
    process.exit(0);
  }

  // Step 3: Insert new chunks
  console.log(`\nInserting ${allChunks.length} new chunks into Supabase...`);

  const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const { error } = await supabase.from('knowledge_chunks').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${batchNum}/${totalBatches}:`, error.message);
      process.exit(1);
    }

    console.log(`  Inserted batch ${batchNum}/${totalBatches} (${batch.length} rows)`);
  }

  // Step 4: Verify
  const { count: totalCount } = await supabase
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true });

  const { count: nullEmbeddings } = await supabase
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null);

  console.log(`\nDone! Inserted ${allChunks.length} chunks from ${newFileCount} new files.`);
  console.log(`Total knowledge chunks in DB: ${totalCount ?? 'unknown'}`);
  console.log(`Chunks awaiting embeddings: ${nullEmbeddings ?? 'unknown'}`);
  console.log(`\nNext step: Run embedding generation:`);
  console.log(`  npx tsx lib/supabase/seeds/005_generate_knowledge_embeddings.ts`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
