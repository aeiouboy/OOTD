# Plan: Women's Fashion Occasion Suggestion System with Supabase + pgvector

## Task Description
Implement a comprehensive fashion suggestion system focused on the **top 3 women's occasions** (Weekend & Social, Smart Casual / Date Night, Everyday Casual) with occasion tagging, product migration to Supabase with pgvector for semantic search, RAG knowledge upload from the knowledge base, and full validation via specialist sub-agents for both back-end and front-end (Playwright).

## Objective
When this plan is complete, OOTDay will have:
1. All 1,247 women's products migrated to Supabase with pgvector embeddings and occasion tags
2. RAG knowledge base uploaded to Supabase pgvector (replacing local Vectra)
3. A new `/api/suggestions` endpoint that returns occasion-tagged outfit recommendations via semantic search
4. Updated frontend with occasion filter chips (Weekend, Date Night, Everyday) and suggestion cards
5. All features validated by specialist sub-agents (backend validator + Playwright E2E)

## Problem Statement
Currently, products are loaded from JSON files (`product_master_v1.json`) with no database persistence. The RAG system uses local Vectra for knowledge retrieval. There is no structured occasion tagging on products, and the AI must infer occasions at runtime — which is slow and inconsistent. The system needs a proper database (Supabase + pgvector) for scalable semantic search and pre-computed occasion tags for instant filtering.

## Solution Approach
1. **Supabase Setup**: Create Supabase project with pgvector extension, define schema for products + knowledge + occasion tags
2. **Product Migration**: Batch-migrate 1,247 women's products to Supabase with Claude-generated occasion scores and pgvector embeddings
3. **Knowledge Upload**: Parse all 30+ knowledge base markdown files, chunk them, embed, and store in Supabase pgvector (replacing Vectra)
4. **Backend API**: New `/api/suggestions` route that queries Supabase with occasion filters + semantic search
5. **Frontend**: Occasion filter chips component + suggestion cards that use the new API
6. **Validation**: Backend validator checks data integrity, API responses; Playwright E2E tests the full user flow

## Relevant Files

### Existing Files to Modify
- `apps/web/lib/types/enums.ts` - Add occasion tag types for the top 3
- `apps/web/lib/types/product-types.ts` - Add Supabase-backed product fields
- `apps/web/lib/constants/occasions.ts` - Reference for occasion definitions (already has 9 occasions)
- `apps/web/app/api/chat/route.ts` - Update to use Supabase product source
- `apps/web/lib/server-product-loader.ts` - Add Supabase loader alongside JSON fallback
- `apps/web/lib/rag/vector-store.ts` - Replace Vectra with Supabase pgvector
- `apps/web/lib/rag/config.ts` - Update RAG config for Supabase
- `apps/web/app/page.tsx` - Integrate occasion filter and suggestion components
- `apps/web/package.json` - Add `@supabase/supabase-js` dependency
- `apps/web/lib/services/ai-chat-service.ts` - Update product fetching to use Supabase
- `apps/web/lib/enhanced-outfit-generator.ts` - Use occasion-tagged products

### New Files to Create
- `apps/web/lib/supabase/client.ts` - Supabase client initialization
- `apps/web/lib/supabase/types.ts` - Database type definitions (generated from schema)
- `apps/web/lib/supabase/products.ts` - Product CRUD + semantic search queries
- `apps/web/lib/supabase/knowledge.ts` - Knowledge base CRUD + RAG queries
- `apps/web/lib/supabase/migrations/001_init_schema.sql` - Initial schema with pgvector
- `apps/web/lib/supabase/migrations/002_seed_products.ts` - Product migration script
- `apps/web/lib/supabase/migrations/003_seed_knowledge.ts` - Knowledge base seeding script
- `apps/web/app/api/suggestions/route.ts` - New occasion-based suggestion API
- `apps/web/app/api/products/search/route.ts` - Semantic product search API
- `apps/web/components/occasion/OccasionFilterChips.tsx` - Occasion filter UI component
- `apps/web/components/occasion/OccasionSuggestionCard.tsx` - Suggestion result card
- `apps/web/components/occasion/OccasionSuggestionGrid.tsx` - Grid layout for suggestions
- `apps/web/lib/hooks/useOccasionSuggestions.ts` - React hook for fetching suggestions
- `apps/web/e2e/occasion-suggestions.spec.ts` - Playwright E2E test suite
- `apps/web/lib/__tests__/supabase-products.test.ts` - Unit tests for Supabase product queries
- `apps/web/lib/__tests__/occasion-tagging.test.ts` - Unit tests for occasion tagging logic

