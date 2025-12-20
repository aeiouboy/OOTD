# Product Data Model Integration with Test Mode

## Overview
This document outlines the integration plan for incorporating the comprehensive product data model into the LLM test mode interface. This will enable AI models to provide accurate, data-driven fashion recommendations based on real Central Group products during testing.

## Current State Analysis

### Product Data Model (Implemented)
Location: `frontend/lib/types/product-types.ts`

**Key Interfaces:**
- `EnhancedProduct` - Complete product data structure
- `ProductSummary` - Token-efficient format for AI
- `ProductFilterCriteria` - Query/filtering capabilities
- `ClassificationInfo` - Category, gender, tags, occasions
- `StyleAttributes` - Colors, patterns, formality, seasonality
- `PricingInfo` - Current/original price, promotions
- `ThaiMarketInfo` - Cultural appropriateness, Thai-specific data

### Test Mode (Implemented)
Location: `frontend/components/chat/InteractiveTestMode.tsx`

**Key Components:**
- `OpenRouterClient` - API client for LLM requests
- `InteractiveTestMode` - Multi-panel test interface
- `InteractiveChatPanel` - Individual model chat panels
- System prompt with basic fashion guidance

### Current Gap
- Test mode uses generic system prompt without product data
- AI responses mention products but don't reference actual inventory
- No product context passed to AI models during testing
- Cannot validate AI recommendations against real product catalog

## Integration Goals

1. **Product Context in AI Prompts**
   - Include relevant product data in system/user prompts
   - Use token-efficient `ProductSummary` format
   - Filter products based on user query (occasion, style, budget)

2. **Realistic Testing**
   - Test AI ability to recommend actual products
   - Validate product matching logic
   - Assess response quality with real inventory

3. **Performance Optimization**
   - Minimize token usage for product data
   - Cache product catalog for test sessions
   - Lazy load product details only when needed

4. **Testing Capabilities**
   - Compare how different models handle product recommendations
   - Evaluate product matching accuracy across models
   - Test occasion mapping with real products

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 InteractiveTestMode                          │
│  - Manages test panels                                       │
│  - Loads product catalog                                     │
│  - Passes product context to panels                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              InteractiveChatPanel                            │
│  - User sends message                                        │
│  - Filters relevant products based on query                 │
│  - Passes filtered products to OpenRouter client             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ProductContextSerializer                        │
│  - Converts EnhancedProduct → ProductSummary                │
│  - Formats product data for AI prompts                      │
│  - Optimizes token usage                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenRouterClient                                │
│  - Enhanced system prompt with product structure             │
│  - Includes filtered products in context                    │
│  - Sends request to AI model                                │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Product Context Serializer
**File:** `frontend/lib/utils/product-context-serializer.ts`

```typescript
export interface ProductContext {
  products: ProductSummary[];
  totalCount: number;
  filters: ProductFilterCriteria;
  metadata: {
    occasion?: string;
    budget?: { min: number; max: number };
    style?: string[];
  };
}

export function serializeProductsForAI(
  products: EnhancedProduct[],
  maxProducts: number = 20
): ProductContext

export function formatProductContextForPrompt(
  context: ProductContext
): string
```

### Phase 2: Enhanced OpenRouter Client
**File:** `frontend/lib/openrouter-client.ts`

**Changes:**
1. Add `productContext?: ProductContext` parameter to `sendChatCompletion`
2. Enhance system prompt to include product data structure
3. Add product context to user message if provided

```typescript
interface ChatCompletionOptions {
  modelId: string;
  systemPrompt: string;
  userMessage: string;
  productContext?: ProductContext; // NEW
  timeout?: number;
  maxRetries?: number;
}
```

### Phase 3: Product Data Loader
**File:** `frontend/lib/test-mode-product-loader.ts`

```typescript
export async function loadProductsForTestMode(): Promise<EnhancedProduct[]>

export function filterProductsByQuery(
  products: EnhancedProduct[],
  query: string,
  maxResults: number = 20
): EnhancedProduct[]

export function extractQueryContext(
  message: string
): {
  occasion?: OccasionType;
  budget?: { min: number; max: number };
  style?: StyleTag[];
  gender?: Gender;
}
```

### Phase 4: Update InteractiveTestMode
**File:** `frontend/components/chat/InteractiveTestMode.tsx`

**Changes:**
1. Load product catalog on mount
2. Pass product catalog to chat panels
3. Add toggle for "Use Product Data" mode

```typescript
const [productCatalog, setProductCatalog] = useState<EnhancedProduct[]>([]);
const [useProductData, setUseProductData] = useState(true);

useEffect(() => {
  loadProductsForTestMode().then(setProductCatalog);
}, []);
```

