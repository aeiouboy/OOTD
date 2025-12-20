# Chore: Knowledge Seeding Script

## Metadata
adw_id: `3eb20b19`
prompt: `Create a knowledge seeding script at frontend/scripts/seed-knowledge.ts that migrates fashion knowledge from frontend/lib/knowledge/fashion-summaries.ts to the RAG vector store. The script should: 1) Import all knowledge constants (FASHION_FUNDAMENTALS, THAI_CULTURE_FASHION, BODY_TYPE_STYLING, OCCASION_DRESS_CODES, BRAND_SIZING) from fashion-summaries.ts. 2) Convert each knowledge section into KnowledgeDocument objects using RAGService.createDocument() with appropriate categories (styling_rules, color_theory, body_types, occasions, thai_culture, brand_intelligence), topics, and metadata including lastUpdated date. 3) Initialize the RAGService and use indexBatch() to add all documents. 4) Provide CLI execution with progress logging showing document counts, timing statistics, and error handling. 5) Support a --clear flag to clear the existing index before seeding. 6) Follow existing patterns in frontend/lib/rag/ for service usage and types. The script should be executable via ts-node or npx tsx.`

## Chore Description
Create a TypeScript CLI script that serves as a one-time migration tool to populate the RAG vector store with existing fashion knowledge from the `fashion-summaries.ts` module. The script will transform structured TypeScript constants containing fashion expertise (color theory, Thai culture, body types, occasions, brand sizing) into indexed `KnowledgeDocument` objects stored in the vector database. This enables semantic search and retrieval of fashion knowledge for the AI fashion assistant.

The script must:
- Import all 5 knowledge constant objects from `fashion-summaries.ts`
- Transform each section into properly categorized `KnowledgeDocument` objects with appropriate metadata
- Use the existing `RAGService` class to initialize the vector store and batch-index documents
- Provide a command-line interface with progress tracking, timing metrics, and error handling
- Support a `--clear` flag to optionally wipe the index before seeding (for development/testing)
- Follow TypeScript best practices and patterns from existing scripts in `frontend/scripts/`
- Be executable via `npx tsx scripts/seed-knowledge.ts`

## Relevant Files
Use these files to complete the chore:

### Source Files
- **`frontend/lib/knowledge/fashion-summaries.ts`** (lines 1-550)
  - Contains 5 exported constants: `FASHION_FUNDAMENTALS`, `THAI_CULTURE_FASHION`, `BODY_TYPE_STYLING`, `OCCASION_DRESS_CODES`, `BRAND_SIZING`
  - Provides metadata constant `FASHION_KNOWLEDGE_METADATA` with version and lastUpdated fields
  - Source of all knowledge content to be migrated

### RAG System Files
- **`frontend/lib/rag/index.ts`** (lines 143-383)
  - Exports `RAGService` class with methods: `initialize()`, `indexBatch()`, `clearAll()`, `createDocument()`, `close()`
  - Shows usage patterns for service initialization and bulk indexing
  - Line 323: `createDocument()` signature for building documents

- **`frontend/lib/rag/types.ts`** (lines 1-326)
  - Defines `KnowledgeDocument` interface (lines 36-54)
  - Defines `KnowledgeDocumentMetadata` interface (lines 58-80)
  - Defines `KnowledgeCategory` type (lines 14-21): 'styling_rules' | 'color_theory' | 'body_types' | 'occasions' | 'thai_culture' | 'brand_intelligence' | 'seasonal_trends'
  - TypeScript types for all RAG operations

- **`frontend/lib/rag/knowledge-base.ts`** (lines 343-377)
  - Shows `createKnowledgeDocument()` function signature (lines 348-377)
  - Demonstrates required fields and metadata structure
  - Used by RAGService.createDocument()

- **`frontend/lib/rag/config.ts`** (lines 1-307)
  - Contains `RAG_CONFIG` with embedding, retrieval, and vector store settings
  - Category configurations with priorities (lines 106-142)
  - Helpful for understanding system constraints

### Reference Script
- **`frontend/scripts/test-image-generation.ts`** (lines 1-97)
  - Example of CLI script structure with dotenv loading
  - Shows progress logging patterns (✅, ❌, 🎨, ⏱️, 💾 emojis)
  - Demonstrates error handling and exit codes
  - Pattern for try/catch blocks and timing statistics

### New Files
- **`frontend/scripts/seed-knowledge.ts`** (to be created)
  - Main seeding script with CLI execution
  - Implements document transformation and batch indexing
  - Includes progress logging and error handling

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Script File Structure
- Create new file `frontend/scripts/seed-knowledge.ts`
- Add file header documentation with purpose, usage instructions
- Import required dependencies: RAGService, types, fashion-summaries constants, dotenv
- Import command-line argument parsing (process.argv)
- Set up dotenv configuration for environment variables

### 2. Implement Document Transformation Functions
- Create helper function `createFashionFundamentalsDocuments()` to transform `FASHION_FUNDAMENTALS`
  - Map `colorTheory` section to category 'color_theory', topics ['color', 'combinations', 'outfit_balance']
  - Map `fabrics` section to category 'styling_rules', topics ['fabric', 'thai_climate', 'weather']
  - Map `fit` section to category 'styling_rules', topics ['fit', 'proportions', 'petite']
  - Map `weather` section to category 'styling_rules', topics ['weather', 'thai_climate', 'seasons']
- Create helper function `createThaiCultureDocuments()` to transform `THAI_CULTURE_FASHION`
  - Map `values` and `etiquette` to category 'thai_culture'
  - Map `birthDayColors` and `fortuneColors` to category 'color_theory' with topics ['auspicious_colors', 'thai_culture']
  - Map `colorSensitivity` to category 'thai_culture' with topics ['occasions', 'etiquette']
  - Map `regional` to category 'thai_culture' with topics ['regional', 'culture']