### Data Files (Read-Only Reference)
- `data/products/product_master_v1.json` - Source product data (KB-enriched)
- `data/products/women_clothing_scraped.json` - Scraped women's products
- `data/personas/knowledge_base/foundation/` - Foundation KB docs (5 files)
- `data/personas/knowledge_base/advanced/` - Advanced KB docs (8 files)
- `data/personas/knowledge_base/implementation/` - Implementation KB docs (7 files)
- `data/personas/knowledge_base/special/` - Special KB docs (7 files)
- `research/occasion-suitability-women-catalog.md` - Women's occasion research

## Implementation Phases

### Phase 1: Foundation (Supabase + Schema)
Set up Supabase project, enable pgvector extension, create database schema for products (with occasion tags and embeddings) and knowledge chunks. Install `@supabase/supabase-js`. Create Supabase client wrapper with env var configuration.

**Database Schema:**
```sql
-- Enable pgvector
create extension if not exists vector;

-- Products table with occasion tags
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  product_name text not null,
  brand text,
  category text not null default 'women_clothing',
  price numeric,
  original_price numeric,
  image_url text,
  link text,
  availability text default 'In Stock',
  product_description text,

  -- Occasion scores (0.0 - 1.0)
  occasion_weekend_social float default 0,
  occasion_date_night float default 0,
  occasion_everyday_casual float default 0,

  -- Primary occasion tag
  primary_occasion text check (primary_occasion in ('weekend_social', 'date_night', 'everyday_casual')),

  -- Thai context (from KB enrichment)
  thai_climate_rating int,
  temple_appropriate boolean default false,
  ac_friendly boolean default true,

  -- Embedding for semantic search
  embedding vector(1536),

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge chunks table
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  category text not null, -- foundation, advanced, implementation, special
  tier int not null, -- 1, 2, 3
  title text,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index idx_products_occasion_weekend on products (occasion_weekend_social desc);
create index idx_products_occasion_date on products (occasion_date_night desc);
create index idx_products_occasion_everyday on products (occasion_everyday_casual desc);
create index idx_products_primary_occasion on products (primary_occasion);
create index idx_products_embedding on products using ivfflat (embedding vector_cosine_ops) with (lists = 50);
create index idx_knowledge_embedding on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 50);
create index idx_knowledge_category on knowledge_chunks (category);

-- RPC function for semantic product search
create or replace function search_products(
  query_embedding vector(1536),
  occasion_filter text default null,
  match_threshold float default 0.7,
  match_count int default 20
)
returns table (
  id uuid,
  product_name text,
  brand text,
  price numeric,
  image_url text,
  link text,
  primary_occasion text,
  occasion_weekend_social float,
  occasion_date_night float,
  occasion_everyday_casual float,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    p.id, p.product_name, p.brand, p.price, p.image_url, p.link,
    p.primary_occasion, p.occasion_weekend_social, p.occasion_date_night,
    p.occasion_everyday_casual,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where
    (occasion_filter is null or p.primary_occasion = occasion_filter)
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RPC function for knowledge search
create or replace function search_knowledge(
  query_embedding vector(1536),
  category_filter text default null,
  match_threshold float default 0.7,
  match_count int default 10
)
returns table (
  id uuid,
  source_file text,
  category text,
  title text,
  content text,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    k.id, k.source_file, k.category, k.title, k.content,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_chunks k
  where
    (category_filter is null or k.category = category_filter)
    and 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### Phase 2: Core Implementation
1. **Product Migration Script**: Read `product_master_v1.json` + `women_clothing_scraped.json`, filter women's products, generate occasion scores using product name + brand + price heuristics, generate embeddings via OpenAI/Supabase, insert into Supabase
2. **Knowledge Seeding Script**: Parse all markdown files from `data/personas/knowledge_base/`, chunk into ~500-token segments, generate embeddings, insert into `knowledge_chunks` table
3. **Supabase Product Service**: CRUD operations, semantic search via pgvector, occasion-filtered queries
4. **Suggestion API**: New `/api/suggestions` route that accepts occasion filter + optional query, returns ranked products
5. **Updated RAG Service**: Replace Vectra with Supabase pgvector for knowledge retrieval

### Phase 3: Frontend Integration
1. **OccasionFilterChips**: Horizontal scrollable chips for Weekend & Social, Date Night, Everyday Casual
2. **OccasionSuggestionGrid**: Grid of product cards filtered by selected occasion
3. **useOccasionSuggestions hook**: Fetches from `/api/suggestions` with debounced search
4. **Page Integration**: Add occasion filters above OutfitDiscovery in `page.tsx`

### Phase 4: Validation
1. **Backend Validator**: Verify Supabase data integrity, API response schemas, occasion tag accuracy
2. **Playwright E2E**: Test occasion filter clicks, suggestion loading, product card display, API calls

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members.
- You validate all work is going well and make sure the team is on track to complete the plan.

### Team Members

- Builder
  - Name: `builder-backend`
  - Role: Supabase setup, database schema, product migration, knowledge seeding, API routes, backend services
  - Agent Type: `general-purpose`
  - Resume: true

- Builder
  - Name: `builder-frontend`
  - Role: Occasion filter components, suggestion grid, hooks, page integration
  - Agent Type: `general-purpose`
  - Resume: true

- Builder
  - Name: `validator-backend`
  - Role: Validate backend data integrity, API responses, Supabase queries, unit tests
  - Agent Type: `general-purpose`
  - Resume: true

- Builder
  - Name: `validator-e2e`
  - Role: Playwright E2E tests for occasion suggestion flow, visual validation
  - Agent Type: `general-purpose`
  - Resume: true

## Step by Step Tasks

### 1. Setup Supabase Foundation
- **Task ID**: `setup-supabase`
- **Depends On**: none
- **Assigned To**: `builder-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Install `@supabase/supabase-js` in `apps/web/` via `pnpm add @supabase/supabase-js`
- Create `apps/web/lib/supabase/client.ts` with Supabase client initialization using env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- Create `apps/web/lib/supabase/types.ts` with TypeScript types matching the database schema
- Create `apps/web/lib/supabase/migrations/001_init_schema.sql` with the full schema (products, knowledge_chunks, indexes, RPC functions)
- Add env vars to `.env.sample`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (for embeddings)
- Run the migration SQL against Supabase (provide instructions in a README or script)
- Verify: TypeScript compiles, Supabase client connects

