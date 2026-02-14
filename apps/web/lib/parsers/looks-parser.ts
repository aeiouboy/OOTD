/**
 * Looks Parser for v5 Chat Flow
 * Parses AI responses containing ---LOOKS_DATA--- structured blocks
 *
 * @version 5.0.0
 */

import type { EnhancedProduct } from '../types/product-types';
import type { ChatLook, ChatLookItem, ParsedLooksResponse } from '../types/chat-types';

const LOOKS_START_MARKER = '---LOOKS_DATA---';
const LOOKS_END_MARKER = '---END_LOOKS_DATA---';

/**
 * Parse AI response to extract conversational text and structured looks data.
 *
 * Expected format in the AI response:
 * ```
 * [conversational Thai text...]
 *
 * ---LOOKS_DATA---
 * LOOK:1|Style Name Here
 * ITEM:Product Name|Category|Color|Description|SKU123|1290|https://central.co.th/...
 * ITEM:Another Product|Category|Color|Description|SKU456|2590|https://central.co.th/...
 * TIP:Styling tip for this look
 * TOTAL:3880
 * LOOK:2|Another Style
 * ITEM:...
 * TIP:...
 * TOTAL:...
 * ---END_LOOKS_DATA---
 * ```
 *
 * Graceful fallback: if no markers found, returns { text: fullResponse, looks: [] }
 */
export function parseLooksData(fullResponse: string): ParsedLooksResponse {
  if (!fullResponse || typeof fullResponse !== 'string') {
    return { text: '', looks: [] };
  }

  const startIdx = fullResponse.indexOf(LOOKS_START_MARKER);
  const endIdx = fullResponse.indexOf(LOOKS_END_MARKER);

  // Graceful fallback: no structured block found
  if (startIdx === -1) {
    // Try fallback markdown parser for inline product recommendations
    if (hasInlineProductPatterns(fullResponse)) {
      return parseFallbackMarkdown(fullResponse);
    }
    return { text: fullResponse.trim(), looks: [] };
  }

  // Extract conversational text (before the marker)
  const text = fullResponse.substring(0, startIdx).trim();

  // Extract the structured block
  const blockEnd = endIdx !== -1 ? endIdx : fullResponse.length;
  const block = fullResponse.substring(startIdx + LOOKS_START_MARKER.length, blockEnd).trim();

  if (!block) {
    return { text, looks: [] };
  }

  const looks: ChatLook[] = [];
  let currentLook: ChatLook | null = null;

  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (const line of lines) {
    if (line.startsWith('LOOK:')) {
      // Save previous look if exists
      if (currentLook) {
        looks.push(currentLook);
      }

      const lookData = line.substring(5); // Remove 'LOOK:'
      const pipeIdx = lookData.indexOf('|');

      let lookNumber = looks.length + 1;
      let styleName = 'Look';

      if (pipeIdx !== -1) {
        const numStr = lookData.substring(0, pipeIdx).trim();
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed)) lookNumber = parsed;
        styleName = lookData.substring(pipeIdx + 1).trim() || 'Look';
      } else {
        // No pipe, try to parse as just a number
        const parsed = parseInt(lookData.trim(), 10);
        if (!isNaN(parsed)) lookNumber = parsed;
      }

      currentLook = {
        lookNumber,
        styleName,
        items: [],
        totalPrice: 0,
        imageStatus: 'pending',
      };
    } else if (line.startsWith('ITEM:') && currentLook) {
      const itemData = line.substring(5); // Remove 'ITEM:'
      const parts = itemData.split('|');

      // Expected: Name|Category|Color|Description|SKU|Price|URL
      if (parts.length >= 7) {
        const price = parseFloat(parts[5].trim().replace(/,/g, ''));
        const item: ChatLookItem = {
          name: parts[0].trim(),
          brand: '', // Populated during catalog validation
          category: parts[1].trim(),
          color: parts[2].trim(),
          description: parts[3].trim(),
          sku: parts[4].trim(),
          price: isNaN(price) ? 0 : price,
          url: parts[6].trim(),
        };
        currentLook.items.push(item);
      } else if (parts.length >= 3) {
        // Partial data — try best effort
        const item: ChatLookItem = {
          name: parts[0]?.trim() || 'Unknown',
          brand: '', // Populated during catalog validation
          category: parts[1]?.trim() || 'Unknown',
          color: parts[2]?.trim() || 'Unknown',
          description: parts[3]?.trim() || '',
          sku: parts[4]?.trim() || '',
          price: parseFloat((parts[5] || '0').trim().replace(/,/g, '')) || 0,
          url: parts[6]?.trim() || '',
        };
        currentLook.items.push(item);
      }
      // Lines with fewer than 3 parts are silently skipped (malformed)
    } else if (line.startsWith('TIP:') && currentLook) {
      currentLook.tip = line.substring(4).trim();
    } else if (line.startsWith('TOTAL:') && currentLook) {
      const totalStr = line.substring(6).trim().replace(/,/g, '');
      const total = parseFloat(totalStr);
      if (!isNaN(total)) {
        currentLook.totalPrice = total;
      }
    }
    // Unknown lines are silently ignored
  }

  // Don't forget the last look
  if (currentLook) {
    // If TOTAL wasn't provided, calculate from items
    if (currentLook.totalPrice === 0 && currentLook.items.length > 0) {
      currentLook.totalPrice = currentLook.items.reduce((sum, item) => sum + item.price, 0);
    }
    looks.push(currentLook);
  }

  return { text, looks };
}

