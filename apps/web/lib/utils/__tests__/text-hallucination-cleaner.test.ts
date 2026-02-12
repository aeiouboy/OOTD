/**
 * Tests for Text Hallucination Cleaner
 *
 * Verifies that hallucinated product mentions are correctly identified
 * and removed from conversational AI text after catalog validation.
 */

import { describe, it, expect } from 'vitest';
import { cleanHallucinatedProductMentions } from '../../utils/text-hallucination-cleaner';
import type { ChatLook } from '../../types/chat-types';

describe('cleanHallucinatedProductMentions', () => {
    const makeItem = (name: string, sku: string) => ({
        name,
        brand: 'TestBrand',
        category: 'Tops',
        color: 'Black',
        description: 'Test',
        sku,
        price: 1000,
        url: `https://central.co.th/${sku}`,
    });

    const makeLook = (n: number, items: ReturnType<typeof makeItem>[]): ChatLook => ({
        lookNumber: n,
        styleName: `Look ${n}`,
        items,
        tip: 'style tip',
        totalPrice: items.reduce((sum, i) => sum + i.price, 0),
    });

    it('should return text unchanged when no items were dropped', () => {
        const text = '- White Cotton Tee - CPS ราคา 790 บาท 🔗 https://central.co.th/SKU001';
        const original = [makeLook(1, [makeItem('White Cotton Tee', 'SKU001')])];
        const validated = [makeLook(1, [makeItem('White Cotton Tee', 'SKU001')])];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(false);
        expect(result.text).toBe(text);
        expect(result.removedMentions).toHaveLength(0);
    });

    it('should remove product mention lines for dropped items', () => {
        const text = [
            '• **Look 1: Casual Style**',
            '  สไตล์สบายๆ สำหรับวันหยุด',
            '  - White Cotton Tee - CPS ราคา 790 บาท 🔗 https://central.co.th/SKU001',
            '  - Fake Fancy Shirt - Gucci ราคา 5000 บาท 🔗 https://central.co.th/FAKE001',
            '  💡 Pair with minimal accessories',
        ].join('\n');

        const original = [
            makeLook(1, [
                makeItem('White Cotton Tee', 'SKU001'),
                makeItem('Fake Fancy Shirt', 'FAKE001'),
            ]),
        ];
        const validated = [
            makeLook(1, [makeItem('White Cotton Tee', 'SKU001')]),
        ];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(true);
        expect(result.removedMentions).toContain('Fake Fancy Shirt');
        expect(result.text).toContain('White Cotton Tee');
        expect(result.text).not.toContain('Fake Fancy Shirt');
    });

    it('should handle multiple dropped items from multiple looks', () => {
        const text = [
            '• **Look 1: Work Style**',
            '  - Real Shirt - Brand ราคา 1000 บาท',
            '  - Hallucinated Top - NoBrand ราคา 2000 บาท',
            '• **Look 2: Casual Style**',
            '  - Another Real Item - Brand ราคา 500 บาท',
            '  - Made Up Pants - FakeBrand ราคา 3000 บาท',
        ].join('\n');

        const original = [
            makeLook(1, [
                makeItem('Real Shirt', 'SKU001'),
                makeItem('Hallucinated Top', 'FAKE001'),
            ]),
            makeLook(2, [
                makeItem('Another Real Item', 'SKU002'),
                makeItem('Made Up Pants', 'FAKE002'),
            ]),
        ];
        const validated = [
            makeLook(1, [makeItem('Real Shirt', 'SKU001')]),
            makeLook(2, [makeItem('Another Real Item', 'SKU002')]),
        ];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(true);
        expect(result.removedMentions).toHaveLength(2);
        expect(result.text).toContain('Real Shirt');
        expect(result.text).toContain('Another Real Item');
        expect(result.text).not.toContain('Hallucinated Top');
        expect(result.text).not.toContain('Made Up Pants');
    });

    it('should handle empty validated looks (all items hallucinated)', () => {
        const text = [
            '  - Fake Product A - Brand ราคา 1000 บาท',
            '  - Fake Product B - Brand ราคา 2000 บาท',
        ].join('\n');

        const original = [
            makeLook(1, [
                makeItem('Fake Product A', 'FAKE001'),
                makeItem('Fake Product B', 'FAKE002'),
            ]),
        ];
        const validated: ChatLook[] = [];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(true);
        expect(result.removedMentions).toHaveLength(2);
    });

    it('should handle empty original looks (no items to check)', () => {
        const text = 'Just some general fashion advice text.';
        const original: ChatLook[] = [];
        const validated: ChatLook[] = [];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(false);
        expect(result.text).toBe(text);
    });

    it('should collapse excessive newlines after removal', () => {
        const text = [
            'สวัสดีค่ะ',
            '',
            '  - Fake Product - Brand ราคา 1000 บาท',
            '',
            '',
            'จบแล้วค่ะ',
        ].join('\n');

        const original = [makeLook(1, [makeItem('Fake Product', 'FAKE001')])];
        const validated: ChatLook[] = [];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        // Should not have 3+ consecutive newlines
        expect(result.text).not.toMatch(/\n{3,}/);
    });

    it('should handle product names with special regex characters', () => {
        const text = '  - T-Shirt (Premium+) - Brand ราคา 1000 บาท';
        const original = [makeLook(1, [makeItem('T-Shirt (Premium+)', 'FAKE001')])];
        const validated: ChatLook[] = [];

        const result = cleanHallucinatedProductMentions(text, original, validated);

        expect(result.hadHallucinations).toBe(true);
        expect(result.text).not.toContain('T-Shirt (Premium+)');
    });
});
