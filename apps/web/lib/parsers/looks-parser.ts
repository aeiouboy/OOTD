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

  return looks.map(look => {
    const validatedItems = look.items
      .map(item => {
        if (!item.sku) return null; // No SKU = drop

        const catalogProduct = skuMap.get(item.sku.toLowerCase());
        if (!catalogProduct) return null; // SKU not in catalog = drop

        // Force catalog URL and price
        return {
          ...item,
          url: catalogProduct.centralIntegration?.productUrl || item.url,
          price: catalogProduct.pricing?.currentPrice || item.price,
          name: item.name, // Keep AI's display name (may be Thai)
          brand: catalogProduct.brand || item.brand,
        };
      })
      .filter((item): item is ChatLookItem => item !== null);

    // Recalculate total from validated items
    const totalPrice = validatedItems.reduce((sum, item) => sum + item.price, 0);

    return {
      ...look,
      items: validatedItems,
      totalPrice,
    };
  }).filter(look => look.items.length > 0); // Drop looks with no valid items
}
