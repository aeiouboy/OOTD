/**
 * Knowledge Base Seeding Script
 *
 * Migrates fashion knowledge from fashion-summaries.ts to the RAG vector store.
 * Transforms structured fashion expertise into searchable vector embeddings.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 *
 * Usage:
 *   npx tsx scripts/seed-knowledge.ts [options]
 *
 * Options:
 *   --clear, -c     Clear existing knowledge base before seeding
 *   --dry-run, -d   Preview documents without indexing
 *   --verbose, -v   Enable detailed logging
 *   --help, -h      Show help information
 *
 * Examples:
 *   npx tsx scripts/seed-knowledge.ts                    # Normal seeding
 *   npx tsx scripts/seed-knowledge.ts --clear --verbose  # Clear and seed with logs
 *   npx tsx scripts/seed-knowledge.ts --dry-run          # Preview only
 *
 * Requirements:
 *   - OPENROUTER_API_KEY environment variable set in .env.local
 *   - Write permissions to vector store directory
 *
 * Exit codes:
 *   0 - Success
 *   1 - Failure
 */

import * as dotenv from 'dotenv';
import {
  createKnowledgeDocument,
  indexDocuments,
  clearKnowledgeBase,
  validateKnowledgeDocument,
  estimateDocumentStorage,
} from '../lib/rag/knowledge-base';
import {
  FASHION_FUNDAMENTALS,
  THAI_CULTURE_FASHION,
  BODY_TYPE_STYLING,
  OCCASION_DRESS_CODES,
  BRAND_SIZING,
  FASHION_KNOWLEDGE_METADATA,
} from '../lib/knowledge/fashion-summaries';
import type { KnowledgeDocument } from '../lib/rag/types';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * CLI Options interface
 */
