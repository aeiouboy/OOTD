# Vectra Removal - Feb 2026

## Summary
Removed Vectra in-memory vector store fallback to simplify the RAG pipeline and avoid potential errors. The system now uses **Supabase pgvector exclusively** for all semantic search operations.

## Changes Made

### 1. Simplified RAG Retrieval Logic
**File**: `lib/services/ai-chat-service.ts`
- Removed `retrieveVectorKnowledge()` Vectra fallback logic (lines 396-463)
- Simplified to Supabase-only retrieval with error handling
- Removed `getRAGService` import (no longer needed)
- Environment flags `SUPABASE_RAG_ENABLED` and `SUPABASE_RAG_STRICT` are now obsolete

### 2. Removed Vectra Dependency
**File**: `package.json`
- Removed `"vectra": "^0.11.1"` from dependencies (line 83)
- Ran `pnpm remove vectra` (already uninstalled)

### 3. Updated Environment Configuration
**File**: `.env.sample`
- Changed comment for `SUPABASE_RAG_ENABLED` from "true = Supabase; false = Vectra fallback"
- To: "REQUIRED: Supabase pgvector RAG (Vectra fallback removed)"

### 4. Deprecated Legacy Files
**Files marked as deprecated** (kept for reference, may be removed later):
- `lib/rag/vector-store.ts` - Vectra wrapper implementation
- `lib/rag/retrieval.ts` - Vectra-based retrieval pipeline

These files still have `import { LocalIndex } from 'vectra'` but are no longer invoked in production code.

### 5. Updated Project Memory
**File**: `~/.claude/projects/-Users-tachongrak-Projects-OOTD/memory/MEMORY.md`
- Updated RAG Pipeline section to reflect Supabase-only architecture
- Removed references to "3-tier fallback" (Supabase → Vectra → Keyword)
- Now documents "Supabase-Only" with keyword fallback only

## Why This Change?

### Problems with Vectra Fallback:
1. **Error-prone**: Vectra has limited English-only dataset (33 docs vs 225 in Supabase)
2. **Maintenance burden**: Two vector stores to keep in sync
3. **Thai language gaps**: Vectra lacks Thai cultural knowledge critical for target users
4. **Complexity**: Cascading fallback logic made debugging harder
5. **Unused in production**: `SUPABASE_RAG_ENABLED=true` means Vectra never ran

### Benefits of Supabase-Only:
1. ✅ **Single source of truth** - One vector store, easier to maintain
2. ✅ **Better Thai support** - All 225 knowledge chunks with cross-language embeddings
3. ✅ **Simpler code** - Less fallback logic, clearer error handling
4. ✅ **Production-ready** - Already running this way, just codifying it

## Migration Notes

### Before (3-tier fallback):
```
User Query → Supabase pgvector (primary)
            ↓ (if fails/empty)
            Vectra in-memory (fallback #1)
            ↓ (if fails/empty)
            Keyword matching (fallback #2)
```

### After (Supabase-only):
```
User Query → Supabase pgvector (only vector source)
            ↓ (if fails/empty)
            Keyword matching (fallback)
```

## Testing Recommendations

1. **Verify Supabase connection** - Ensure `.env.local` has valid Supabase credentials
2. **Test Thai queries** - Confirm cross-language embedding retrieval still works (threshold 0.25)
3. **Test error handling** - Verify graceful degradation when Supabase is unavailable
4. **Check keyword fallback** - Ensure hardcoded knowledge still works for offline mode

## Rollback (if needed)

If you need to restore Vectra fallback:
1. Restore `vectra` to package.json: `pnpm add vectra@^0.11.1`
2. Revert `lib/services/ai-chat-service.ts` changes to restore cascade logic
3. Re-add `getRAGService` import
4. Update `.env.sample` comments

## Files Still Using Vectra (Deprecated)

These files have `import { LocalIndex } from 'vectra'` but are marked deprecated:
- `lib/rag/vector-store.ts` (wrapper for Vectra index)
- `lib/rag/retrieval.ts` (Vectra-based retrieval pipeline)
- `lib/rag/index.ts` (exports RAGService which uses vector-store internally)

**Action**: Can be safely deleted in future cleanup, or kept as reference implementation.

## Date
February 12, 2026
