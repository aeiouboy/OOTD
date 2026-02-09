
import { IdealLook } from './types/inspiration';

export const MOCK_IDEAL_LOOKS: IdealLook[] = [
    {
        id: 'ideal-look-001',
        title: 'Quiet Luxury Workwear',
        source: 'web',
        inspirationImageUrl: 'https://images.unsplash.com/photo-1548624143-693d254f15dd?auto=format&fit=crop&q=80',
        aesthetic: 'quiet-luxury',
        description: 'A sophisticated monochromatic look featuring high-quality fabrics and neutral tones for the modern office.',
        occasion: 'work',
        colorPalette: 'neutral-earth-tones',
        createdAt: new Date().toISOString(),
        items: [
            {
                id: 'item-001',
                role: 'top',
                type: 'silk blouse',
                color: 'cream',
                material: 'silk',
                silhouette: 'relaxed flowy',
                searchQueries: ['cream silk blouse', 'white button down silk']
            },
            {
                id: 'item-002',
                role: 'bottom',
                type: 'wide-leg trousers',
                color: 'beige',
                material: 'wool blend',
                silhouette: 'wide-leg high-waist',
                searchQueries: ['beige wide leg pants', 'cream trousers']
            },
            {
                id: 'item-003',
                role: 'shoes',
                type: 'leather loafers',
                color: 'tan',
                material: 'leather',
                searchQueries: ['brown leather loafers', 'tan flat shoes']
            }
        ]
    },
    {
        id: 'ideal-look-002',
        title: 'Minimalist Date Night',
        source: 'ai-generated',
        inspirationImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80',
        aesthetic: 'casual-chic',
        description: 'Effortlessly chic dinner outfit combining structured pieces with feminine details.',
        occasion: 'date',
        colorPalette: 'monochromatic-black',
        createdAt: new Date().toISOString(),
        items: [
            {
                id: 'item-004',
                role: 'dress',
                type: 'slip dress',
                color: 'black',
                material: 'satin',
                silhouette: 'midi flowy',
                searchQueries: ['black satin midi dress', 'black slip dress']
            },
            {
                id: 'item-005',
                role: 'outerwear',
                type: 'oversized blazer',
                color: 'black',
                material: 'wool',
                silhouette: 'structured boxy',
                searchQueries: ['black blazer', 'oversized suit jacket']
            },
            {
                id: 'item-006',
                role: 'shoes',
                type: 'strappy heels',
                color: 'black',
                material: 'leather',
                searchQueries: ['black heels', 'strappy sandals']
            }
        ]
    }
];