// ============================================================================
// Fallback Markdown Parser
// ============================================================================

/**
 * Detect if text contains inline product recommendation patterns.
 * Looks for numbered items with price + link indicators.
 */
function hasInlineProductPatterns(text: string): boolean {
  // Match patterns like: **1. Product Name** with price (บาท) and URL
  const numberedItemWithPrice = /\*\*\d+\.\s*.+?\*\*[\s\S]*?(?:฿|บาท|THB|\d{3,})/;
  const hasUrl = /https?:\/\/[^\s)]+/;
  return numberedItemWithPrice.test(text) && hasUrl.test(text);
}

/**
 * Parse inline markdown product recommendations as a fallback
 * when AI doesn't use the structured ---LOOKS_DATA--- format.
 *
 * Handles patterns like:
 *   **1. Product Name** - **Brand:** GIORDANO - **Price:** 🏷 420 บาท - **Link:** 🔗 https://...
 *   **1. Product Name** (Brand) - ราคา 420 บาท [link](url)
 */
function parseFallbackMarkdown(text: string): ParsedLooksResponse {
  const lines = text.split('\n');

  // Regex to match numbered product entries: **N. ...** or N. **...**
  const numberedItemRegex = /^\s*\*?\*?\s*(\d+)\.\s*\*{0,2}(.+?)\*{0,2}\s*[-–—]/;

  // Find the first numbered item to split intro text from product listing
  let firstItemLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (numberedItemRegex.test(lines[i]) || /^\s*\*{0,2}\s*\d+\.\s/.test(lines[i])) {
      firstItemLineIdx = i;
      break;
    }
  }

  // Check for "Look N:" headers to detect multi-look grouping
  const lookHeaderRegex = /(?:look|ลุค)\s*(\d+)\s*[:\-–—|]/i;

  const conversationalText = firstItemLineIdx > 0
    ? lines.slice(0, firstItemLineIdx).join('\n').trim()
    : '';

  const productSection = firstItemLineIdx >= 0
    ? lines.slice(firstItemLineIdx).join('\n')
    : text;

  // Extract individual product entries
  // Each entry starts with a numbered pattern like **N.
  const productEntryRegex = /\*{0,2}\s*(\d+)\.\s*\*{0,2}\s*(.+?)(?=\n\s*\*{0,2}\s*\d+\.\s|\n\s*(?:look|ลุค)\s*\d+|$)/gis;

  interface ExtractedItem {
    name: string;
    brand: string;
    price: number;
    url: string;
    lookGroup: number;
  }

  const extractedItems: ExtractedItem[] = [];
  let currentLookGroup = 1;

  // Process line by line for better control
  const productLines = productSection.split('\n');
  let currentEntry = '';
  let currentNumber = 0;

  for (const line of productLines) {
    // Check for look headers
    const lookMatch = line.match(lookHeaderRegex);
    if (lookMatch) {
      currentLookGroup = parseInt(lookMatch[1], 10);
      continue;
    }

    // Check if this line starts a new numbered entry
    const numMatch = line.match(/^\s*\*{0,2}\s*(\d+)\.\s/);
    if (numMatch) {
      // Process previous entry if exists
      if (currentEntry && currentNumber > 0) {
        const item = extractProductFromEntry(currentEntry);
        if (item) {
          extractedItems.push({ ...item, lookGroup: currentLookGroup });
        }
      }
      currentNumber = parseInt(numMatch[1], 10);
      currentEntry = line;
    } else if (currentEntry) {
      // Continuation of current entry
      currentEntry += '\n' + line;
    }
  }

  // Process last entry
  if (currentEntry && currentNumber > 0) {
    const item = extractProductFromEntry(currentEntry);
    if (item) {
      extractedItems.push({ ...item, lookGroup: currentLookGroup });
    }
  }

  if (extractedItems.length === 0) {
    return { text: text.trim(), looks: [] };
  }

  // Group items into looks
  const lookGroups = new Map<number, ExtractedItem[]>();
  for (const item of extractedItems) {
    const group = lookGroups.get(item.lookGroup) || [];
    group.push(item);
    lookGroups.set(item.lookGroup, group);
  }

  // If only one group and many items, split into looks of ~3 items each
  const looks: ChatLook[] = [];
  if (lookGroups.size === 1 && extractedItems.length > 4) {
    const items = extractedItems;
    const itemsPerLook = 3;
    for (let i = 0; i < items.length; i += itemsPerLook) {
      const chunk = items.slice(i, i + itemsPerLook);
      const lookNumber = looks.length + 1;
      looks.push({
        lookNumber,
        styleName: `Look ${lookNumber}`,
        items: chunk.map(item => ({
          name: item.name,
          brand: item.brand,
          category: 'Unknown',
          color: 'Unknown',
          description: '',
          sku: '',
          price: item.price,
          url: item.url,
        })),
        totalPrice: chunk.reduce((sum, item) => sum + item.price, 0),
        imageStatus: 'pending',
      });
    }
  } else {
    // Use detected look groups (or single group)
    for (const [groupNum, items] of lookGroups) {
      looks.push({
        lookNumber: groupNum,
        styleName: `Look ${groupNum}`,
        items: items.map(item => ({
          name: item.name,
          brand: item.brand,
          category: 'Unknown',
          color: 'Unknown',
          description: '',
          sku: '',
          price: item.price,
          url: item.url,
        })),
        totalPrice: items.reduce((sum, item) => sum + item.price, 0),
        imageStatus: 'pending',
      });
    }
  }

  // Clean markdown artifacts from conversational text
  const cleanText = cleanMarkdownText(conversationalText);

  return { text: cleanText, looks };
}