interface CLIOptions {
  clear: boolean;
  dryRun: boolean;
  verbose: boolean;
  help: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);

  return {
    clear: args.includes('--clear') || args.includes('-c'),
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
═══════════════════════════════════════════
🌱 OOTDay Knowledge Base Seeding Tool
═══════════════════════════════════════════

Migrates fashion knowledge from fashion-summaries.ts to RAG vector store.

USAGE:
  npx tsx scripts/seed-knowledge.ts [options]

OPTIONS:
  --clear, -c     Clear existing knowledge base before seeding
  --dry-run, -d   Preview documents without indexing (no changes)
  --verbose, -v   Enable detailed logging and statistics
  --help, -h      Show this help message

EXAMPLES:
  # Normal seeding
  npx tsx scripts/seed-knowledge.ts

  # Clear existing data and seed fresh
  npx tsx scripts/seed-knowledge.ts --clear

  # Preview what will be seeded without making changes
  npx tsx scripts/seed-knowledge.ts --dry-run --verbose

  # Full seed with detailed logging
  npx tsx scripts/seed-knowledge.ts --clear --verbose

REQUIREMENTS:
  - OPENROUTER_API_KEY set in .env.local
  - Write permissions to vector store directory

EXIT CODES:
  0 = Success
  1 = Failure
`);
}

/**
 * Format object as readable markdown-style content
 * Recursively converts nested objects to natural language text
 */
function formatObjectAsContent(obj: any, indentLevel: number = 0): string {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => `• ${formatObjectAsContent(item, 0)}`).join('\n');
  }

  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${indent}${label}:`);
        lines.push(formatObjectAsContent(value, indentLevel + 1));
      } else {
        const formattedValue = formatObjectAsContent(value, 0);
        lines.push(`${indent}${label}: ${formattedValue}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate stable document ID
 */
function generateDocumentId(category: string, section: string): string {
  return `${category}_${section}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Transform FASHION_FUNDAMENTALS into knowledge documents
 */
function createFashionFundamentalsDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];
  const lastUpdated = FASHION_KNOWLEDGE_METADATA.lastUpdated;

  // Color Theory
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('fashion_fundamentals', 'color_theory'),
      category: 'color_theory',
      title: 'Fashion Fundamentals - Color Theory',
      content: `Color Theory for Fashion:

${formatObjectAsContent(FASHION_FUNDAMENTALS.colorTheory)}

Key Rules:
- Basic combinations: Monochromatic, analogous, and complementary all work well
- Outfit balance formula: 70% base neutral + 20% complementary + 10% accent color
- Safe rule: Neutrals (black, white, beige, gray) paired with any color always works
- Avoid: Pairing dull colors with harsh colors together`,
      topics: ['color', 'combinations', 'outfit_balance', 'neutrals'],
      source: 'fashion-summaries.ts',
      seasonality: ['all'],
    })
  );

  // Fabrics
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('fashion_fundamentals', 'fabrics'),
      category: 'styling_rules',
      title: 'Fashion Fundamentals - Fabrics for Thai Climate',
      content: `Fabrics for Thai Climate:

${formatObjectAsContent(FASHION_FUNDAMENTALS.fabrics)}

Best fabrics for Thai heat: Cotton, linen, modal, and technical moisture-wicking materials.
Fabrics to avoid: Heavy polyester and thick non-breathable synthetics.
Thai reality: Air conditioning is everywhere (18-20°C indoors), so layers are needed year-round.
Rainy season advice: Choose quick-dry fabrics, dark colors, and water-resistant shoes.`,
      topics: ['fabric', 'thai_climate', 'weather', 'materials'],
      source: 'fashion-summaries.ts',
      seasonality: ['all'],
    })
  );

  // Fit & Proportions
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('fashion_fundamentals', 'fit'),
      category: 'styling_rules',
      title: 'Fashion Fundamentals - Fit & Proportions',
      content: `Fit & Proportions:

${formatObjectAsContent(FASHION_FUNDAMENTALS.fit)}

Perfect fit checklist:
• Shoulders align at seams
• No pulling or gaping
• Sleeves are proper length
• Coverage in sitting position

Thai petite tips: High-waist styles create magic! Tailoring is affordable (฿200-500).
Proportion tips: Monochromatic outfits for height, V-necks elongate, high-waist lengthens legs.
Golden rule: Proportion matters more than size - where clothes HIT your body matters more than the size number.`,
      topics: ['fit', 'proportions', 'petite', 'tailoring'],
      source: 'fashion-summaries.ts',
      seasonality: ['all'],
    })
  );

  // Weather Strategies
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('fashion_fundamentals', 'weather'),
      category: 'styling_rules',
      title: 'Fashion Fundamentals - Weather Strategies',
      content: `Weather Strategies for Thai Climate:

${formatObjectAsContent(FASHION_FUNDAMENTALS.weather)}

Hot season (Mar-May): Light colors, breathable fabrics, always carry cardigan for AC.
Rainy season (May-Oct): Dark colors, above-ankle lengths, waterproof shoes.
Cool season (Nov-Feb): Layers work! Light jackets and denim are perfectly normal.
AC survival tip: Always carry a cardigan or scarf - malls can be freezing!`,
      topics: ['weather', 'thai_climate', 'seasons', 'layers'],
      source: 'fashion-summaries.ts',
      seasonality: ['hot', 'rainy', 'cool'],
    })
  );

  return docs;
}

/**
 * Transform THAI_CULTURE_FASHION into knowledge documents
 */
function createThaiCultureDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];

  // Values & Etiquette
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('thai_culture', 'values_etiquette'),
      category: 'thai_culture',
      title: 'Thai Culture - Fashion Values & Etiquette',
      content: `Thai Fashion Values & Etiquette:

Core Values:
${formatObjectAsContent(THAI_CULTURE_FASHION.values)}

Etiquette Guidelines:
${formatObjectAsContent(THAI_CULTURE_FASHION.etiquette)}

In Thai culture, appearance is judged and effort is appreciated. Modesty is important - shoulders and knees should be covered in formal and temple settings. Brand awareness is a status symbol and dressing appropriately for social hierarchy matters.`,
      topics: ['thai_culture', 'etiquette', 'values', 'modesty'],
      source: 'fashion-summaries.ts',
    })
  );

  // Birth Day Colors (Auspicious)
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('thai_culture', 'birth_day_colors'),
      category: 'color_theory',
      title: 'Thai Culture - Birth Day Auspicious Colors',
      content: `Thai Birth Day Auspicious Colors:

${formatObjectAsContent(THAI_CULTURE_FASHION.birthDayColors)}

Each day of the week has its own auspicious color with specific meanings:
- Monday: Yellow for wealth and abundance
- Tuesday: Pink/Red for love, power, and courage
- Wednesday Day: Green for growth and wisdom
- Wednesday Night: Gray/Dark for mystery and protection
- Thursday: Orange for wisdom, prosperity, and luck (BEST!)
- Friday: Blue for love, happiness, and beauty
- Saturday: Purple/Black for stability (slow but steady)
- Sunday: Red for power, leadership, and victory`,
      topics: ['auspicious_colors', 'thai_culture', 'birth_day', 'fortune'],
      source: 'fashion-summaries.ts',
    })
  );

  // Fortune-Specific Colors
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('thai_culture', 'fortune_colors'),
      category: 'color_theory',
      title: 'Thai Culture - Fortune-Specific Colors',
      content: `Fortune-Specific Colors:

${formatObjectAsContent(THAI_CULTURE_FASHION.fortuneColors)}

Different colors attract different types of fortune:
- Financial luck: Gold, yellow, emerald, orange-gold
- Love luck: Pink (Tuesday), blue (Friday) - BEST choices
- Career success: Orange (Thursday), green (Wednesday), red (Sunday) - for leaders
- Health: Green, blue pastels, orange
- Windfall/Lottery: Orange-gold (Thursday) - BEST for lottery luck!`,
      topics: ['auspicious_colors', 'fortune', 'financial', 'love', 'career'],
      source: 'fashion-summaries.ts',
    })
  );

  // Color Sensitivity by Occasion
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('thai_culture', 'color_sensitivity'),
      category: 'thai_culture',
      title: 'Thai Culture - Color Sensitivity by Occasion',
      content: `Color Sensitivity for Different Occasions:

${formatObjectAsContent(THAI_CULTURE_FASHION.colorSensitivity)}

Important cultural color rules:
- Royal events: Yellow shows respect for royalty
- Funerals: Black or white ONLY (be conservative)
- Weddings: NEVER wear white (that's for the bride) or all black, avoid red
- Happy occasions: NEVER wear all black (death association)
- Temples: White preferred, modest colors, avoid harsh colors`,
      topics: ['occasions', 'etiquette', 'color_sensitivity', 'royal', 'funeral', 'wedding'],
      occasions: ['wedding', 'funeral', 'temple', 'royal_events'],
      source: 'fashion-summaries.ts',
    })
  );

  // Regional Differences
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('thai_culture', 'regional'),
      category: 'thai_culture',
      title: 'Thai Culture - Regional Fashion Differences',
      content: `Regional Fashion Differences in Thailand:

${formatObjectAsContent(THAI_CULTURE_FASHION.regional)}

Fashion norms vary across Thailand:
- Bangkok: Most fashion-forward, international influence OK, Western trends accepted
- Chiang Mai: Bohemian style appreciated, more casual, accommodates cooler climate
- Phuket: Beach casual is standard, more revealing OK in resort areas
- Isaan (Northeast): Traditional dress values, conservative, functional over fashion
- Deep South: Strong Muslim influence, must cover shoulders and knees`,
      topics: ['regional', 'bangkok', 'chiangmai', 'phuket', 'isaan'],
      source: 'fashion-summaries.ts',
    })
  );

  return docs;
}

/**
 * Transform BODY_TYPE_STYLING into knowledge documents
 */
function createBodyTypeDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];

  // Individual Body Types
  const bodyTypes = BODY_TYPE_STYLING.types;

  for (const [typeName, typeData] of Object.entries(bodyTypes)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('body_type', typeName),
        category: 'body_types',
        title: `Body Type Styling - ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}`,
        content: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} Body Type:

${formatObjectAsContent(typeData)}

