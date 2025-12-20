# Chat System Integration with Enhanced Product Data Model

## Overview

Successfully integrated the enhanced product data model (from PRD-0004) with the chat interface to provide AI-powered fashion recommendations using real product data from Central Group.

## What Was Implemented

### 1. AI Chat Service (`frontend/lib/services/ai-chat-service.ts`)

**Features:**
- OpenRouter/Claude API integration for AI-powered responses
- Occasion detection from user messages (9 occasions: work, chill, wedding, sport, travel, date, dinner, cafe, party)
- Budget extraction from Thai/English text
- Gender preference detection
- Product filtering based on user requirements
- Fallback recommendations when AI is unavailable

**Key Functions:**
- `processAIChatRequest()` - Main AI processing pipeline
- `detectOccasion()` - Extracts occasion from user message
- `extractBudget()` - Parses budget from text (supports Thai Baht)
- `extractGender()` - Detects gender preference
- `filterProductsForRequest()` - Applies filters to product catalog
- `getFallbackRecommendations()` - Rule-based fallback

### 2. Data Loader (`frontend/lib/data-loader.ts`)

**Purpose:** Transforms scraped JSON products to EnhancedProduct format

**Functions:**
- `loadEnhancedProducts()` - Loads products from API and transforms to EnhancedProduct
- `initializeProductCatalog()` - Initializes both legacy and enhanced catalogs on app startup

**Transformation Pipeline:**
```
Raw JSON → transformCentralProduct() → enrichProductData() → validateProduct() → EnhancedProduct
```

### 3. Enhanced Outfit Generator (`frontend/lib/enhanced-outfit-generator.ts`)

**Features:**
- Works with EnhancedProduct data model
- Uses outfit roles (top, bottom, dress, outerwear, footwear, accessory, bag)
- Occasion-based outfit generation
- Formality-level filtering
- Price-based filtering
- Gender-specific outfit strategies

**Key Functions:**
- `categorizeEnhancedProducts()` - Organizes products by outfit role
- `generateEnhancedOutfit()` - Creates single outfit from categorized products
- `generateEnhancedOutfits()` - Creates multiple outfits with filtering
- `generateOutfitsFromQuery()` - Generates outfits based on user query

**Outfit Strategies:**
- **Strategy 1:** Dress-based (for women): Dress + Footwear + Accessory
- **Strategy 2:** Top/Bottom-based: Top + Bottom + Footwear + Optional Outerwear + Optional Accessory

### 4. Chat API Route (`frontend/app/api/chat/route.ts`)

**Endpoint:** `POST /api/chat`

**Request Format:**
```json
{
  "message": "string",
  "userPreferences": {
    "budget": number,
    "gender": "men" | "women",
    "style": ["string"],
    "colors": ["string"]
  },
  "conversationHistory": [
    { "role": "user" | "assistant", "content": "string" }
  ]
}
```

**Response Format:**
```json
{
  "message": "string",
  "outfits": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "totalPrice": number,
      "items": [/* product details */],
      "occasion": "work" | "chill" | ...,
      "formality": number,
      "imageUrl": "string"
    }
  ],
  "occasion": "string",
  "reasoning": "string"
}
```

**Flow:**
1. Receive user message
2. Get enhanced products from catalog
3. Call AI service (or fallback)
4. Generate outfits from recommended products
5. Return formatted response

### 5. Updated Chat Interface (`frontend/components/chat/ChatInterface.tsx`)

**Changes:**
- Replaced mock response with real API call to `/api/chat`
- Passes conversation history to API
- Handles API errors with fallback to mock
- Displays real outfit recommendations with actual products

**Flow:**
```
User Message → API Call → AI Processing → Product Filtering → Outfit Generation → Display
```

### 6. App Initialization (`frontend/app/page.tsx`)

**Changes:**
- Calls `initializeProductCatalog()` on mount
- Loads both legacy Product[] and enhanced EnhancedProduct[]
- Enhanced catalog available for chat system
- Legacy catalog used for existing outfit discovery

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Startup                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   initializeProductCatalog()
                              │
                              ▼
                ┌─────────────┴─────────────┐
                ▼                           ▼
           Legacy Products          Enhanced Products
         (Product[])                (EnhancedProduct[])
                │                           │
                ▼                           ▼
       Outfit Discovery              Chat System
       (Existing Feature)         (New Integration)

┌─────────────────────────────────────────────────────────────────┐
│                      Chat Flow                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      User Message
                              │
                              ▼
                    ChatInterface.tsx
                              │
                              ▼
                  POST /api/chat/route.ts
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
         AI Service              Fallback Recommendations
     (processAIChatRequest)     (getFallbackRecommendations)
                 │                         │
                 └────────────┬────────────┘
                              ▼
                  Filter Enhanced Products
                   (occasion, gender, budget)
                              │
                              ▼
                  Enhanced Outfit Generator
                 (generateOutfitsFromQuery)
                              │
                              ▼
                    Return Outfits + Message
                              │
                              ▼
                     Display to User
```

## Integration with Existing Product Data Model

### Type Compatibility

The implementation maintains **full backward compatibility** with existing code:

```typescript
// Legacy Product interface - still works
interface Product {
  sku: string
  name: string
  brand: string
  price: number
  imageUrl: string
  // ...
}

