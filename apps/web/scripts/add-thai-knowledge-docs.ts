/**
 * Add Thai/Bilingual Knowledge Documents to Vectra Index
 *
 * Adds 10 bilingual (Thai + English) knowledge documents to the Vectra
 * vector store for improved cross-language similarity search.
 *
 * Thai queries like "ชุดไปงานแต่ง" get low cosine similarity (~0.25) against
 * English-only documents. By including Thai keywords in the document text,
 * the embeddings capture both Thai and English semantic space, boosting
 * retrieval for Thai-speaking users.
 *
 * Usage:
 *   npx tsx scripts/add-thai-knowledge-docs.ts
 *
 * Requirements:
 *   - OPENROUTER_API_KEY in .env.local
 *   - Existing Vectra index at data/vector-store/fashion-knowledge/index.json
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// ─── Bilingual Document Definitions ─────────────────────────────────────────

interface BilingualDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  topics: string[];
  seasonality?: string[];
  occasions?: string[];
}

const BILINGUAL_DOCS: BilingualDoc[] = [
  {
    id: 'thai_bilingual_auspicious_colors',
    title: 'สีมงคล ทฤษฎีสี Thai Auspicious Colors and Color Theory',
    content:
      'สีมงคลประจำวันเกิด วันจันทร์สีเหลือง วันอังคารสีชมพู วันพุธสีเขียว วันพฤหัสบดีสีส้ม วันศุกร์สีฟ้า วันเสาร์สีม่วง วันอาทิตย์สีแดง. Thai auspicious birth day colors: Monday Yellow (wealth), Tuesday Pink (love), Wednesday Green (creativity), Thursday Orange (wisdom), Friday Blue (romance), Saturday Purple (protection), Sunday Red (success). Color theory for outfits: complementary colors create contrast, analogous colors create harmony. Neutral colors (black, white, beige, grey) pair with everything.',
    category: 'color_theory',
    topics: ['auspicious_colors', 'thai_culture', 'color', 'birth_day'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_occasion_dress_codes',
    title: 'ชุดไปงาน ชุดทำงาน ชุดไปวัด Thai Occasion Dress Codes',
    content:
      'ชุดไปงานแต่งงาน ชุดไปงานศพ ชุดไปวัด ชุดทำงาน dress code ไทย. Thai occasion dress codes: Wedding (งานแต่ง) - women wear silk or elegant dresses in bright colors, avoid black/white. Funeral (งานศพ) - black or dark colors only, conservative and modest. Temple (วัด) - cover shoulders and knees, no revealing clothes, white/cream preferred. Work (ทำงาน) - business casual or formal, depends on company culture.',
    category: 'occasions',
    topics: ['occasions', 'dress_code', 'thai_culture', 'wedding', 'funeral', 'temple', 'work'],
    occasions: ['wedding', 'funeral', 'temple', 'work'],
  },
  {
    id: 'thai_bilingual_casual_lifestyle',
    title: 'ชุดคาสชวล ชุดไปคาเฟ่ ชุดเที่ยว Casual Lifestyle Outfits',
    content:
      'ชุดคาสชวล ชุดลำลอง ชุดไปคาเฟ่ ชุดไปเที่ยว ชุดสบายๆ casual outfit cafe style. Casual outfit ideas for Thai lifestyle: Cafe hopping - relaxed chic with jeans/wide-leg pants and nice top. Shopping mall - comfortable but stylish, sneakers ok. Weekend outing - casual dress or shorts with statement accessories. Beach/resort - linen, light fabrics, sandals. Layer with light cardigan for air-conditioned spaces.',
    category: 'occasions',
    topics: ['casual', 'lifestyle', 'cafe', 'shopping', 'weekend'],
    occasions: ['casual', 'shopping'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_body_type_guide',
    title: 'รูปร่าง สัดส่วน เตี้ย สูง Body Type Styling Guide',
    content:
      'รูปร่าง สัดส่วน เตี้ย สูง อ้วน ผอม petite plus size body type styling. Body type styling: Petite (เตี้ย/ตัวเล็ก) - high-waisted bottoms, vertical stripes, monochrome, avoid oversized. Tall (สูง) - can wear any length, horizontal patterns ok. Apple shape - empire waist, A-line, V-neck. Pear shape - structured shoulders, A-line skirts. Hourglass - wrap dresses, belted styles. Plus size (ไซส์ใหญ่) - structured fabrics, proper fit over loose, dark colors for slimming.',
    category: 'body_types',
    topics: ['body_type', 'petite', 'plus_size', 'styling_solutions'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_climate_fabric',
    title: 'ผ้า อากาศร้อน ฤดูฝน Thai Climate Fabric Guide',
    content:
      'ผ้า เนื้อผ้า อากาศร้อน ฤดูฝน แดด ร้อนชื้น fabric Thai climate hot humid. Best fabrics for Thai climate: Hot season (มี.ค.-พ.ค.) - cotton, linen, rayon, light colors. Rainy season (มิ.ย.-ต.ค.) - quick-dry polyester blend, dark colors hide splashes, waterproof shoes. Cool season (พ.ย.-ก.พ.) - light layers, denim jacket, cardigan. Avoid: heavy wool, thick denim, dark polyester in summer. Thai humidity tip: choose breathable, moisture-wicking fabrics.',
    category: 'styling_rules',
    topics: ['fabric', 'thai_climate', 'weather', 'seasons'],
    seasonality: ['hot', 'rainy', 'cool'],
  },
  {
    id: 'thai_bilingual_brand_sizing',
    title: 'ไซส์ แบรนด์ Zara Uniqlo Brand Sizing Guide Thailand',
    content:
      'ไซส์ แบรนด์ ขนาด size chart Zara Uniqlo H&M Jaspal CPS. Brand sizing guide for Thai shoppers: Zara - runs small, size up 1. H&M - true to European size. Uniqlo - Asian fit, true to size for Thai body. Jaspal - Thai brand, fits Thai body well. CPS Chaps - local Thai sizing. Mango - similar to Zara, slightly bigger. Size conversion: Thai S = US XS/S, Thai M = US S/M, Thai L = US M/L. Always check brand-specific size chart.',
    category: 'brand_intelligence',
    topics: ['brand_sizing', 'sizing_guide', 'thai_brands', 'international_brands'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_wedding_funeral',
    title: 'ชุดไปงานแต่ง ชุดไปงานศพ Wedding Funeral Dress Code',
    content:
      'ชุดไปงานแต่ง ชุดไปงานศพ งานบวช งานทำบุญ formal Thai ceremonies. Thai ceremony dress codes: Wedding reception (งานเลี้ยง) - cocktail dress or evening gown, Thai silk for traditional. Colors: jewel tones, pastels, gold/silver ok, AVOID white (bride\'s color) and black. Buddhist ordination (งานบวช) - white or cream, modest coverage. Funeral/cremation (งานศพ) - all black, conservative, closed-toe shoes. Merit-making (ทำบุญ) - white top preferred, modest.',
    category: 'occasions',
    topics: ['wedding', 'funeral', 'thai_culture', 'ceremonies', 'dress_code'],
    occasions: ['wedding', 'funeral', 'temple'],
  },
  {
    id: 'thai_bilingual_work_office',
    title: 'ชุดทำงาน ออฟฟิศ สัมภาษณ์ Work Office Interview Outfits',
    content:
      'ชุดทำงาน ออฟฟิศ สัมภาษณ์งาน work outfit office business. Thai work outfit guide: Corporate office - blazer, slacks/pencil skirt, closed shoes. Creative office - smart casual, can add personality. Startup - casual but neat, no shorts. Job interview (สัมภาษณ์) - formal, neutral colors, minimal accessories. Teaching - modest, professional. Government office - conservative, formal. Bangkok offices are cold (AC), keep a cardigan/blazer handy.',
    category: 'occasions',
    topics: ['work', 'office', 'interview', 'dress_code', 'business'],
    occasions: ['work', 'business', 'interview'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_date_party',
    title: 'ชุดออกเดท ชุดปาร์ตี้ ชุดสังสรรค์ Date Party Outfits',
    content:
      'ชุดออกเดท ชุดปาร์ตี้ ชุดสังสรรค์ ชุดไปบาร์ date night party outfit. Date and party outfits: First date (เดทแรก) - smart casual, shows personality, comfortable shoes for walking. Fancy dinner (ดินเนอร์) - little black dress or dressy separates. Rooftop bar - cocktail attire, heels ok. Club/party (ปาร์ตี้) - bold colors, statement pieces, comfortable dancing shoes. Birthday party (สังสรรค์) - festive, can be more playful. House party - casual chic.',
    category: 'occasions',
    topics: ['date', 'party', 'nightlife', 'social', 'dress_code'],
    occasions: ['date_night', 'party'],
    seasonality: ['all'],
  },
  {
    id: 'thai_bilingual_petite_styling',
    title: 'ตัวเล็ก เตี้ย ขาสั้น Petite Styling Thai Women',
    content:
      'ตัวเล็ก เตี้ย ขาสั้น สาวไซส์เล็ก petite Thai women short styling. Petite styling for Thai women: Average Thai woman height ~157cm. Key tips: High-waisted everything (กางเกงเอวสูง), cropped tops to show waist, midi not maxi length, pointed-toe shoes elongate legs, V-necklines create vertical line, monochrome outfits look taller, platform shoes add height comfortably, avoid ankle straps (cut leg line), small bags proportional to frame, tailored fit over baggy.',
    category: 'body_types',
    topics: ['petite', 'body_type', 'thai_proportions', 'styling_rules'],
    seasonality: ['all'],
  },
];

// ─── Vectra Index Types ─────────────────────────────────────────────────────

interface VectraItem {
  id: string;
  metadata: Record<string, unknown>;
  vector: number[];
  norm: number;
}

interface VectraIndex {
  version: number;
  metadata_config: Record<string, unknown>;
  items: VectraItem[];
}

// ─── Embedding Generation ───────────────────────────────────────────────────

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found. Set it in .env.local');
  }

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ootday.app',
      'X-Title': 'OOTDay Fashion Assistant',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.data?.[0]?.embedding) {
    throw new Error('Invalid embedding response format');
  }

  return data.data[0].embedding;
}

function computeL2Norm(vector: number[]): number {
  let sum = 0;
  for (const v of vector) {
    sum += v * v;
  }
  return Math.sqrt(sum);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const indexPath = path.join(__dirname, '..', 'data', 'vector-store', 'fashion-knowledge', 'index.json');

  // Read existing index
  console.log('Reading existing Vectra index...');
  if (!fs.existsSync(indexPath)) {
    console.error(`Index file not found at: ${indexPath}`);
    process.exit(1);
  }

  const indexData: VectraIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const existingCount = indexData.items.length;
  console.log(`Found ${existingCount} existing documents\n`);

  // Check for duplicates
  const existingIds = new Set(indexData.items.map((item) => item.id));
  const docsToAdd = BILINGUAL_DOCS.filter((doc) => {
    if (existingIds.has(doc.id)) {
      console.log(`  Skipping (already exists): ${doc.id}`);
      return false;
    }
    return true;
  });

  if (docsToAdd.length === 0) {
    console.log('\nAll bilingual documents already exist in the index. Nothing to add.');
    process.exit(0);
  }

  console.log(`\nAdding ${docsToAdd.length} bilingual documents...\n`);

  // Generate embeddings and add to index
  let added = 0;
  for (const doc of docsToAdd) {
    try {
      // Embed the full content (title + content) for best semantic coverage
      const textToEmbed = `${doc.title}\n${doc.content}`;
      console.log(`  [${added + 1}/${docsToAdd.length}] Embedding: ${doc.id}`);

      const vector = await generateEmbedding(textToEmbed);
      const norm = computeL2Norm(vector);

      const vectraItem: VectraItem = {
        id: doc.id,
        metadata: {
          documentId: doc.id,
          chunkIndex: 0,
          category: doc.category,
          title: doc.title,
          topics: doc.topics,
          seasonality: doc.seasonality || ['all'],
          ...(doc.occasions ? { occasions: doc.occasions } : {}),
          lastUpdated: new Date().toISOString(),
          tokenCount: Math.ceil(textToEmbed.length / 4), // rough estimate
          text: `${doc.title}: ${doc.content}`,
        },
        vector,
        norm,
      };

      indexData.items.push(vectraItem);
      added++;
      console.log(`    -> OK (vector dims: ${vector.length}, norm: ${norm.toFixed(6)})`);

      // Small delay to avoid rate limiting
      if (added < docsToAdd.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`    -> FAILED: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Write updated index
  if (added > 0) {
    console.log(`\nWriting updated index to ${indexPath}...`);
    fs.writeFileSync(indexPath, JSON.stringify(indexData), 'utf-8');
    console.log(`Done. Index now has ${indexData.items.length} documents (was ${existingCount}, added ${added}).`);
  } else {
    console.log('\nNo documents were added (all failed or already exist).');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