### Phase 5: Update InteractiveChatPanel
**File:** `frontend/components/chat/InteractiveChatPanel.tsx`

**Changes:**
1. Accept product catalog as prop
2. Filter products based on user query
3. Pass product context to OpenRouter client

```typescript
interface InteractiveChatPanelProps {
  productCatalog?: EnhancedProduct[]; // NEW
  useProductData?: boolean; // NEW
  // ... existing props
}
```

## System Prompt Enhancement

### Current System Prompt
```
You are a friendly Thai fashion specialist providing outfit recommendations...
```

### Enhanced System Prompt with Product Data
```
You are a friendly Thai fashion specialist with access to Central Group's product catalog.

## Available Product Data
You have access to {product_count} products with the following attributes:
- Product ID, Name (Thai/English), Brand
- Pricing (current, original, promotions)
- Category & Gender
- Occasions (work, party, date, etc.)
- Style attributes (formality, colors, patterns)
- Seasonality & Thai market appropriateness

## Product Data Format
{product_context}

## Recommendation Guidelines
1. ONLY recommend products from the provided catalog
2. Reference products by: Name, Brand, Price, and ID
3. Match products to user's occasion, budget, and style preferences
4. Consider Thai cultural appropriateness
5. Provide 3-5 product recommendations with clear reasoning
```

## Token Optimization Strategy

### Product Summary Format (Compact)
```json
{
  "id": "CLO-001",
  "name": "White Cotton Shirt",
  "brand": "MANGO",
  "price": 1590,
  "gender": "women",
  "occasions": ["work", "cafe"],
  "formality": 7,
  "colors": ["white"],
  "style": ["classic", "minimalist"],
  "season": ["all-season"]
}
```

**Estimated tokens per product:** 40-60 tokens
**For 20 products:** ~1,000 tokens

### Query-Based Filtering
- Filter by occasion mentioned in user query
- Filter by budget if mentioned
- Filter by style keywords
- Limit to top 10-20 most relevant products

## Testing Scenarios

### Scenario 1: Work Outfit Request
**User:** "I need a professional work outfit for a meeting"
**Product Context:**
- Occasion: work
- Formality: 7-9
- Limit: 10 products

**Expected:** AI recommends appropriate work attire from catalog

### Scenario 2: Budget-Constrained Request
**User:** "Looking for a party dress under 3000 baht"
**Product Context:**
- Occasion: party
- Budget: max 3000 THB
- Gender: women
- Limit: 15 products

**Expected:** AI recommends within budget

### Scenario 3: Cultural Appropriateness
**User:** "What should I wear to a Thai temple?"
**Product Context:**
- Thai market: templeAppropriate = true
- Formality: 6-8
- Cultural flags: conservative

**Expected:** AI recommends culturally appropriate clothing

## Success Metrics

1. **Recommendation Accuracy**
   - 90%+ of recommended products exist in catalog
   - 85%+ of products match stated occasion
   - 95%+ within budget constraints

2. **Token Efficiency**
   - Product context < 1500 tokens per query
   - Total prompt < 3000 tokens
   - Response time < 5 seconds

3. **User Experience**
   - Clear product names, prices, and links
   - Relevant styling advice
   - Thai language quality maintained

## Implementation Checklist

- [ ] Create `product-context-serializer.ts`
- [ ] Create `test-mode-product-loader.ts`
- [ ] Update `openrouter-client.ts` to accept product context
- [ ] Enhance system prompt template
- [ ] Update `InteractiveTestMode.tsx` to load products
- [ ] Update `InteractiveChatPanel.tsx` to filter and pass products
- [ ] Add toggle for enabling/disabling product data
- [ ] Add product catalog status indicator in UI
- [ ] Test with sample queries across multiple models
- [ ] Document token usage and performance
- [ ] Create comparison report: with vs without product data

## Future Enhancements

1. **Dynamic Product Loading**
   - Load products on-demand based on conversation
   - Cache recently used products
   - Pagination for large catalogs

2. **Advanced Filtering**
   - Semantic search for style matching
   - Color compatibility checking
   - Outfit composition validation

3. **Product Metadata**
   - Track which products are recommended most
   - Measure recommendation acceptance rates
   - A/B test different product context formats

4. **Multi-Language Support**
   - Switch between Thai/English product descriptions
   - Test language consistency

## References

- Product Data Model PRD: `/tasks/0004-prd-product-data-model-ai-fashion-assistant.md`
- Product Types: `/frontend/lib/types/product-types.ts`
- OpenRouter Client: `/frontend/lib/openrouter-client.ts`
- Test Mode: `/frontend/components/chat/InteractiveTestMode.tsx`
