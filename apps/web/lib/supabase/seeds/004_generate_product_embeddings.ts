/**
 * Seed Script: Generate Product Embeddings
 *
 * Fetches all products with NULL embeddings from Supabase,
 * generates embeddings via OpenRouter, and updates each row.
 *
 * Usage: npx tsx apps/web/lib/supabase/seeds/004_generate_product_embeddings.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_OPENROUTER_API_KEY
 */

import { createServerClient } from '../client';
import { generateBatchEmbeddings } from '../../rag/embeddings';
import { RAG_CONFIG } from '../../rag/config';

const BATCH_SIZE = RAG_CONFIG.embedding.batchSize; // 50

interface ProductRow {
  id: string;
  product_name: string;
  brand: string | null;
  product_description: string | null;
  category: string | null;
}

function composeEmbeddingText(product: ProductRow): string {
  const parts: string[] = [];

  if (product.product_name) {
    const namePart = product.brand
      ? `${product.product_name} by ${product.brand}`
      : product.product_name;
    parts.push(namePart);
  }

  if (product.product_description) {
    parts.push(product.product_description);
  }

  if (product.category) {
    parts.push(`Category: ${product.category}`);
  }

  return parts.join('. ');
}

async function main() {
  console.log('=== Product Embedding Generation ===\n');

  const supabase = createServerClient();

  // Fetch all products where embedding IS NULL
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, product_name, brand, product_description, category')
    .is('embedding', null);

  if (fetchError) {
    console.error('Failed to fetch products:', fetchError.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('No products with NULL embeddings found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${products.length} products with NULL embeddings.`);
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  const totalBatches = Math.ceil(products.length / BATCH_SIZE);
  let totalEmbedded = 0;
  let totalFailed = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const start = batchIdx * BATCH_SIZE;
    const batch = products.slice(start, start + BATCH_SIZE);
    const texts = batch.map(composeEmbeddingText);

    try {
      const result = await generateBatchEmbeddings(texts, false);

      // result.embeddings filters out nulls, so we need to track which succeeded.
      // generateBatchEmbeddings returns embeddings in order but removes nulls.
      // We process by checking the count matches, and fall back to individual if mismatch.
      if (result.embeddings.length === batch.length) {
        // All succeeded -- bulk update
        for (let i = 0; i < batch.length; i++) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ embedding: JSON.stringify(result.embeddings[i]) })
            .eq('id', batch[i].id);

          if (updateError) {
            console.error(`  Failed to update product ${batch[i].id}: ${updateError.message}`);
            totalFailed++;
          } else {
            totalEmbedded++;
          }
        }
      } else {
        // Partial success -- fall back to individual embedding for this batch
        console.warn(`  Batch ${batchIdx + 1}: partial success (${result.embeddings.length}/${batch.length}). Falling back to individual processing.`);
        for (let i = 0; i < batch.length; i++) {
          try {
            const singleResult = await generateBatchEmbeddings([texts[i]], false);
            if (singleResult.embeddings.length === 1) {
              const { error: updateError } = await supabase
                .from('products')
                .update({ embedding: JSON.stringify(singleResult.embeddings[0]) })
                .eq('id', batch[i].id);

              if (updateError) {
                console.error(`  Failed to update product ${batch[i].id}: ${updateError.message}`);
                totalFailed++;
              } else {
                totalEmbedded++;
              }
            } else {
              totalFailed++;
            }
          } catch (innerErr) {
            console.error(`  Failed to embed product ${batch[i].id}:`, innerErr);
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
    .from('products')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log('\n=== Summary ===');
  console.log(`Embedded this run: ${totalEmbedded}`);
  console.log(`Failed this run:   ${totalFailed}`);
  console.log(`Total products with embeddings in DB: ${count ?? 'unknown'}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