### 2. Migrate Women's Products to Supabase
- **Task ID**: `migrate-products`
- **Depends On**: `setup-supabase`
- **Assigned To**: `builder-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Create `apps/web/lib/supabase/migrations/002_seed_products.ts` migration script
- Read products from `data/products/product_master_v1.json` (prefer v1 KB-enriched) and `data/products/women_clothing_scraped.json`
- Filter to `category === 'women_clothing'` only (1,247 items)
- For each product, compute occasion scores using heuristics based on product_name, brand, price:
  - `occasion_weekend_social`: dresses, blouses, crop tops, skirts, brands like Journal/Mardi Mercredi score high
  - `occasion_date_night`: midi dresses, blazers, premium brands (Simkhai, Maje, Sandro, ASAVA) score high
  - `occasion_everyday_casual`: tees, polos, jeans, shorts, budget brands (Giordano, Pacific Union, Lee) score high
  - Set `primary_occasion` to the highest scoring occasion
- Generate text embedding for each product using: `"${product_name} ${brand} ${category} ${price} THB"`
- Use OpenAI `text-embedding-ada-002` or Supabase's built-in embedding function
- Batch insert into Supabase `products` table (batch size: 100)
- Create `apps/web/lib/supabase/products.ts` with query functions:
  - `getProductsByOccasion(occasion, limit)` - Filter by primary_occasion
  - `searchProducts(query, occasionFilter, limit)` - Semantic search with optional occasion filter
  - `getTopProducts(occasion, limit)` - Top scored products per occasion
- Add `pnpm seed:products` script to `package.json`
- Verify: All 1,247 women's products in Supabase with occasion tags

### 3. Upload Knowledge Base to Supabase pgvector
- **Task ID**: `seed-knowledge`
- **Depends On**: `setup-supabase`
- **Assigned To**: `builder-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: true (can run alongside `migrate-products`)
- Create `apps/web/lib/supabase/migrations/003_seed_knowledge.ts` knowledge seeding script
- Read all markdown files from `data/personas/knowledge_base/`:
  - `foundation/` (tier 1): 01_fashion_fundamentals.md through 05_brands_shopping.md + color theory
  - `advanced/` (tier 2): 06 through 13 (8 files)
  - `implementation/` (tier 3): 11 through 17 (7 files)
  - `special/`: advanced_jewelry_styling.md, social_media_platforms.md, social_proof_signals.md, etc.