/**
 * Extract product details (name, brand, price, url) from a single markdown entry.
 */
function extractProductFromEntry(entry: string): { name: string; brand: string; price: number; url: string } | null {
  // Extract product name from **N. Product Name** or similar
  const nameMatch = entry.match(/\*{0,2}\s*\d+\.\s*\*{0,2}\s*(.+?)\*{0,2}\s*(?:[-–—]|\n|$)/);
  const name = nameMatch ? nameMatch[1].trim().replace(/\*+/g, '').trim() : '';

  if (!name) return null;

  // Extract brand: **Brand:** X or (Brand) or Brand: X
  let brand = '';
  const brandPatterns = [
    /\*{0,2}(?:Brand|แบรนด์|ยี่ห้อ)\s*[:\uff1a]\*{0,2}\s*(.+?)(?:\s*[-–—]|\s*\n|$)/i,
    /\(([A-Za-z][A-Za-z\s&.]+)\)/,
  ];
  for (const pattern of brandPatterns) {
    const match = entry.match(pattern);
    if (match) {
      brand = match[1].trim().replace(/\*+/g, '').trim();
      break;
    }
  }

  // Extract price: 420 บาท, ฿420, THB 420, 🏷 420, ราคา 420
  let price = 0;
  const pricePatterns = [
    /(?:Price|ราคา|🏷️?)\s*[:\uff1a]?\s*\*{0,2}\s*🏷?\s*([0-9,]+(?:\.\d+)?)\s*(?:บาท|THB|฿)/i,
    /(?:฿|THB)\s*([0-9,]+(?:\.\d+)?)/i,
    /([0-9,]+(?:\.\d+)?)\s*(?:บาท|THB|฿)/,
    /(?:Price|ราคา|🏷️?)\s*[:\uff1a]?\s*\*{0,2}\s*🏷?\s*([0-9,]+(?:\.\d+)?)/i,
  ];
  for (const pattern of pricePatterns) {
    const match = entry.match(pattern);
    if (match) {
      price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) break;
    }
  }

  // Extract URL
  let url = '';
  const urlPatterns = [
    /(?:Link|ลิงก์|🔗)\s*[:\uff1a]?\s*🔗?\s*(https?:\/\/[^\s)>\]]+)/i,
    /\[.+?\]\((https?:\/\/[^\s)]+)\)/,
    /(https?:\/\/[^\s)>\]]+)/,
  ];
  for (const pattern of urlPatterns) {
    const match = entry.match(pattern);
    if (match) {
      url = match[1].trim();
      break;
    }
  }

  // Must have at least name and (price or url) to be considered a product
  if (!name || (price === 0 && !url)) return null;

  return { name, brand, price, url };
}