- Create helper function `createBodyTypeDocuments()` to transform `BODY_TYPE_STYLING`
  - Map each body type (hourglass, pear, apple, rectangle, invertedTriangle) to category 'body_types'
  - Map `petiteRules` to category 'body_types' with topics ['petite', 'proportions']
  - Map `problemAreas` to category 'body_types' with topics ['styling_solutions', 'problem_areas']
- Create helper function `createOccasionDocuments()` to transform `OCCASION_DRESS_CODES`
  - Map `work` sections to category 'occasions' with topics ['work', 'dress_codes']
  - Map `social` sections to category 'occasions' with topics ['social', 'weddings', 'funerals', 'temple']
  - Map `shopping` sections to category 'occasions' with topics ['shopping', 'thai_culture']
- Create helper function `createBrandSizingDocuments()` to transform `BRAND_SIZING`
  - Map all brand sections to category 'brand_intelligence'
  - Add topics ['brand_sizing', 'central_group'] for Thai brands
  - Add topics ['brand_sizing', 'international'] for international brands
  - Include metadata with brand names and sizing advice in content

### 3. Implement Document Content Formatting
- Create helper function `formatObjectAsContent(obj: any): string` to serialize nested objects
  - Convert JavaScript objects to readable markdown-style text
  - Handle nested objects, arrays, and primitive values
  - Format for optimal embedding generation (clear, structured, natural language)
- Add title generation logic based on section names
- Ensure content includes context for standalone understanding (e.g., "FASHION FUNDAMENTALS - Color Theory:")
- Use lastUpdated from `FASHION_KNOWLEDGE_METADATA.lastUpdated`

### 4. Build Main Seeding Function
- Create async function `seedKnowledgeBase(clearFirst: boolean = false)`
- Initialize timing with `const startTime = Date.now()`
- Log seeding start with '🌱 Starting knowledge base seeding...'
- Call all document creation functions to collect documents
- Log total document count before indexing
- If `clearFirst` flag is true:
  - Call `ragService.clearAll()` with confirmation message
  - Log number of documents cleared
- Call `ragService.indexBatch(allDocuments)` to index all documents
- Calculate and log timing statistics: `const duration = Date.now() - startTime`
- Log success message with total chunks indexed
- Return success status and statistics object

### 5. Add Error Handling and Validation
- Wrap document creation in try-catch blocks
- Validate each document using RAGService patterns before adding to batch
- Handle RAGService initialization failures with clear error messages
- Catch and log embedding generation errors during indexing
- Provide helpful error messages for common issues (missing env vars, network failures)
- Ensure proper cleanup with `ragService.close()` in finally block

### 6. Implement CLI Interface
- Parse command-line arguments for `--clear` flag: `const shouldClear = process.argv.includes('--clear')`
- Show help message if `--help` flag provided
- Create main execution function that:
  - Displays ASCII art banner or header
  - Checks for required environment variables (OPENROUTER_API_KEY)
  - Initializes RAGService with status logging
  - Calls seedKnowledgeBase() with appropriate flags
  - Displays final summary with document counts, timing, success/failure
  - Exits with appropriate code (0 for success, 1 for failure)
- Add progress indicators during long operations (e.g., "Indexing documents...")

### 7. Add Progress Logging
- Use emoji indicators for different operations:
  - ✅ Success indicators
  - ❌ Error indicators
  - 🌱 Seeding operations
  - 📚 Document operations
  - ⏱️ Timing statistics
  - 🗑️ Clearing operations
- Log each major step with clear, concise messages
- Show document counts per category after transformation
- Display embedding generation progress for large batches
- Show final statistics: total documents, chunks, categories, duration

### 8. Validate Script Execution
- Add TypeScript type checking throughout
- Ensure script can be executed via `npx tsx scripts/seed-knowledge.ts`
- Test `--clear` flag functionality with conditional logging
- Verify all knowledge constants are properly imported and used
- Confirm document IDs are unique (use format: `fashion_fundamentals_color_theory`, etc.)
- Check that metadata includes proper categories and topics matching RAG system expectations

## Validation Commands
Execute these commands to validate the chore is complete:

- `npx tsx --version` - Verify tsx is available for TypeScript execution
- `cd frontend && npx tsc --noEmit scripts/seed-knowledge.ts` - Type-check the script without compiling
- `cd frontend && npx tsx scripts/seed-knowledge.ts --help` - Test help message display
- `cd frontend && npx tsx scripts/seed-knowledge.ts --clear` - Run seeding with clear flag (full execution test)
- `cd frontend && npx tsx scripts/seed-knowledge.ts` - Run seeding without clear flag (append mode test)
- Manual inspection: Verify console output shows proper progress logging, document counts, timing, and success indicators
- Manual inspection: Check that error handling works by temporarily removing OPENROUTER_API_KEY
- Code review: Confirm all 5 knowledge constants are imported and processed

## Notes
- The script performs a one-time migration of existing static knowledge into the RAG vector store
- Document IDs should be stable and deterministic (e.g., `fashion_fundamentals_color_theory`) to support re-running without duplicates
- The `--clear` flag is important for development/testing to reset the index
- Content formatting should optimize for embedding quality - clear, self-contained text chunks
- Consider adding a `--dry-run` flag in the future for testing transformations without indexing
- The script should be idempotent when possible (re-running should update existing documents, not create duplicates)
- Metadata fields (topics, occasions, gender, seasonality) enable advanced filtering in retrieval queries
- Priority field in metadata can be used to boost certain categories during retrieval (e.g., thai_culture has priority 1.1 per config.ts:130)