- For each file:
  - Parse markdown, extract title from first `#` heading
  - Split into chunks of ~500 tokens (respect paragraph boundaries)
  - Generate embedding for each chunk
  - Insert into `knowledge_chunks` table with metadata (source_file, category, tier, title)
- Create `apps/web/lib/supabase/knowledge.ts` with:
  - `searchKnowledge(query, categoryFilter, limit)` - Semantic knowledge search
  - `getKnowledgeByCategory(category)` - Get all chunks for a category
- Update `apps/web/lib/rag/vector-store.ts` to use Supabase instead of Vectra (add `SUPABASE_RAG_ENABLED` feature flag)
- Add `pnpm seed:knowledge:supabase` script to `package.json`
- Verify: All knowledge chunks in Supabase with embeddings, semantic search returns relevant results

### 4. Build Suggestion API
- **Task ID**: `build-suggestion-api`
- **Depends On**: `migrate-products`, `seed-knowledge`
- **Assigned To**: `builder-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Create `apps/web/app/api/suggestions/route.ts`:
  - `GET /api/suggestions?occasion=weekend_social&limit=20` - Get top products by occasion
  - `POST /api/suggestions` with body `{ query, occasion, limit }` - Semantic search + occasion filter
  - Response schema: `{ products: Product[], occasion: string, total: number }`
- Create `apps/web/app/api/products/search/route.ts`:
  - `POST /api/products/search` with body `{ query, filters: { occasion, priceRange, brand } }`
  - Uses pgvector semantic search with optional filters
- Update `apps/web/lib/server-product-loader.ts`:
  - Add `loadProductsFromSupabase()` function alongside existing JSON loader
  - Feature flag: `SUPABASE_PRODUCTS_ENABLED` env var
  - Fallback to JSON if Supabase unavailable
- Verify: API routes return correct data, occasion filtering works, semantic search returns relevant products

### 5. Build Frontend Occasion Components
- **Task ID**: `build-frontend-occasions`
- **Depends On**: `build-suggestion-api`
- **Assigned To**: `builder-frontend`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Create `apps/web/components/occasion/OccasionFilterChips.tsx`:
  - Horizontal scrollable chip bar with 3 occasions: Weekend & Social, Date Night, Everyday Casual
  - Each chip shows: icon + Thai name + English name
  - Active state styling (filled vs outlined)
  - `onSelect(occasion)` callback
  - Use existing Radix UI / shadcn patterns from `components/ui/`
- Create `apps/web/components/occasion/OccasionSuggestionCard.tsx`:
  - Product card showing: image, name, brand, price, occasion badge
  - Click opens existing `ProductModal`
  - Occasion badge color: Weekend=purple, Date=pink, Everyday=blue
- Create `apps/web/components/occasion/OccasionSuggestionGrid.tsx`:
  - Grid of `OccasionSuggestionCard` components
  - Loading skeleton state
  - Empty state with message
  - Responsive: 2 columns mobile, 3 tablet, 4 desktop
- Create `apps/web/lib/hooks/useOccasionSuggestions.ts`:
  - `useOccasionSuggestions(occasion, query?)` hook
  - Fetches from `/api/suggestions`
  - Returns `{ products, isLoading, error }`
  - Debounced query support
- Integrate into `apps/web/app/page.tsx`:
  - Add `OccasionFilterChips` above `OutfitDiscovery`
  - Show `OccasionSuggestionGrid` when an occasion is selected
  - Toggle between discovery view and occasion-filtered view
- Verify: Components render, occasion selection filters products, responsive layout works

### 6. Validate Backend (Data + API)
- **Task ID**: `validate-backend`
- **Depends On**: `build-suggestion-api`
- **Assigned To**: `validator-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: true (can run alongside `build-frontend-occasions`)
- Create `apps/web/lib/__tests__/supabase-products.test.ts`:
  - Test: All 1,247 women's products exist in Supabase
  - Test: Every product has a non-null `primary_occasion`
  - Test: Occasion scores are between 0 and 1
  - Test: Embeddings are 1536-dimensional vectors
  - Test: `getProductsByOccasion` returns correct filtered results
  - Test: `searchProducts` returns semantically relevant results