Body Features: ${typeData.feature}
Best Styles: ${Array.isArray(typeData.bestStyles) ? typeData.bestStyles.join(', ') : typeData.bestStyles}
Styles to Avoid: ${Array.isArray(typeData.avoid) ? typeData.avoid.join(', ') : typeData.avoid}`,
        topics: ['body_type', typeName, 'styling_solutions'],
        gender: ['women'],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // Thai Proportions
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('body_type', 'thai_proportions'),
      category: 'body_types',
      title: 'Body Type Styling - Thai Proportions',
      content: `Thai-Specific Body Proportions:

${formatObjectAsContent(BODY_TYPE_STYLING.thaiProportions)}

Average Thai height: 155-160cm (petite by international standards)
Most common types: Pear or rectangle body types
Common issue: Long torso + short legs OR short torso + long legs
Solution: Petite sizing combined with tailoring (very affordable in Thailand!)`,
      topics: ['body_type', 'thai_proportions', 'petite'],
      source: 'fashion-summaries.ts',
    })
  );

  // Petite Rules
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('body_type', 'petite_rules'),
      category: 'body_types',
      title: 'Body Type Styling - Petite Golden Rules',
      content: `Petite Golden Rules (155-160cm):

Do's:
${Array.isArray(BODY_TYPE_STYLING.petiteRules.do) ? BODY_TYPE_STYLING.petiteRules.do.map(item => `• ${item}`).join('\n') : BODY_TYPE_STYLING.petiteRules.do}

Don'ts:
${Array.isArray(BODY_TYPE_STYLING.petiteRules.avoid) ? BODY_TYPE_STYLING.petiteRules.avoid.map(item => `• ${item}`).join('\n') : BODY_TYPE_STYLING.petiteRules.avoid}

Key tip: High-waist EVERYTHING lengthens legs - it's magic!`,
      topics: ['petite', 'proportions', 'styling_rules'],
      source: 'fashion-summaries.ts',
    })
  );

  // Problem Areas
  const problemAreas = BODY_TYPE_STYLING.problemAreas;

  for (const [areaName, areaData] of Object.entries(problemAreas)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('problem_area', areaName),
        category: 'body_types',
        title: `Problem Area Solutions - ${areaName.charAt(0).toUpperCase() + areaName.slice(1).replace(/([A-Z])/g, ' $1')}`,
        content: `Styling Solutions for ${areaName.replace(/([A-Z])/g, ' $1')}:

Do's:
${Array.isArray(areaData.do) ? areaData.do.map((item: string) => `• ${item}`).join('\n') : areaData.do}

Don'ts:
${Array.isArray(areaData.avoid) ? areaData.avoid.map((item: string) => `• ${item}`).join('\n') : areaData.avoid}`,
        topics: ['styling_solutions', 'problem_areas', areaName],
        source: 'fashion-summaries.ts',
      })
    );
  }

  return docs;
}

/**
 * Transform OCCASION_DRESS_CODES into knowledge documents
 */
function createOccasionDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];

  // Work Occasions
  const workTypes = OCCASION_DRESS_CODES.work;

  for (const [workType, workData] of Object.entries(workTypes)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('occasion_work', workType),
        category: 'occasions',
        title: `Work Dress Code - ${workType.charAt(0).toUpperCase() + workType.slice(1).replace(/([A-Z])/g, ' $1')}`,
        content: `${workType.charAt(0).toUpperCase() + workType.slice(1).replace(/([A-Z])/g, ' $1')} Work Dress Code:

${formatObjectAsContent(workData)}

Description: ${workData.description}
Style Guidelines: ${workData.style}
What to Avoid: ${workData.avoid}
${'key' in workData ? `Key Tip: ${workData.key}` : ''}`,
        topics: ['work', 'dress_code', workType],
        occasions: ['work', 'business'],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // Social Events
  const socialTypes = OCCASION_DRESS_CODES.social;

  for (const [socialType, socialData] of Object.entries(socialTypes)) {
    const content = formatObjectAsContent(socialData);

    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('occasion_social', socialType),
        category: 'occasions',
        title: `Social Event - ${socialType.charAt(0).toUpperCase() + socialType.slice(1)}`,
        content: `${socialType.charAt(0).toUpperCase() + socialType.slice(1)} Dress Code:

${content}`,
        topics: ['social', socialType, 'dress_code', 'thai_culture'],
        occasions: [socialType],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // Shopping Scenarios
  const shoppingTypes = OCCASION_DRESS_CODES.shopping;

  for (const [shopType, shopData] of Object.entries(shoppingTypes)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('occasion_shopping', shopType),
        category: 'occasions',
        title: `Shopping Dress Code - ${shopType.charAt(0).toUpperCase() + shopType.slice(1)}`,
        content: `${shopType.charAt(0).toUpperCase() + shopType.slice(1)} Shopping:

${formatObjectAsContent(shopData)}`,
        topics: ['shopping', 'thai_culture', shopType],
        occasions: ['shopping'],
        source: 'fashion-summaries.ts',
      })
    );
  }

  return docs;
}

