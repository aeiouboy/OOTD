/**
 * Mock API Response Fixtures for OOTDay E2E Tests
 */

export const MOCK_CHAT_RESPONSE = {
    success: {
        response: 'นี่คือชุดที่แนะนำสำหรับคุณค่ะ สำหรับการไปทำงาน ขอแนะนำชุดที่ดูเรียบร้อยแต่ทันสมัย',
        outfits: [
            {
                id: 'outfit-1',
                title: 'Classic Work Look',
                description: 'Perfect for office - professional yet stylish',
                totalPrice: 2500,
                items: [
                    {
                        sku: 'SKU-001',
                        id: 'prod-1',
                        name: 'White Cotton Blouse',
                        brand: 'Central',
                        price: 1299,
                        originalPrice: 1599,
                        image: '/placeholder-blouse.jpg',
                        category: 'tops',
                        gender: 'women',
                        availability: 'in_stock',
                    },
                    {
                        sku: 'SKU-002',
                        id: 'prod-2',
                        name: 'Black Pencil Skirt',
                        brand: 'Jaspal',
                        price: 1201,
                        originalPrice: 1499,
                        image: '/placeholder-skirt.jpg',
                        category: 'bottoms',
                        gender: 'women',
                        availability: 'in_stock',
                    },
                ],
            },
            {
                id: 'outfit-2',
                title: 'Smart Casual Friday',
                description: 'Relaxed but professional for casual Fridays',
                totalPrice: 1899,
                items: [
                    {
                        sku: 'SKU-003',
                        id: 'prod-3',
                        name: 'Navy Blazer',
                        brand: 'CPS',
                        price: 1899,
                        originalPrice: 2299,
                        image: '/placeholder-blazer.jpg',
                        category: 'outerwear',
                        gender: 'women',
                        availability: 'in_stock',
                    },
                ],
            },
        ],
    },
    empty: {
        response: 'ขออภัยค่ะ ไม่พบชุดที่ตรงกับความต้องการของคุณ กรุณาลองปรับเงื่อนไขใหม่นะคะ',
        outfits: [],
    },
    error: {
        error: 'Failed to process request',
        message: 'Internal server error',
    },
};

export const MOCK_PRODUCTS_RESPONSE = {
    success: [
        {
            sku: 'TEST-001',
            id: 'prod-1',
            name: 'Test White T-Shirt',
            brand: 'Test Brand',
            price: 599,
            originalPrice: 799,
            image: '/placeholder.jpg',
            category: 'tops',
            gender: 'women',
            availability: 'in_stock',
            url: 'https://example.com/product/1',
        },
        {
            sku: 'TEST-002',
            id: 'prod-2',
            name: 'Test Blue Jeans',
            brand: 'Test Brand',
            price: 1299,
            originalPrice: 1599,
            image: '/placeholder.jpg',
            category: 'bottoms',
            gender: 'women',
            availability: 'in_stock',
            url: 'https://example.com/product/2',
        },
        {
            sku: 'TEST-003',
            id: 'prod-3',
            name: 'Test Sneakers',
            brand: 'Test Brand',
            price: 2499,
            originalPrice: 2999,
            image: '/placeholder.jpg',
            category: 'shoes',
            gender: 'women',
            availability: 'low_stock',
            url: 'https://example.com/product/3',
        },
    ],
    empty: [],
    error: {
        error: 'Failed to load products',
    },
};

export const MOCK_IMAGE_GENERATION_RESPONSE = {
    success: {
        success: true,
        imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        message: 'Image generated successfully',
    },
    rateLimited: {
        success: false,
        error: 'Rate limit exceeded. Please try again in a few minutes.',
        retryAfter: 60,
    },
    invalidDescription: {
        success: false,
        error: 'Invalid description provided',
    },
    serviceUnavailable: {
        success: false,
        error: 'Image generation service is currently unavailable',
    },
    timeout: {
        success: false,
        error: 'Request timeout - image generation took too long',
    },
};

export const MOCK_OUTFITS = [
    {
        id: 'mock-outfit-1',
        title: 'Casual Day Out',
        description: 'Perfect for shopping or meeting friends',
        totalPrice: 1899,
        items: [
            {
                sku: 'MOCK-001',
                id: 'mock-prod-1',
                name: 'Striped T-Shirt',
                brand: 'H&M',
                price: 599,
                image: '/placeholder.jpg',
                category: 'tops',
                gender: 'women',
            },
            {
                sku: 'MOCK-002',
                id: 'mock-prod-2',
                name: 'Denim Shorts',
                brand: 'Levi\'s',
                price: 1300,
                image: '/placeholder.jpg',
                category: 'bottoms',
                gender: 'women',
            },
        ],
    },
    {
        id: 'mock-outfit-2',
        title: 'Office Ready',
        description: 'Professional look for work',
        totalPrice: 3499,
        items: [
            {
                sku: 'MOCK-003',
                id: 'mock-prod-3',
                name: 'White Button Shirt',
                brand: 'Uniqlo',
                price: 990,
                image: '/placeholder.jpg',
                category: 'tops',
                gender: 'women',
            },
            {
                sku: 'MOCK-004',
                id: 'mock-prod-4',
                name: 'Black Trousers',
                brand: 'Zara',
                price: 1499,
                image: '/placeholder.jpg',
                category: 'bottoms',
                gender: 'women',
            },
            {
                sku: 'MOCK-005',
                id: 'mock-prod-5',
                name: 'Leather Loafers',
                brand: 'Clarks',
                price: 1010,
                image: '/placeholder.jpg',
                category: 'shoes',
                gender: 'women',
            },
        ],
    },
    {
        id: 'mock-outfit-3',
        title: 'Weekend Vibes',
        description: 'Relaxed and comfortable',
        totalPrice: 2199,
        items: [
            {
                sku: 'MOCK-006',
                id: 'mock-prod-6',
                name: 'Oversized Sweater',
                brand: 'Gap',
                price: 1299,
                image: '/placeholder.jpg',
                category: 'tops',
                gender: 'women',
            },
            {
                sku: 'MOCK-007',
                id: 'mock-prod-7',
                name: 'Jogger Pants',
                brand: 'Nike',
                price: 900,
                image: '/placeholder.jpg',
                category: 'bottoms',
                gender: 'women',
            },
        ],
    },
];

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