- Create `apps/web/lib/__tests__/occasion-tagging.test.ts`:
  - Test: Known products map to expected occasions (e.g., Simkhai dress → date_night)
  - Test: Budget items map to everyday_casual
  - Test: Multi-occasion items have reasonable score distributions
- Verify `/api/suggestions` endpoint:
  - Test: Returns 200 with valid occasion filter
  - Test: Returns products matching the requested occasion
  - Test: Semantic search returns relevant results for fashion queries
  - Test: Response schema matches expected format
- Verify `/api/products/search` endpoint:
  - Test: Semantic search works with fashion queries
  - Test: Filters (occasion, price range) applied correctly
- Run `pnpm test` to ensure all unit tests pass
- Run `pnpm build` to ensure no TypeScript compilation errors

### 7. Validate Frontend (Playwright E2E)
- **Task ID**: `validate-e2e`
- **Depends On**: `build-frontend-occasions`, `validate-backend`
- **Assigned To**: `validator-e2e`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Create `apps/web/e2e/occasion-suggestions.spec.ts` with Playwright tests:
  - Test: Page loads and occasion filter chips are visible
  - Test: Clicking "Weekend & Social" chip filters products correctly
  - Test: Clicking "Date Night" chip shows appropriate products
  - Test: Clicking "Everyday Casual" shows budget-friendly items
  - Test: Product cards display image, name, brand, price, occasion badge
  - Test: Clicking a product card opens the ProductModal
  - Test: Switching between occasions updates the grid
  - Test: Loading state shows skeletons while fetching
  - Test: Mobile responsive layout (2 columns)
- Use Playwright MCP tools (`mcp__playwright__*`) for browser automation:
  - Navigate to homepage
  - Take snapshots to verify element presence
  - Click occasion chips and verify filter behavior
  - Verify API calls in network tab
- Run `pnpm e2e:test` and verify all tests pass
- Take screenshots of each occasion view for visual verification

