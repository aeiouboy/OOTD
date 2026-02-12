#!/usr/bin/env node
/**
 * Fetches product image URLs from Central.co.th's Algolia index
 * and updates the master JSON with image_url values.
 * Uses search API with pagination (browse not allowed with this key).
 */
import { readFileSync, writeFileSync } from 'fs';

const ALGOLIA_APP_ID = 'JL22XXDCS9';
const ALGOLIA_API_KEY = '4e54e0448663400fb173d25f74e622fe';
const ALGOLIA_INDEX = 'twd_cds_en_products';
const BASE_IMAGE_URL = 'https://assets.central.co.th/';
const MASTER_JSON = './data/products/central-women-master.json';

async function searchAlgolia(query, filters, page = 0, hitsPerPage = 100) {
  const resp = await fetch(
    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        hitsPerPage,
        page,
        filters,
        attributesToRetrieve: [
          'name', 'brand_name', 'final_price', 'price',
          'image_url', 'thumbnail_url', 'url_key', 'sku', 'parent_sku',
        ],
      }),
    }
  );
  return resp.json();
}

// Multi-query: send up to 50 queries at once
async function multiSearch(queries) {
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
          params: `query=&hitsPerPage=1&filters=url_key:${q}&attributesToRetrieve=name,brand_name,final_price,price,image_url,thumbnail_url,url_key,sku,parent_sku`,
        })),
      }),
    }
  );
  return resp.json();
}

function extractUrlKey(url) {
  const match = url.match(/central\.co\.th\/en\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}

async function main() {
  console.log('Loading master JSON...');
  const masterData = JSON.parse(readFileSync(MASTER_JSON, 'utf-8'));
  const products = masterData.products;
  console.log(`Total products: ${products.length}`);

  // Build url_key lookup
  const urlKeyToProducts = new Map();
  for (const p of products) {
    const urlKey = extractUrlKey(p.url);
    if (urlKey) {
      urlKeyToProducts.set(urlKey, p);
    }
  }
  console.log(`Products with url_key: ${urlKeyToProducts.size}`);

  // Batch lookup using multi-query API (50 queries per batch)
  const urlKeys = [...urlKeyToProducts.keys()];
  const BATCH_SIZE = 50;
  let matched = 0;
  let matchedWithImage = 0;

  for (let i = 0; i < urlKeys.length; i += BATCH_SIZE) {
    const batch = urlKeys.slice(i, i + BATCH_SIZE);

    try {
      const result = await multiSearch(batch);

      if (result.results) {
        for (let j = 0; j < result.results.length; j++) {
          const hits = result.results[j].hits;
          if (hits && hits.length > 0) {
            const hit = hits[0];
            const product = urlKeyToProducts.get(batch[j]);
            if (product) {
              matched++;
              const imageUrl = hit.image_url || hit.thumbnail_url;
              if (imageUrl) {
                product.image_url = imageUrl.startsWith('http')
                  ? imageUrl
                  : `${BASE_IMAGE_URL}${imageUrl}`;
                matchedWithImage++;
              }
              // Also update price if available
              if (hit.final_price) product.price = hit.final_price;
              if (hit.price) product.original_price = hit.price;
            }
          }
        }
      } else if (result.message) {
        console.error(`Algolia error: ${result.message}`);
        // Fall back to individual requests
        break;
      }
    } catch (e) {
      console.error(`Batch error at ${i}: ${e.message}`);
    }

    // Progress
    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, urlKeys.length)}/${urlKeys.length} — matched: ${matched}, with image: ${matchedWithImage}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\nResults:`);
  console.log(`  Matched: ${matched}`);
  console.log(`  With image: ${matchedWithImage}`);
  console.log(`  Unmatched: ${urlKeys.length - matched}`);

  // Save updated master JSON
  const withImage = products.filter(p => p.image_url).length;
  console.log(`\nFinal: ${withImage}/${products.length} products have images`);

  console.log('Saving updated master JSON...');
  writeFileSync(MASTER_JSON, JSON.stringify(masterData, null, 2));
  console.log('Done!');
}

main().catch(console.error);
