# Plan: Add Pagination to GET /api/suggestions

## Task Description
Add cursor-free, page-based pagination to the existing `GET /api/suggestions` endpoint. Support `?page=1&limit=20` query params and return `{ data, total, page, totalPages }` response shape.

## Objective
When this plan is complete, the `GET /api/suggestions` endpoint will accept `page` and `limit` query parameters and return a paginated response with `{ data, total, page, totalPages }` metadata, enabling clients to page through products efficiently.

## Relevant Files
Use these files to complete the task:

- `apps/web/app/api/suggestions/route.ts` — The route handler to modify. Currently returns `{ products, occasion, total, source }`. The GET handler needs `page` param, offset logic, and new response shape.
- `apps/web/lib/supabase/products.ts` — `getProductsByOccasion()` and `getAllProducts()` need `offset` parameter support via Supabase `.range()`.
- `apps/web/lib/__tests__/suggestions-api.test.ts` — Existing tests that verify response schema. Must be updated for new `{ data, total, page, totalPages }` shape.
- `apps/web/lib/hooks/useOccasionSuggestions.ts` — Frontend hook calling `/api/suggestions`. Must read from `data` instead of `products`.
- `apps/web/components/occasion/OccasionSuggestionGrid.tsx` — Frontend component consuming the hook; may reference `products` field.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-pagination
  - Role: Implement pagination in the API route, Supabase queries, and frontend hook
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-pagination
  - Role: Verify pagination works correctly — response shape, math, edge cases, test pass
  - Agent Type: validator
  - Resume: true

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Implement Pagination in Supabase Query Functions
- **Task ID**: supabase-pagination
- **Depends On**: none
- **Assigned To**: builder-pagination
- **Agent Type**: builder
- **Parallel**: false
- In `apps/web/lib/supabase/products.ts`:
  - Add `offset` parameter (default `0`) to `getProductsByOccasion(occasion, limit, offset)` and `getAllProducts(limit, offset)`
  - Use Supabase `.range(offset, offset + limit - 1)` instead of `.limit(limit)`
  - Add new exported function `getProductCount(occasion?: OccasionType): Promise<number>` that runs a count query:
    ```ts
    const query = supabase.from('products').select('*', { count: 'exact', head: true })
    if (occasion) query.eq('primary_occasion', occasion)
    ```
  - Keep backward-compatible defaults (`offset = 0`)

### 2. Add Pagination to GET /api/suggestions Route
- **Task ID**: route-pagination
- **Depends On**: supabase-pagination
- **Assigned To**: builder-pagination
- **Agent Type**: builder
- **Parallel**: false
- In `apps/web/app/api/suggestions/route.ts` — modify the `GET` handler:
  - Parse `page` param: `const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))`
  - Parse `limit` param (already exists): clamp to `Math.min(Math.max(1, limit), 100)` to prevent abuse
  - Compute `offset = (page - 1) * limit`
  - **Supabase path**: call `getProductCount(occasion)` for total, then `getProductsByOccasion(occasion, limit, offset)` or `getAllProducts(limit, offset)` for data
  - **JSON fallback path (`fallbackJsonResponse`)**: add `page` and `offset` params. Compute `total` from full filtered array length, then `.slice(offset, offset + limit)` for data
  - Change response shape from `{ products, occasion, total, source }` to:
    ```json
    {
      "data": [...],
      "total": 150,
      "page": 1,
      "totalPages": 8,
      "occasion": "weekend_social",
      "source": "supabase"
    }
    ```
  - `totalPages = Math.ceil(total / limit)`
  - Keep `occasion` and `source` fields for backward compat context

### 3. Update Frontend Hook
- **Task ID**: frontend-hook
- **Depends On**: route-pagination
- **Assigned To**: builder-pagination
- **Agent Type**: builder
- **Parallel**: false
- In `apps/web/lib/hooks/useOccasionSuggestions.ts`:
  - Change `data.products` to `data.data` when reading the API response
  - No other changes needed (the hook currently fetches page 1 with limit 20 — same default behavior)

### 4. Update Existing Tests
- **Task ID**: update-tests
- **Depends On**: route-pagination
- **Assigned To**: builder-pagination
- **Agent Type**: builder
- **Parallel**: false
- In `apps/web/lib/__tests__/suggestions-api.test.ts`:
  - Update all assertions that check `body.products` → `body.data`
  - Update schema checks: expect `data`, `total`, `page`, `totalPages` fields
  - Add new test: `GET with page=2 returns correct offset slice`
  - Add new test: `GET with page beyond total returns empty data array`
  - Add new test: `totalPages is computed correctly` (e.g., 3 items with limit=2 → totalPages=2)
  - Existing test `GET total matches products array length` should verify `total` is the full count (not just current page length)

### 5. Validate All Changes
- **Task ID**: validate-all
- **Depends On**: supabase-pagination, route-pagination, frontend-hook, update-tests
- **Assigned To**: validator-pagination
- **Agent Type**: validator
- **Parallel**: false
- Read `apps/web/app/api/suggestions/route.ts` and verify:
  - `page` and `limit` are parsed with sane defaults and clamping
  - `offset` calculation is correct: `(page - 1) * limit`
  - Response shape is `{ data, total, page, totalPages, occasion, source }`
  - `totalPages = Math.ceil(total / limit)`
- Read `apps/web/lib/supabase/products.ts` and verify:
  - `.range()` is used correctly with `offset` and `limit`
  - `getProductCount()` exists and uses `{ count: 'exact', head: true }`
- Read `apps/web/lib/hooks/useOccasionSuggestions.ts` and verify `data.data` is used
- Run `cd apps/web && pnpm vitest run lib/__tests__/suggestions-api.test.ts` and confirm all tests pass
- Run `cd apps/web && pnpm tsc --noEmit` to verify no type errors

## Acceptance Criteria
- `GET /api/suggestions` accepts `?page=1&limit=20` query params
- Response shape is `{ data: Product[], total: number, page: number, totalPages: number, occasion: string, source: string }`
- `page` defaults to `1`, `limit` defaults to `20`, `limit` is clamped to max `100`
- `totalPages` is `Math.ceil(total / limit)`
- Page beyond total returns `{ data: [], total: N, page: M, totalPages: X }`
- Both Supabase and JSON fallback paths support pagination
- All existing and new tests pass
- No TypeScript errors

## Validation Commands
Execute these commands to validate the task is complete:

- `cd apps/web && pnpm vitest run lib/__tests__/suggestions-api.test.ts` — Run suggestions API tests
- `cd apps/web && pnpm tsc --noEmit` — Check for TypeScript errors

## Notes
- The POST handler is NOT being paginated in this task — only GET.
- `limit` param already existed but had no upper bound — we're adding a cap of 100.
- The response field rename from `products` to `data` is a breaking change for any consumer reading `products`. The frontend hook is updated to match.