/**
 * Clean markdown formatting artifacts from conversational text.
 * Removes bold markers, emoji artifacts, etc.
 */
function cleanMarkdownText(text: string): string {
  return text
    .replace(/\*{2,}(.+?)\*{2,}/g, '$1')  // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')           // *italic* → italic
    .replace(/#{1,6}\s*/g, '')              // ## headers → remove
    .trim();
}

/**
 * Validate looks against the product catalog.
 * - Matches each item's SKU against the catalog
 * - Forces catalog URLs (never trust AI-fabricated URLs)
 * - Drops items with SKUs not found in the catalog
 * - Returns validated looks (may have fewer items than original)
 */
export function validateLooksAgainstCatalog(
  looks: ChatLook[],
  catalog: EnhancedProduct[]
): ChatLook[] {
  if (!looks.length || !catalog.length) return looks;

  // Build SKU lookup map
  const skuMap = new Map<string, EnhancedProduct>();
  for (const product of catalog) {
    if (product.sku) {
      skuMap.set(product.sku.toLowerCase(), product);
    }
    // Also index by centralSKU if different
    if (product.centralIntegration?.centralSKU) {
      skuMap.set(product.centralIntegration.centralSKU.toLowerCase(), product);
    }
  }

  // Build URL lookup map (for fallback parser items that have URLs but no SKUs)
  const urlMap = new Map<string, EnhancedProduct>();
  for (const product of catalog) {
    const productUrl = product.centralIntegration?.productUrl;
    if (productUrl) {
      urlMap.set(normalizeUrl(productUrl), product);
    }
  }

  return looks.map(look => {
    const usedCatalogSkusInLook = new Set<string>();

    const validatedItemsWithRole = look.items
      .map(item => {
        let catalogProduct: EnhancedProduct | undefined;

        // Primary: SKU-based lookup
        if (item.sku) {
          catalogProduct = skuMap.get(item.sku.toLowerCase());
        }

        // Secondary: URL-based lookup (for fallback-parsed items without SKUs)
        if (!catalogProduct && item.url) {
          catalogProduct = urlMap.get(normalizeUrl(item.url));
        }

        // Tertiary: Fallback to a similar catalog product when SKU/URL doesn't resolve.
        // This keeps "View Look" actionable even when the exact SKU is missing.
        if (!catalogProduct) {
          catalogProduct = findSimilarCatalogProduct(item, catalog, usedCatalogSkusInLook);
        }

        if (!catalogProduct) return null; // No reliable match = drop

        const canonicalSku = (
          catalogProduct.sku ||
          catalogProduct.centralIntegration?.centralSKU ||
          ''
        ).toLowerCase();
        if (canonicalSku) {
          usedCatalogSkusInLook.add(canonicalSku);
        }

        // Force catalog URL and price, populate SKU if missing
        const primaryColor = catalogProduct.style?.colors?.primary;
        const secondaryColors = catalogProduct.style?.colors?.secondary || [];
        const productColors = [primaryColor, ...secondaryColors].filter((c): c is string => !!c);

        const resolvedRole = resolveOutfitRole(catalogProduct, item);
        const catalogName = getCatalogDisplayName(catalogProduct);
        const catalogDescription = getCatalogDescription(catalogProduct);

        return {
          ...item,
          url: catalogProduct.centralIntegration?.productUrl || item.url,
          imageUrl: catalogProduct.centralIntegration?.images?.primary || '',
          price: catalogProduct.pricing?.currentPrice || item.price,
          name: catalogName || item.name,
          brand: catalogProduct.brand || item.brand,
          sku: catalogProduct.sku || catalogProduct.centralIntegration?.centralSKU || item.sku || '',
          category: resolvedRole || item.category,
          color: primaryColor || item.color,
          description: catalogDescription || item.description,
          colors: productColors,
          sizes: catalogProduct.sizing?.availableSizes || [],
          __role: resolvedRole,
        } as ChatLookItem & { __role: string };
      })
      .filter((item): item is (ChatLookItem & { __role: string }) => item !== null);

    // Enforce category-role uniqueness per look to prevent duplicate tops/shoes in flat-lay.
    // Keep the first occurrence of each role.
    const seenRoles = new Set<string>();
    const validatedItems: ChatLookItem[] = [];
    for (const item of validatedItemsWithRole) {
      const roleKey = (item.__role || '').toLowerCase();
      if (roleKey && seenRoles.has(roleKey)) continue;
      if (roleKey) seenRoles.add(roleKey);
      const { __role, ...cleanItem } = item;
      validatedItems.push(cleanItem);
    }

    // Recalculate total from validated items
    const totalPrice = validatedItems.reduce((sum, item) => sum + item.price, 0);

    return {
      ...look,
      items: validatedItems,
      totalPrice,
    };
  }).filter(look => look.items.length > 0); // Drop looks with no valid items
}

/**
 * Normalize a URL for comparison (remove trailing slashes, query params, lowercase).
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Keep host + pathname, lowercase, strip trailing slash
    return (parsed.host + parsed.pathname).toLowerCase().replace(/\/+$/, '');
  } catch {
    // If URL parsing fails, do basic normalization
    return url.toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
  }
}

function getCatalogDisplayName(product: EnhancedProduct): string {
  return product.name?.th || product.name?.en || '';
}

function getCatalogDescription(product: EnhancedProduct): string {
  return product.description?.th || product.description?.en || '';
}

/**
 * Resolve canonical outfit role for de-duplication (top, bottom, footwear, etc.)
 */
function resolveOutfitRole(product: EnhancedProduct, item: ChatLookItem): string {
  const explicitRole = product.classification?.role;
  if (explicitRole && explicitRole.trim()) {
    return explicitRole.trim().toLowerCase();
  }

  const raw = `${item.category || ''} ${item.name || ''}`.toLowerCase();

  if (/dress|เดรส/.test(raw)) return 'dress';
  if (/shirt|tee|t-shirt|blouse|เสื้อ/.test(raw)) return 'top';
  if (/pants|jeans|trouser|skirt|shorts|กางเกง|กระโปรง/.test(raw)) return 'bottom';
  if (/shoe|sneaker|heel|sandal|loafer|รองเท้า/.test(raw)) return 'footwear';
  if (/bag|belt|hat|cap|jewelry|accessor|กระเป๋า|เข็มขัด|หมวก|เครื่องประดับ/.test(raw)) return 'accessory';
  if (/blazer|jacket|coat|cardigan|outer/.test(raw)) return 'outerwear';

  return (item.category || 'item').toLowerCase();
}

function inferRoleFromRawText(raw: string): string {
  const value = raw.toLowerCase();
  if (/dress|เดรส/.test(value)) return 'dress';
  if (/shirt|tee|t-shirt|blouse|เสื้อ|top/.test(value)) return 'top';
  if (/pants|jeans|trouser|skirt|shorts|กางเกง|กระโปรง|bottom/.test(value)) return 'bottom';
  if (/shoe|sneaker|heel|sandal|loafer|รองเท้า|footwear/.test(value)) return 'footwear';
  if (/bag|belt|hat|cap|jewelry|accessor|กระเป๋า|เข็มขัด|หมวก|เครื่องประดับ/.test(value)) return 'accessory';
  if (/blazer|jacket|coat|cardigan|outer/.test(value)) return 'outerwear';
  return '';
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  if (!value) return [];
  const stopWords = new Set([
    'women', 'woman', 'men', 'man', 'look', 'style', 'item', 'fashion',
    'เสื้อผ้า', 'ชุด', 'ลุค', 'สินค้า',
  ]);

  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function getCatalogCategoryText(product: EnhancedProduct): string {
  const category = product.classification?.category;
  return [
    category?.subcategory,
    category?.category,
    category?.department,
  ].filter(Boolean).join(' ');
}

function findSimilarCatalogProduct(
  item: ChatLookItem,
  catalog: EnhancedProduct[],
  usedCatalogSkusInLook: Set<string>
): EnhancedProduct | undefined {
  const requestedRole = inferRoleFromRawText(`${item.category || ''} ${item.name || ''}`);
  const requestedNameTokens = tokenize(`${item.name || ''} ${item.description || ''}`);
  const requestedCategoryTokens = tokenize(item.category || '');
  const requestedColor = normalizeText(item.color || '');
  const requestedPrice = typeof item.price === 'number' && item.price > 0 ? item.price : null;

  let best: { product: EnhancedProduct; score: number } | null = null;

  for (const candidate of catalog) {
    const candidateSku = (candidate.sku || candidate.centralIntegration?.centralSKU || '').toLowerCase();
    if (candidateSku && usedCatalogSkusInLook.has(candidateSku)) continue;

    const candidateRole = inferRoleFromRawText(
      `${candidate.classification?.role || ''} ${getCatalogCategoryText(candidate)} ${getCatalogDisplayName(candidate)}`
    );

    // If we know the expected role, skip incompatible roles.
    if (requestedRole && candidateRole && requestedRole !== candidateRole) continue;

    const candidateTokens = tokenize(
      `${getCatalogDisplayName(candidate)} ${getCatalogDescription(candidate)} ${getCatalogCategoryText(candidate)}`
    );
    const candidateTokenSet = new Set(candidateTokens);

    let score = 0;

    if (requestedRole && candidateRole === requestedRole) {
      score += 45;
    }

    let nameOverlap = 0;
    for (const token of requestedNameTokens) {
      if (candidateTokenSet.has(token)) nameOverlap++;
    }
    score += Math.min(24, nameOverlap * 8);

    let categoryOverlap = 0;
    for (const token of requestedCategoryTokens) {
      if (candidateTokenSet.has(token)) categoryOverlap++;
    }
    score += Math.min(20, categoryOverlap * 10);

    if (requestedColor) {
      const candidateColors = [
        candidate.style?.colors?.primary || '',
        ...(candidate.style?.colors?.secondary || []),
      ].map((c) => normalizeText(c || ''));

      if (candidateColors.some((c) => c && (c.includes(requestedColor) || requestedColor.includes(c)))) {
        score += 10;
      }
    }

    const candidatePrice = candidate.pricing?.currentPrice || 0;
    if (requestedPrice && candidatePrice > 0) {
      const diffRatio = Math.abs(candidatePrice - requestedPrice) / requestedPrice;
      score += Math.max(0, 18 - diffRatio * 30);
    }

    // Guardrail: avoid weak random matches.
    const hasSemanticSignal = requestedRole || nameOverlap > 0 || categoryOverlap > 0;
    if (!hasSemanticSignal) continue;
    if (score < 20) continue;

    if (!best || score > best.score) {
      best = { product: candidate, score };
    }
  }

  return best?.product;
}