/**
 * Transform BRAND_SIZING into knowledge documents
 */
function createBrandSizingDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];

  // Thai Brands
  const thaiBrands = BRAND_SIZING.thaiBrands;

  for (const [brandName, brandData] of Object.entries(thaiBrands)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('brand_thai', brandName),
        category: 'brand_intelligence',
        title: `Brand Sizing - ${brandName.charAt(0).toUpperCase() + brandName.slice(1)}`,
        content: `${brandName.charAt(0).toUpperCase() + brandName.slice(1)} (Thai Brand):

${formatObjectAsContent(brandData)}

Sizing: ${brandData.sizing}
Description: ${brandData.description}
${'note' in brandData ? `Note: ${brandData.note}` : ''}`,
        topics: ['brand_sizing', 'thai_brands', 'central_group', brandName],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // International Brands - Size Up
  const intlSizeUp = BRAND_SIZING.internationalSizeUp;

  for (const [brandName, brandData] of Object.entries(intlSizeUp)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('brand_intl_sizeup', brandName),
        category: 'brand_intelligence',
        title: `Brand Sizing - ${brandName.charAt(0).toUpperCase() + brandName.slice(1)} (Size Up)`,
        content: `${brandName.charAt(0).toUpperCase() + brandName.slice(1)} (International - SIZE UP):

${formatObjectAsContent(brandData)}

Warning: ${brandData.warning}
Advice: ${brandData.advice}
Note: ${brandData.note}`,
        topics: ['brand_sizing', 'international_brands', 'size_up', brandName],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // International Brands - True to Size
  const intlTrueSize = BRAND_SIZING.internationalTrueSize;

  for (const [brandName, brandData] of Object.entries(intlTrueSize)) {
    docs.push(
      createKnowledgeDocument({
        id: generateDocumentId('brand_intl_truesize', brandName),
        category: 'brand_intelligence',
        title: `Brand Sizing - ${brandName.charAt(0).toUpperCase() + brandName.slice(1)} (True to Size)`,
        content: `${brandName.charAt(0).toUpperCase() + brandName.slice(1)} (International - TRUE TO SIZE):

${formatObjectAsContent(brandData)}

Sizing: ${brandData.sizing}
${'note' in brandData ? `Note: ${brandData.note}` : ''}
${'recommendation' in brandData ? `Recommendation: ${brandData.recommendation}` : ''}`,
        topics: ['brand_sizing', 'international_brands', 'true_to_size', brandName],
        source: 'fashion-summaries.ts',
      })
    );
  }

  // Luxury Brands
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('brand_luxury', 'luxury_sizing'),
      category: 'brand_intelligence',
      title: 'Brand Sizing - Luxury Brands',
      content: `Luxury Brand Sizing Guidelines:

${formatObjectAsContent(BRAND_SIZING.luxury)}

General rule: Most luxury brands run smaller - extra caution needed!
Important: Expensive mistakes hurt badly - TRY IN-STORE FIRST!`,
      topics: ['brand_sizing', 'luxury_brands'],
      source: 'fashion-summaries.ts',
    })
  );

  // Quick Reference
  docs.push(
    createKnowledgeDocument({
      id: generateDocumentId('brand', 'quick_reference'),
      category: 'brand_intelligence',
      title: 'Brand Sizing - Quick Reference Guide',
      content: `Brand Sizing Quick Reference:

${formatObjectAsContent(BRAND_SIZING.quickReference)}

Essential sizing tips:
- ZARA/MANGO: Size up 1 size (runs small!)
- UNIQLO: Order your normal size (Asian sizing perfect!)
- JASPAL: Order your normal size (Thai brand, consistent!)
- GUCCI: Size up 2 sizes! (Italian tiny!)`,
      topics: ['brand_sizing', 'quick_reference', 'sizing_guide'],
      source: 'fashion-summaries.ts',
    })
  );

  return docs;
}

