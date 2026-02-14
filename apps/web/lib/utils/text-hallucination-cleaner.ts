/**
 * Text Hallucination Cleaner
 *
 * Post-validation utility that scans conversational text for product mentions
 * referencing hallucinated (dropped) products and removes them.
 *
 * Problem: After `validateLooksAgainstCatalog()` drops items with invalid SKUs,
 * the conversational Thai text may still reference those hallucinated products
 * (e.g., "Classic White Button Shirt - CPS ราคา 790 บาท"). Users would see
 * product names that don't exist in the catalog or in the validated looks cards.
 *
 * Solution: Compare original looks (pre-validation) against validated looks
 * (post-validation), identify dropped product names/SKUs, and remove their
 * mentions from the conversational text.
 *
 * @version 1.0.0
 * @created 2026-02-12
 */

import type { ChatLook } from '../types/chat-types';

export interface TextCleanerResult {
    /** Cleaned conversational text */
    text: string;
    /** Names of products whose mentions were removed */
    removedMentions: string[];
    /** Whether any hallucinated mentions were found and cleaned */
    hadHallucinations: boolean;
}

/**
 * Clean hallucinated product mentions from conversational AI text.
 *
 * Compares original (pre-validation) looks against validated (post-validation) looks
 * to find dropped items, then removes lines in the conversational text that reference
 * those dropped products by name or SKU.
 *
 * @param text - Conversational text from AI response (Thai + English mix)
 * @param originalLooks - Looks parsed from AI response (before catalog validation)
 * @param validatedLooks - Looks after `validateLooksAgainstCatalog()` (invalid items removed)
 * @returns Cleaned text with hallucinated product references removed
 */
export function cleanHallucinatedProductMentions(
    text: string,
    originalLooks: ChatLook[],
    validatedLooks: ChatLook[]
): TextCleanerResult {
    // 1. Build set of valid SKUs from validated looks
    const validSkus = new Set<string>();
    for (const look of validatedLooks) {
        for (const item of look.items) {
            if (item.sku) validSkus.add(item.sku.toLowerCase());
        }
    }

    // 2. Find dropped items (present in original but missing from validated)
    const droppedItems: Array<{ name: string; sku: string }> = [];
    for (const look of originalLooks) {
        for (const item of look.items) {
            const skuLower = item.sku?.toLowerCase() || '';
            if (!skuLower || !validSkus.has(skuLower)) {
                // Also check if the item's name appears in any validated look
                const nameInValidated = validatedLooks.some(vLook =>
                    vLook.items.some(vItem =>
                        vItem.name.toLowerCase() === item.name.toLowerCase()
                    )
                );
                if (!nameInValidated) {
                    droppedItems.push({ name: item.name, sku: item.sku || '' });
                }
            }
        }
    }

    // No drops = no hallucinations to clean
    if (droppedItems.length === 0) {
        return { text, removedMentions: [], hadHallucinations: false };
    }

    let cleanedText = text;
    const removedMentions: string[] = [];

    // 3. Remove product mention lines containing dropped product names
    // Typical AI output format for product lines:
    //   - Product Name - Brand ราคา 790 บาท 🔗 URL
    //   • **Product Name** (Brand) — ราคา 790 บาท
    for (const dropped of droppedItems) {
        const escapedName = escapeRegex(dropped.name);

        // Match lines that contain the dropped product name (list items, bullet points)
        // This targets product listing lines, not general prose
        const namePattern = new RegExp(
            `^[\\t ]*[-•\\*\\d\\.]+[\\s]*(?:\\*\\*)?[^\\n]*${escapedName}[^\\n]*$`,
            'gmi'
        );

        const beforeLength = cleanedText.length;
        cleanedText = cleanedText.replace(namePattern, '');

        if (cleanedText.length !== beforeLength) {
            removedMentions.push(dropped.name);
        }

        // Also try matching by SKU if it was present
        if (dropped.sku) {
            const escapedSku = escapeRegex(dropped.sku);
            const skuPattern = new RegExp(
                `^[\\t ]*[-•\\*\\d\\.]+[\\s]*[^\\n]*${escapedSku}[^\\n]*$`,
                'gmi'
            );
            cleanedText = cleanedText.replace(skuPattern, '');
        }
    }

    // 4. Clean up artifacts: excessive blank lines, orphaned look headers with no items
    cleanedText = cleanedText
        .replace(/\n{3,}/g, '\n\n')  // Collapse 3+ newlines to 2
        .replace(/^\s+$/gm, '')      // Remove whitespace-only lines
        .trim();

    if (removedMentions.length > 0) {
        console.log(
            `[HALLUCINATION] Cleaned ${removedMentions.length} hallucinated product mention(s) from conversational text: ${removedMentions.join(', ')}`
        );
    }

    return {
        text: cleanedText,
        removedMentions,
        hadHallucinations: removedMentions.length > 0,
    };
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
