/**
 * Fixes products in Supabase that have promotional overlay images
 * (image_url containing 'Product-Overlay') by fetching real product
 * images from Central.co.th's Algolia index.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });

const ALGOLIA_APP_ID = 'JL22XXDCS9';
const ALGOLIA_API_KEY = '4e54e0448663400fb173d25f74e622fe';
const ALGOLIA_INDEX = 'twd_cds_en_products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function extractUrlKey(url: string): string | null {
  const match = url.match(/central\.co\.th\/en\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}

async function multiSearch(queries: string[]) {
  const resp = await fetch(
    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/queries`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: queries.map(q => ({
          indexName: ALGOLIA_INDEX,
          params: `query=&hitsPerPage=1&filters=url_key:${q}&attributesToRetrieve=name,image_url,thumbnail_url,url_key`,
        })),
      }),
    }
  );
  return resp.json();
}

async function main() {
  console.log('=== Fix Overlay Images ===\n');

  // 1. Fetch all products with overlay images
  console.log('Fetching products with overlay images from Supabase...');
  const { data: overlayProducts, error } = await supabase
    .from('products')
    .select('id, product_name, link, image_url')
    .like('image_url', '%Product-Overlay%');

  if (error) {
    console.error('Supabase query error:', error);
    process.exit(1);
  }

  console.log(`Found ${overlayProducts!.length} products with overlay images\n`);

  if (!overlayProducts || overlayProducts.length === 0) {
    console.log('Nothing to fix!');
    return;
  }

  // 2. Build url_key map
  const productsByUrlKey = new Map<string, typeof overlayProducts[0]>();
  let noUrlKey = 0;
  for (const p of overlayProducts) {
    if (!p.link) { noUrlKey++; continue; }
    const urlKey = extractUrlKey(p.link);
    if (urlKey) {
      productsByUrlKey.set(urlKey, p);
    } else {
      noUrlKey++;
    }
  }
  console.log(`Products with url_key: ${productsByUrlKey.size}`);
  if (noUrlKey > 0) console.log(`Products without url_key: ${noUrlKey}`);

  // 3. Batch fetch from Algolia
  const urlKeys = [...productsByUrlKey.keys()];
  const BATCH_SIZE = 50;
  let matched = 0;
  let updatedCount = 0;
  let failedUpdates = 0;
  const updates: Array<{ id: string; image_url: string }> = [];

  console.log(`\nFetching real images from Algolia (${Math.ceil(urlKeys.length / BATCH_SIZE)} batches)...\n`);

  for (let i = 0; i < urlKeys.length; i += BATCH_SIZE) {
    const batch = urlKeys.slice(i, i + BATCH_SIZE);

    try {
      const result = await multiSearch(batch);

      if (result.results) {
        for (let j = 0; j < result.results.length; j++) {
          const hits = result.results[j].hits;
          if (hits && hits.length > 0) {
            const hit = hits[0];
            const product = productsByUrlKey.get(batch[j]);
            if (product) {
              matched++;
              const imageUrl = hit.image_url || hit.thumbnail_url;
              if (imageUrl) {
                const fullUrl = imageUrl.startsWith('http')
                  ? imageUrl
                  : `https://assets.central.co.th/${imageUrl}`;

                // Only update if it's a real product image (not another overlay)
                if (!fullUrl.includes('Product-Overlay')) {
                  updates.push({ id: product.id, image_url: fullUrl });
                }
              }
            }
          }
        }
      } else if (result.message) {
        console.error(`Algolia error: ${result.message}`);
      }
    } catch (e: any) {
      console.error(`Batch error at ${i}: ${e.message}`);
    }

    const progress = Math.min(i + BATCH_SIZE, urlKeys.length);
    if ((i / BATCH_SIZE) % 3 === 0 || progress === urlKeys.length) {
      console.log(`  Progress: ${progress}/${urlKeys.length} — matched: ${matched}, real images: ${updates.length}`);
    }

    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\nAlgolia results:`);
  console.log(`  Matched: ${matched}`);
  console.log(`  Real images found: ${updates.length}`);
  console.log(`  Still no real image: ${overlayProducts.length - updates.length}`);

  // 4. Update Supabase
  if (updates.length === 0) {
    console.log('\nNo updates to apply.');
    return;
  }

  console.log(`\nUpdating ${updates.length} products in Supabase...`);

  for (let i = 0; i < updates.length; i++) {
    const { id, image_url } = updates[i];
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url })
      .eq('id', id);

    if (updateError) {
      failedUpdates++;
      if (failedUpdates <= 3) {
        console.error(`  Update failed for ${id}: ${updateError.message}`);
      }
    } else {
      updatedCount++;
    }

    if ((i + 1) % 100 === 0 || i === updates.length - 1) {
      console.log(`  Updated: ${i + 1}/${updates.length}`);
    }
  }

  // 5. Verify
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .like('image_url', '%Product-Overlay%');

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Failed: ${failedUpdates}`);
  console.log(`Remaining overlay images: ${count}`);
}

main().catch(console.error);