### 8. Final Integration Validation
- **Task ID**: `validate-all`
- **Depends On**: `validate-backend`, `validate-e2e`
- **Assigned To**: `validator-backend`
- **Agent Type**: `general-purpose`
- **Parallel**: false
- Run full test suite: `pnpm test && pnpm build`
- Verify Supabase connection is live and data persists
- Verify the complete flow: occasion chip → API call → filtered products → product modal
- Check for any TypeScript errors or lint warnings
- Verify the system falls back gracefully when Supabase is unavailable (uses JSON files)
- Produce final validation report with pass/fail status for all acceptance criteria

## Acceptance Criteria

1. **Database**: Supabase project created with pgvector enabled, all tables and indexes created
2. **Products**: All 1,247 women's products migrated to Supabase with:
   - Valid occasion scores (0-1) for all 3 occasions
   - Non-null `primary_occasion` tag
   - 1536-dimensional embedding vector
3. **Knowledge**: All knowledge base files from `/data/personas/knowledge_base/` chunked and stored in `knowledge_chunks` with embeddings
4. **API**: `/api/suggestions` returns occasion-filtered products, `/api/products/search` supports semantic search
5. **Frontend**: Occasion filter chips render and function, suggestion grid shows filtered products, responsive layout works
6. **Tests**: All unit tests pass (`pnpm test`), all E2E tests pass (`pnpm e2e:test`)
7. **Build**: `pnpm build` succeeds with no errors
8. **Fallback**: System degrades gracefully to JSON files when Supabase is unavailable

## Validation Commands

Execute these commands to validate the task is complete:

- `cd apps/web && pnpm install` - Install dependencies including @supabase/supabase-js
- `cd apps/web && pnpm build` - Verify TypeScript compilation and Next.js build
- `cd apps/web && pnpm test` - Run all unit tests (vitest)
- `cd apps/web && pnpm e2e:test` - Run Playwright E2E tests
- `cd apps/web && pnpm lint` - Verify no lint errors
- `cd apps/web && pnpm seed:products` - Verify product migration script runs
- `cd apps/web && pnpm seed:knowledge:supabase` - Verify knowledge seeding script runs
- `curl -s http://localhost:3000/api/suggestions?occasion=weekend_social | jq '.products | length'` - Verify API returns products

## Notes

- **Supabase Project**: The user needs to create a Supabase project and provide credentials. If no Supabase project exists, create one at https://supabase.com/dashboard. The free tier is sufficient.
- **Embeddings**: Use OpenAI `text-embedding-ada-002` (1536 dimensions) for consistency. Requires `OPENAI_API_KEY` env var. Alternative: use Supabase's built-in pgvector embedding generation.
- **Feature Flags**: Use `SUPABASE_PRODUCTS_ENABLED` and `SUPABASE_RAG_ENABLED` env vars to toggle between Supabase and local JSON/Vectra. This allows gradual rollout.
- **Top 3 Occasions** (from research):
  1. **Weekend & Social** (~40% catalog fit) - cafe, brunch, mall, friends
  2. **Smart Casual / Date Night** (~30%) - restaurants, rooftop bars, social events
  3. **Everyday Casual** (~45%) - daily errands, university, casual meetups
- **Occasion Scoring Heuristics** (for initial tagging, refined later with user feedback):
  - Dresses, blouses, midi skirts, knit tops → Weekend & Social (high), Date Night (medium)
  - Blazers, statement dresses, premium brands → Date Night (high)
  - Tees, polos, jeans, joggers, budget brands → Everyday Casual (high)
  - Price > 5000 THB → Date Night boost; Price < 1000 THB → Everyday Casual boost
- **Parallel Work**: Tasks `migrate-products` and `seed-knowledge` can run in parallel after `setup-supabase`. Tasks `validate-backend` can run in parallel with `build-frontend-occasions`.
- **Dependencies to install**: `pnpm add @supabase/supabase-js` (main dep), `pnpm add -D openai` (for embeddings in migration scripts)