/**
 * Main seeding function
 */
async function seedKnowledgeBase(options: CLIOptions): Promise<void> {
  console.log('🌱 Starting knowledge base seeding...\n');

  if (options.verbose) {
    console.log('🔍 Initialization:');
    console.log(`   - Clear existing: ${options.clear}`);
    console.log(`   - Dry run: ${options.dryRun}`);
    console.log(`   - Verbose logging: ${options.verbose}`);
    console.log('');
  }

  // Collect all documents
  console.log('📚 Creating knowledge documents...');

  let allDocuments: KnowledgeDocument[] = [];

  try {
    const fashionDocs = createFashionFundamentalsDocuments();
    allDocuments.push(...fashionDocs);
    if (options.verbose) console.log(`   ✅ Fashion Fundamentals: ${fashionDocs.length} documents`);
  } catch (error) {
    console.error(`   ❌ Failed to create Fashion Fundamentals documents:`, error);
  }

  try {
    const cultureDocs = createThaiCultureDocuments();
    allDocuments.push(...cultureDocs);
    if (options.verbose) console.log(`   ✅ Thai Culture: ${cultureDocs.length} documents`);
  } catch (error) {
    console.error(`   ❌ Failed to create Thai Culture documents:`, error);
  }

  try {
    const bodyTypeDocs = createBodyTypeDocuments();
    allDocuments.push(...bodyTypeDocs);
    if (options.verbose) console.log(`   ✅ Body Types: ${bodyTypeDocs.length} documents`);
  } catch (error) {
    console.error(`   ❌ Failed to create Body Type documents:`, error);
  }

  try {
    const occasionDocs = createOccasionDocuments();
    allDocuments.push(...occasionDocs);
    if (options.verbose) console.log(`   ✅ Occasions: ${occasionDocs.length} documents`);
  } catch (error) {
    console.error(`   ❌ Failed to create Occasion documents:`, error);
  }

  try {
    const brandDocs = createBrandSizingDocuments();
    allDocuments.push(...brandDocs);
    if (options.verbose) console.log(`   ✅ Brand Sizing: ${brandDocs.length} documents`);
  } catch (error) {
    console.error(`   ❌ Failed to create Brand Sizing documents:`, error);
  }

  console.log(`\n📚 Created ${allDocuments.length} knowledge documents total\n`);

  // Category breakdown
  if (options.verbose) {
    const categoryCount: Record<string, number> = {};
    allDocuments.forEach((doc) => {
      categoryCount[doc.category] = (categoryCount[doc.category] || 0) + 1;
    });

    console.log('📊 Category Breakdown:');
    for (const [category, count] of Object.entries(categoryCount)) {
      console.log(`   - ${category}: ${count} documents`);
    }
    console.log('');
  }

  // Validate documents
  console.log('✅ Validating documents...');
  const validDocuments: KnowledgeDocument[] = [];
  let validationErrors = 0;

  for (const doc of allDocuments) {
    try {
      const validation = validateKnowledgeDocument(doc);
      if (validation.valid) {
        validDocuments.push(doc);
      } else {
        validationErrors++;
        console.error(`   ⚠️  Validation failed for ${doc.id}:`);
        validation.errors.forEach((err) => console.error(`      - ${err}`));
      }
    } catch (error) {
      validationErrors++;
      console.error(`   ❌ Validation error for ${doc.id}:`, error);
    }
  }

  if (validationErrors > 0) {
    console.log(`\n⚠️  ${validationErrors} documents failed validation and will be skipped\n`);
  } else {
    console.log(`   ✅ All ${validDocuments.length} documents validated successfully\n`);
  }

  // Estimate storage
  if (options.verbose) {
    console.log('💾 Estimating storage requirements...');
    let totalChunks = 0;
    let totalTokens = 0;
    let totalBytes = 0;

    for (const doc of validDocuments) {
      try {
        const estimate = estimateDocumentStorage(doc);
        totalChunks += estimate.estimatedChunks;
        totalTokens += estimate.estimatedTokens;
        totalBytes += estimate.estimatedBytes;
      } catch (error) {
        // Skip estimation errors
      }
    }

    console.log(`   - Estimated chunks: ${totalChunks}`);
    console.log(`   - Estimated tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   - Estimated storage: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
  }

  // Dry run mode
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
    console.log(`Would index ${validDocuments.length} documents\n`);

    console.log('📄 Sample Documents (first 3):');
    validDocuments.slice(0, 3).forEach((doc, idx) => {
      console.log(`\n${idx + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Category: ${doc.category}`);
      console.log(`   Topics: ${doc.metadata.topics.join(', ')}`);
      console.log(`   Content preview: ${doc.content.substring(0, 100)}...`);
    });

    console.log('\n✅ Dry run complete - no changes made');
    return;
  }

  // Clear existing knowledge base if requested
  if (options.clear) {
    try {
      console.log('🗑️  Clearing existing knowledge base...');
      const clearedCount = await clearKnowledgeBase();
      console.log(`   ✅ Cleared ${clearedCount} existing chunks\n`);
    } catch (error) {
      console.error('   ❌ Failed to clear knowledge base:', error);
      throw error;
    }
  }

  // Index documents
  console.log('🚀 Indexing documents to vector store...');
  const startTime = Date.now();

  try {
    const chunksIndexed = await indexDocuments(validDocuments);
    const duration = Date.now() - startTime;

    console.log(`\n✅ Successfully indexed ${chunksIndexed} chunks in ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log('');

    // Summary statistics
    console.log('📊 Summary:');
    console.log(`   - Documents processed: ${validDocuments.length}`);
    console.log(`   - Chunks created: ${chunksIndexed}`);
    console.log(`   - Average chunks per document: ${(chunksIndexed / validDocuments.length).toFixed(1)}`);
    console.log(`   - Processing time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`   - Average time per document: ${(duration / validDocuments.length).toFixed(0)}ms`);
  } catch (error) {
    console.error('\n❌ Failed to index documents:', error);

    if (error instanceof Error) {
      if (error.message.includes('OPENROUTER_API_KEY')) {
        console.error('\n💡 Tip: Make sure OPENROUTER_API_KEY is set in .env.local');
      } else if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        console.error('\n💡 Tip: Check that the vector store directory exists and has write permissions');
      }
    }

    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Display banner
  console.log('═══════════════════════════════════════════');
  console.log('🌱 OOTDay Knowledge Base Seeding Tool');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (options.verbose) {
    console.log('⚙️  Active Options:');
    console.log(`   - Clear existing data: ${options.clear}`);
    console.log(`   - Dry run mode: ${options.dryRun}`);
    console.log(`   - Verbose logging: ${options.verbose}`);
    console.log('');
  }

  // Check environment
  if (!options.dryRun) {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ Error: OPENROUTER_API_KEY not found in environment');
      console.error('');
      console.error('Please set OPENROUTER_API_KEY in .env.local');
      console.error('Example: OPENROUTER_API_KEY=sk-or-...');
      process.exit(1);
    }

    if (options.verbose) {
      console.log('✅ Environment check passed');
      console.log('');
    }
  }

  try {
    await seedKnowledgeBase(options);

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Knowledge base seeding completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('❌ Knowledge base seeding failed');
    console.error('═══════════════════════════════════════════');
    console.error('');

    if (options.verbose && error instanceof Error) {
      console.error('Error details:');
      console.error(error.message);
      if (error.stack) {
        console.error('');
        console.error('Stack trace:');
        console.error(error.stack);
      }
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }

    console.error('');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
