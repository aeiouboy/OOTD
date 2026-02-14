
import { IdealLook, IdealItem, MappedOutfit, ProductMatch } from '../types/inspiration';
import { Product } from '../types';
import { MOCK_IDEAL_LOOKS } from '../inspiration-data';
import { mockProducts } from '../mock-data';

/**
 * Service to handle the Inspiration-First workflow
 */
export class InspirationService {

    /**
     * Step 1 & 2: Simulate fetching inspiration and generating an ideal look specification.
     * In a real app, this would call Pinterest API or Web Search + LLM.
     */
    async generateIdealLook(query: string): Promise<IdealLook> {
        console.log(`[InspirationService] Generating ideal look for query: "${query}"`);

        // Simulate generic AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simple keyword matching to pick a mock template
        const lowerQuery = query.toLowerCase();

        let matchedLook = MOCK_IDEAL_LOOKS[0]; // Default to workwear

        if (lowerQuery.includes('date') || lowerQuery.includes('night') || lowerQuery.includes('dinner') || lowerQuery.includes('black')) {
            matchedLook = MOCK_IDEAL_LOOKS[1];
        }

        // In a real implementation, we would use an LLM here to generate a fresh IdealLook JSON 
        // based on the query, even if we don't have a perfect mock match.

        return {
            ...matchedLook,
            id: `generated-${Date.now()}`, // Unique ID for this generation session
            title: matchedLook.title + (query ? ` (Inspired by "${query}")` : '')
        };
    }

    /**
     * Step 3: Flat-Lay Visualization would happen here.
     * returning the imageUrl from the IdealLook.
     */

    /**
     * Step 4: Product Mapping Engine
     * Maps ideal items to actual catalog products.
     */
    async mapLookToProducts(idealLook: IdealLook): Promise<MappedOutfit> {
        console.log(`[InspirationService] Mapping ${idealLook.items.length} items to catalog...`);

        const matches: ProductMatch[] = idealLook.items.map(item => this.findBestMatch(item));

        const totalScore = matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length;

        return {
            id: `mapped-${Date.now()}`,
            idealLook,
            matches,
            totalMatchScore: totalScore
        };
    }

    /**
     * Helper: Find the best matching product for a single ideal item.
     * Currently uses simple keyword matching.
     * Future: Use Vector Embeddings / Semantic Similarity.
     */
    private findBestMatch(item: IdealItem): ProductMatch {
        let bestProduct: Product | null = null;
        let bestScore = 0;
        let bestReason = "No match found";

        const candidates = mockProducts.filter(p => {
            // Filter by broad category if possible (simple heuristic)
            // Note: mockProducts 'category' is broadly 'Women' usually.
            // We rely on 'subCategory' or name.
            return true;
        });

        for (const product of candidates) {
            const matchResult = this.calculateSimilarity(item, product);
            if (matchResult.score > bestScore) {
                bestScore = matchResult.score;
                bestProduct = product;
                bestReason = matchResult.reason;
            }
        }

        return {
            idealItem: item,
            product: bestProduct,
            matchScore: bestScore,
            matchReason: bestReason,
            // Simple logic for alternatives: find top 3 matches excluding the best one (not implemented for complexity)
            alternatives: []
        };
    }

    private calculateSimilarity(item: IdealItem, product: Product): { score: number, reason: string } {
        let score = 0;
        const reasons: string[] = [];

        const pName = product.name.toLowerCase();
        const pDesc = (product.visualDescription || "").toLowerCase();
        const pSubCat = (product.subCategory || "").toLowerCase();

        const iType = item.type.toLowerCase();
        const iColor = item.color.toLowerCase();
        const iRole = item.role.toLowerCase();

        // 1. Role/Type Match (High Weight)
        // Check if product name/category contains the specific type keyword
        if (pName.includes(iType) || pSubCat.includes(iType) || pDesc.includes(iType)) {
            score += 0.5;
            reasons.push("Type match");
        } else {
            // Fallback: Check if broad role matches (e.g. matching "top" to "blouse" roughly)
            // This is weak In this simple string matching.
            // We really need specific mappings like: if item.role='top', pSubCat should be 'blouse','shirt',etc.
            if (this.isRoleMatch(iRole, product)) {
                score += 0.2;
                reasons.push("Role match");
            }
        }

        // 2. Color Match (Medium Weight)
        // Very naive string check
        if (pName.includes(iColor) || (product.colors && product.colors.some(c => c.toLowerCase().includes(iColor)))) {
            score += 0.3;
            reasons.push("Color match");
        }

        // 3. Keyword Match (Low Weight)
        if (item.material && (pDesc.includes(item.material.toLowerCase()) || pName.includes(item.material.toLowerCase()))) {
            score += 0.1;
            reasons.push("Material match");
        }

        // Normalize to 0-1 (approx)
        score = Math.min(score, 1.0);

        return { score, reason: reasons.join(", ") };
    }

    private isRoleMatch(role: string, product: Product): boolean {
        const pName = product.name.toLowerCase();
        const sub = (product.subCategory || "").toLowerCase();

        switch (role) {
            case 'top': return pName.includes('shirt') || pName.includes('blouse') || pName.includes('top') || sub === 'top';
            case 'bottom': return pName.includes('pants') || pName.includes('skirt') || pName.includes('jeans') || sub === 'pants' || sub === 'skirt';
            case 'shoes': return pName.includes('shoe') || pName.includes('heel') || pName.includes('boot') || sub === 'shoes';
            case 'dress': return pName.includes('dress') || sub === 'dress';
            default: return false;
        }
    }
}
