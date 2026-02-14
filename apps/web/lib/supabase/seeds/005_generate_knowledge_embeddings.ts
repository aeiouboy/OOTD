/**
 * Seed Script: Generate Knowledge Chunk Embeddings
 *
 * Fetches all knowledge_chunks with NULL embeddings from Supabase,
 * generates embeddings via OpenRouter, and updates each row.
 *
 * Usage: npx tsx apps/web/lib/supabase/seeds/005_generate_knowledge_embeddings.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_OPENROUTER_API_KEY
 */

import { createServerClient } from '../client';
import { generateBatchEmbeddings } from '../../rag/embeddings';
import { RAG_CONFIG } from '../../rag/config';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env from apps/web/.env or .env.local
const webRoot = path.resolve(__dirname, '../../..');
const envLocalPath = path.join(webRoot, '.env.local');
const envPath = path.join(webRoot, '.env');
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : envPath });

const BATCH_SIZE = RAG_CONFIG.embedding.batchSize; // 50

interface KnowledgeRow {
  id: string;
  title: string | null;
  content: string;
}

function composeEmbeddingText(chunk: KnowledgeRow): string {
  if (chunk.title) {
    return `${chunk.title}. ${chunk.content}`;
  }
  return chunk.content;
}

async function main() {
  console.log('=== Knowledge Chunk Embedding Generation ===\n');

  const supabase = createServerClient();

  // Fetch all knowledge_chunks where embedding IS NULL
  const { data: chunks, error: fetchError } = await supabase
    .from('knowledge_chunks')
    .select('id, title, content')
    .is('embedding', null);

  if (fetchError) {
    console.error('Failed to fetch knowledge chunks:', fetchError.message);
    process.exit(1);
  }

  if (!chunks || chunks.length === 0) {
    console.log('No knowledge chunks with NULL embeddings found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${chunks.length} knowledge chunks with NULL embeddings.`);
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
  let totalEmbedded = 0;
  let totalFailed = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const start = batchIdx * BATCH_SIZE;
    const batch = chunks.slice(start, start + BATCH_SIZE);
    const texts = batch.map(composeEmbeddingText);

    try {
      const result = await generateBatchEmbeddings(texts, false);

      if (result.embeddings.length === batch.length) {
        // All succeeded -- bulk update
        for (let i = 0; i < batch.length; i++) {
          const { error: updateError } = await supabase
            .from('knowledge_chunks')
            .update({ embedding: JSON.stringify(result.embeddings[i]) })
            .eq('id', batch[i].id);

          if (updateError) {
            console.error(`  Failed to update chunk ${batch[i].id}: ${updateError.message}`);
            totalFailed++;
          } else {
            totalEmbedded++;
          }
        }
      } else {
        // Partial success -- fall back to individual embedding
        console.warn(`  Batch ${batchIdx + 1}: partial success (${result.embeddings.length}/${batch.length}). Falling back to individual processing.`);
        for (let i = 0; i < batch.length; i++) {
          try {
            const singleResult = await generateBatchEmbeddings([texts[i]], false);
            if (singleResult.embeddings.length === 1) {
              const { error: updateError } = await supabase
                .from('knowledge_chunks')
                .update({ embedding: JSON.stringify(singleResult.embeddings[0]) })
                .eq('id', batch[i].id);

              if (updateError) {
                console.error(`  Failed to update chunk ${batch[i].id}: ${updateError.message}`);
                totalFailed++;
              } else {
                totalEmbedded++;
              }
            } else {
              totalFailed++;
            }
          } catch (innerErr) {
            console.error(`  Failed to embed chunk ${batch[i].id}:`, innerErr);
            totalFailed++;
          }
        }
      }

      console.log(`Batch ${batchIdx + 1}/${totalBatches} complete (${totalEmbedded} total embedded)`);
    } catch (err) {
      console.error(`Batch ${batchIdx + 1}/${totalBatches} failed:`, err);
      totalFailed += batch.length;
      // Continue with next batch
    }
  }

  // Final verification
  const { count } = await supabase
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log('\n=== Summary ===');
  console.log(`Embedded this run: ${totalEmbedded}`);
  console.log(`Failed this run:   ${totalFailed}`);
  console.log(`Total knowledge chunks with embeddings in DB: ${count ?? 'unknown'}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