// New EnhancedProduct interface - for chat system
interface EnhancedProduct {
  id: string
  sku: string
  name: LocalizedText  // { th?: string, en?: string }
  brand: string
  pricing: PricingInfo  // { currentPrice, currency }
  classification: ClassificationInfo  // { category, gender, role, tags }
  style: StyleAttributes  // { colors, formalityLevel, occasions }
  // ...
}
```

### Utility Functions

```typescript
// Works with both types
getProductName(product: Product | EnhancedProduct, lang: 'th' | 'en'): string
getProductPrice(product: Product | EnhancedProduct): number
getProductImageUrl(product: Product | EnhancedProduct): string
isEnhancedProduct(product: any): product is EnhancedProduct
```

## Features Enabled by Integration

### ✅ Occasion-Based Recommendations

9 occasions mapped from user intent:
- 👔 Work/Office (ทำงาน/ออฟฟิศ)
- 😎 Chill/Weekend (วันชิลล์/วันหยุด)
- 💒 Wedding (งานแต่งงาน)
- 🏃 Sport/Gym (ออกกำลังกาย)
- ✈️ Travel (ท่องเที่ยว)
- 💕 Date (เดท)
- 🍽️ Dinner (ดินเนอร์)
- ☕ Cafe (คาเฟ่)
- 🎉 Party (ปาร์ตี้)

### ✅ Intelligent Product Filtering

Filters applied automatically:
- **Gender:** Detected from message or user preference
- **Occasion:** Extracted from keywords (Thai/English)
- **Budget:** Parsed from text (supports "฿5,000", "5000 baht", "งบ 5000")
- **Formality Level:** 1-10 scale
- **Availability:** Only in-stock and low-stock items
- **Color preferences:** From user profile
- **Style preferences:** From user profile

### ✅ Bilingual Support

Full Thai/English support throughout:
- Product names in both languages
- Occasion names in Thai/English
- Response messages in Thai
- Keyword detection in both languages

### ✅ AI-Powered or Rule-Based

**With OpenRouter API Key:**
- Uses Claude 3.5 Sonnet via OpenRouter
- Context-aware recommendations
- Natural conversation flow
- Personalized styling advice

**Without API Key:**
- Falls back to rule-based recommendations
- Uses occasion mapping + product filters
- Still provides relevant results
- No AI costs

### ✅ Product Data Enrichment

Automatic inference for missing data:
- **Category:** Inferred from product name
- **Outfit Role:** Detected (top/bottom/dress/etc.)
- **Style Attributes:** Detected (classic/modern/casual/formal/etc.)
- **Formality Level:** Calculated based on product type
- **Occasions:** Mapped based on formality + keywords
- **Seasonality:** Inferred from product type

## Configuration

### Required Environment Variables

```bash
# Optional - for AI-powered recommendations
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional - for attribution
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Without OpenRouter API Key

The system works perfectly fine without an API key:
- Uses rule-based recommendations
- All filtering and occasion mapping still work
- Just doesn't have AI-generated conversational responses

## Testing the Integration

### 1. Start the Development Server

```bash
cd frontend
pnpm dev
```

### 2. Open the App

Navigate to `http://localhost:3000`

### 3. Test Scenarios

**Scenario 1: Work Outfit**
```
User: "What should I wear to work?"
Expected:
- Detects occasion: "work"
- Filters products with formality 6-9
- Returns professional outfits with shirts, trousers, etc.
```

**Scenario 2: Weekend Casual**
```
User: "ชุดชิลล์วันหยุด"
Expected:
- Detects occasion: "chill"
- Filters casual products
- Returns relaxed outfits
```

**Scenario 3: Budget-Constrained**
```
User: "งานแต่งงาน งบไม่เกิน 5000 บาท"
Expected:
- Detects occasion: "wedding"
- Extracts budget: 5000
- Returns formal outfits within budget
```

**Scenario 4: Gender-Specific**
```
User: "men's casual outfit"
Expected:
- Detects gender: "men"
- Filters men's products
- Returns men's casual outfits
```

## Files Created

1. `frontend/lib/services/ai-chat-service.ts` - AI service
2. `frontend/lib/data-loader.ts` - Product transformation
3. `frontend/lib/enhanced-outfit-generator.ts` - Enhanced outfit generation
4. `frontend/app/api/chat/route.ts` - Chat API endpoint

## Files Modified

1. `frontend/components/chat/ChatInterface.tsx` - Updated to call real API
2. `frontend/app/page.tsx` - Initialize enhanced products on startup

## Next Steps

### Immediate Improvements

1. **Add OpenRouter API Key** to environment variables for AI-powered responses
2. **Test with real users** to gather feedback on recommendations
3. **Monitor API costs** if using OpenRouter
4. **Improve product data quality** by enhancing the scraper

### Future Enhancements

1. **User Profiles:** Save preferences, sizes, favorite colors
2. **Conversation Memory:** Remember user's style preferences across sessions
3. **Product Images:** Use actual product images in outfit recommendations
4. **Purchase Tracking:** Track which recommendations lead to purchases
5. **A/B Testing:** Test different recommendation strategies
6. **Caching:** Cache AI responses for common queries
7. **Fallback Responses:** Improve rule-based recommendations

## Summary

✅ **Chat system now uses real product data** from Central Group catalog
✅ **Enhanced product data model fully integrated**
✅ **Occasion-based recommendations working**
✅ **Budget and gender filtering functional**
✅ **Bilingual support (Thai/English) throughout**
✅ **AI-powered or rule-based fallback**
✅ **Full backward compatibility maintained**

The chat interface will now return **actual products with real URLs** instead of generic search URLs! 🎉
