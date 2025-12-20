# Chore: Knowledge Seeding Script with Enhanced CLI Options

## Metadata
adw_id: `18246c98`
prompt: `Create frontend/scripts/seed-knowledge.ts - a knowledge seeding script that migrates fashion knowledge from frontend/lib/knowledge/fashion-summaries.ts to the RAG vector store. The script should: 1) Import all knowledge constants (FASHION_FUNDAMENTALS, THAI_CULTURE_FASHION, BODY_TYPE_STYLING, OCCASION_DRESS_CODES, BRAND_SIZING) from fashion-summaries.ts, 2) Transform each knowledge section into KnowledgeDocument format using createKnowledgeDocument from frontend/lib/rag/knowledge-base.ts with appropriate categories (color_theory, thai_culture, body_types, occasions, brand_intelligence, styling_rules), topics, and metadata, 3) Use indexDocuments to batch index all documents to the vector store, 4) Add CLI options for --clear (clear existing index first), --dry-run (show what would be indexed without actually indexing), and --verbose (detailed logging), 5) Include progress reporting and error handling, 6) Make it executable as a standalone script with ts-node/tsx. Follow existing patterns in the codebase for TypeScript scripts.`

## Chore Description
Create a TypeScript CLI script at `frontend/scripts/seed-knowledge.ts` that migrates existing fashion knowledge from structured constants in `fashion-summaries.ts` to the RAG vector store. This script serves as a knowledge base migration and seeding tool that transforms fashion expertise (color theory, Thai culture, body types, occasions, brand sizing) into searchable vector embeddings.

The script must:
- Import all 5 knowledge constant objects: `FASHION_FUNDAMENTALS`, `THAI_CULTURE_FASHION`, `BODY_TYPE_STYLING`, `OCCASION_DRESS_CODES`, `BRAND_SIZING`
- Use `createKnowledgeDocument` from `knowledge-base.ts` to transform each section into properly typed `KnowledgeDocument` objects
- Use `indexDocuments` from `knowledge-base.ts` for batch indexing to the vector store
- Support CLI flags: `--clear` (wipe index before seeding), `--dry-run` (preview without indexing), `--verbose` (detailed logging)
- Provide comprehensive progress reporting with document counts, timing metrics, and operation status
- Handle errors gracefully with clear error messages and proper exit codes
- Follow patterns from existing TypeScript scripts (like `test-image-generation.ts`)
- Be executable via `npx tsx scripts/seed-knowledge.ts` or `ts-node`

## Relevant Files
Use these files to complete the chore:

### Source Knowledge Files
- **`frontend/lib/knowledge/fashion-summaries.ts`** (lines 1-550)
  - Contains 5 exported constants with fashion knowledge:
    - `FASHION_FUNDAMENTALS`: Color theory, fabrics, fit, weather (lines 35-72)
    - `THAI_CULTURE_FASHION`: Cultural context, auspicious colors, etiquette (lines 77-129)
    - `BODY_TYPE_STYLING`: Body types, petite rules, problem areas (lines 134-213)
    - `OCCASION_DRESS_CODES`: Work, social, shopping scenarios (lines 218-277)
    - `BRAND_SIZING`: Thai and international brand sizing intelligence (lines 282-354)
  - Contains `FASHION_KNOWLEDGE_METADATA` with version and lastUpdated (lines 536-549)
  - Source of all knowledge to be migrated

### RAG Knowledge Base Functions
- **`frontend/lib/rag/knowledge-base.ts`** (lines 1-469)
  - `createKnowledgeDocument(data)`: Creates properly formatted KnowledgeDocument (lines 343-377)
  - `indexDocuments(documents)`: Batch indexes multiple documents (lines 243-266)
  - `clearKnowledgeBase()`: Clears entire index (lines 330-340)
  - `validateKnowledgeDocument(document)`: Validates document structure (lines 380-423)
  - `estimateDocumentStorage(document)`: Estimates storage requirements (lines 426-455)
  - All required functions for document transformation and indexing

### RAG Type Definitions
- **`frontend/lib/rag/types.ts`** (lines 1-326)
  - `KnowledgeDocument` interface (lines 36-54): id, category, title, content, contentThai, metadata
  - `KnowledgeDocumentMetadata` interface (lines 59-80): topics, occasions, gender, seasonality, lastUpdated, source, priority
  - `KnowledgeCategory` type (lines 14-21): 'styling_rules' | 'color_theory' | 'body_types' | 'occasions' | 'thai_culture' | 'brand_intelligence' | 'seasonal_trends'
  - All type definitions for proper TypeScript typing

### Reference Script Pattern
- **`frontend/scripts/test-image-generation.ts`** (lines 1-97)
  - Shows CLI script structure with environment variable loading
  - Demonstrates progress logging with emoji indicators (✅, ❌, 🎨, ⏱️, 💾)
  - Pattern for try-catch error handling and exit codes
  - Timing statistics calculation and display
  - File I/O and data processing patterns

### Package Configuration
- **`frontend/package.json`** (lines 1-97)
  - Shows existing script commands (lines 5-16)
  - Already includes `tsx` in devDependencies (line 92)
  - Includes `dotenv` pattern for environment variables
  - Reference for adding new npm scripts

### New Files
- **`frontend/scripts/seed-knowledge.ts`** (to be created)
  - Main seeding script with CLI interface
  - Document transformation logic for all 5 knowledge sections
  - CLI argument parsing for --clear, --dry-run, --verbose flags
  - Progress reporting and error handling

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Script File with Imports and Setup
- Create new file `frontend/scripts/seed-knowledge.ts`
- Add file header JSDoc with purpose, usage examples, and CLI flag documentation
- Import required dependencies:
  - `createKnowledgeDocument`, `indexDocuments`, `clearKnowledgeBase`, `validateKnowledgeDocument`, `estimateDocumentStorage` from '../lib/rag/knowledge-base'
  - All 5 knowledge constants from '../lib/knowledge/fashion-summaries'
  - `FASHION_KNOWLEDGE_METADATA` from '../lib/knowledge/fashion-summaries'
  - `KnowledgeDocument` type from '../lib/rag/types'
- Import dotenv and configure: `dotenv.config({ path: '.env.local' })`
- Set up TypeScript strict mode compliance

### 2. Implement CLI Argument Parser
- Create interface `CLIOptions { clear: boolean; dryRun: boolean; verbose: boolean; help: boolean }`
- Create function `parseArguments(): CLIOptions`
  - Parse `process.argv` for flags: `--clear`, `--dry-run`, `--verbose`, `--help`
  - Support short forms: `-c`, `-d`, `-v`, `-h`
  - Return parsed options object
- Create function `showHelp()` to display usage instructions:
  - Script description
  - Usage: `npx tsx scripts/seed-knowledge.ts [options]`
  - Available options with descriptions
  - Examples: basic run, clear and seed, dry run preview

### 3. Create Document Transformation Helpers
- Create function `formatObjectAsContent(obj: any, indentLevel: number = 0): string`
  - Recursively convert nested objects to readable markdown-style text
  - Handle objects, arrays, strings, numbers, booleans
  - Add proper indentation for nested structures
  - Format for optimal embedding generation (natural language, structured)
- Create function `generateDocumentId(category: string, section: string): string`
  - Generate stable, deterministic IDs (e.g., 'fashion_fundamentals_color_theory')
  - Use lowercase with underscores
  - Ensure uniqueness across all documents

### 4. Transform FASHION_FUNDAMENTALS Documents
- Create function `createFashionFundamentalsDocuments(): KnowledgeDocument[]`
- Transform `colorTheory` section:
  - ID: 'fashion_fundamentals_color_theory'
  - Category: 'color_theory'
  - Title: 'Fashion Fundamentals - Color Theory'
  - Content: Format colorTheory object as readable text
  - Topics: ['color', 'combinations', 'outfit_balance', 'neutrals']
- Transform `fabrics` section:
  - Category: 'styling_rules'
  - Topics: ['fabric', 'thai_climate', 'weather', 'materials']
- Transform `fit` section:
  - Category: 'styling_rules'
  - Topics: ['fit', 'proportions', 'petite', 'tailoring']
- Transform `weather` section:
  - Category: 'styling_rules'
  - Topics: ['weather', 'thai_climate', 'seasons', 'layers']
- Use `createKnowledgeDocument` for each transformation
- Add lastUpdated from `FASHION_KNOWLEDGE_METADATA.lastUpdated`

### 5. Transform THAI_CULTURE_FASHION Documents
- Create function `createThaiCultureDocuments(): KnowledgeDocument[]`
- Transform `values` and `etiquette`:
  - Category: 'thai_culture'
  - Topics: ['thai_culture', 'etiquette', 'values', 'modesty']
- Transform `birthDayColors`:
  - Category: 'color_theory'
  - Topics: ['auspicious_colors', 'thai_culture', 'birth_day', 'fortune']
- Transform `fortuneColors`:
  - Category: 'color_theory'
  - Topics: ['auspicious_colors', 'fortune', 'financial', 'love', 'career']
- Transform `colorSensitivity`:
  - Category: 'thai_culture'
  - Topics: ['occasions', 'etiquette', 'color_sensitivity', 'royal', 'funeral', 'wedding']
  - Occasions: ['wedding', 'funeral', 'temple', 'royal_events']
- Transform `regional`:
  - Category: 'thai_culture'
  - Topics: ['regional', 'bangkok', 'chiangmai', 'phuket', 'isaan']
- Use `createKnowledgeDocument` for each section

### 6. Transform BODY_TYPE_STYLING Documents
- Create function `createBodyTypeDocuments(): KnowledgeDocument[]`
- Transform each body type (hourglass, pear, apple, rectangle, invertedTriangle):
  - Category: 'body_types'
  - Topics: ['body_type', specific type name, 'styling_solutions']
  - Gender: ['women'] (body type specific)
- Transform `thaiProportions`:
  - Category: 'body_types'
  - Topics: ['body_type', 'thai_proportions', 'petite']
- Transform `petiteRules`:
  - Category: 'body_types'
  - Topics: ['petite', 'proportions', 'styling_rules']
- Transform each `problemAreas` section (wideShoulders, largeBust, etc.):
  - Category: 'body_types'
  - Topics: ['styling_solutions', 'problem_areas', specific area]
- Use `createKnowledgeDocument` for each transformation

### 7. Transform OCCASION_DRESS_CODES Documents
- Create function `createOccasionDocuments(): KnowledgeDocument[]`
- Transform `work` sections (corporateFormal, businessCasual, smartCasual):
  - Category: 'occasions'
  - Topics: ['work', 'dress_code', specific work type]
  - Occasions: ['work', 'business']
- Transform `social` sections (wedding, funeral, temple):
  - Category: 'occasions'
  - Topics: ['social', specific occasion, 'dress_code', 'thai_culture']
  - Occasions: [specific occasion name]
- Transform `shopping` sections (mall, chatuchak, luxury):
  - Category: 'occasions'
  - Topics: ['shopping', 'thai_culture', specific venue]
  - Occasions: ['shopping']
- Use `createKnowledgeDocument` for each section

### 8. Transform BRAND_SIZING Documents
- Create function `createBrandSizingDocuments(): KnowledgeDocument[]`
- Transform `thaiBrands` (jaspal, kloset, cpsOtter, poetry):
  - Category: 'brand_intelligence'
  - Topics: ['brand_sizing', 'thai_brands', 'central_group', brand name]
- Transform `internationalSizeUp` (zara, mango):
  - Category: 'brand_intelligence'
  - Topics: ['brand_sizing', 'international_brands', 'size_up', brand name]
- Transform `internationalTrueSize` (hAndM, uniqlo, cos):
  - Category: 'brand_intelligence'
  - Topics: ['brand_sizing', 'international_brands', 'true_to_size', brand name]
- Transform `luxury` (gucci, general):
  - Category: 'brand_intelligence'
  - Topics: ['brand_sizing', 'luxury_brands', brand name]
- Transform `quickReference`:
  - Category: 'brand_intelligence'
  - Topics: ['brand_sizing', 'quick_reference', 'sizing_guide']
- Use `createKnowledgeDocument` for each brand or section

### 9. Implement Main Seeding Function
- Create async function `seedKnowledgeBase(options: CLIOptions): Promise<void>`
- Log seeding start: '🌱 Starting knowledge base seeding...'
- If `options.verbose`, log detailed initialization info
- Collect all documents:
  - Call `createFashionFundamentalsDocuments()`
  - Call `createThaiCultureDocuments()`
  - Call `createBodyTypeDocuments()`
  - Call `createOccasionDocuments()`
  - Call `createBrandSizingDocuments()`
  - Flatten into single array
- Log total document count: '📚 Created {count} knowledge documents'
- If `options.verbose`, log category breakdown with document counts
- Validate all documents using `validateKnowledgeDocument`
  - Log validation errors if any found
  - Filter out invalid documents
- If `options.verbose`, estimate and log storage requirements using `estimateDocumentStorage`
- If `options.dryRun`:
  - Log 'DRY RUN: Would index {count} documents'
  - Display sample documents (first 3) with details
  - Skip actual indexing, return early
- If `options.clear`:
  - Call `clearKnowledgeBase()`
  - Log '🗑️ Cleared existing knowledge base'
- Start timing: `const startTime = Date.now()`
- Call `indexDocuments(allDocuments)`
- Calculate duration: `const duration = Date.now() - startTime`
- Log success: '✅ Successfully indexed {chunksCount} chunks in {duration}ms'
- Log summary statistics

### 10. Add Comprehensive Error Handling
- Wrap document creation functions in try-catch blocks
  - Log specific error for each transformation function that fails
  - Continue with other transformations even if one fails
- Wrap validation in try-catch
  - Log validation errors with document IDs
  - Provide actionable error messages
- Wrap indexing in try-catch
  - Handle network errors (e.g., OpenRouter API issues)
  - Handle vector store errors (e.g., file system issues)
  - Log specific error types with context
- Add error recovery suggestions in messages
- Ensure proper cleanup even on failure

### 11. Implement Main Execution Function
- Create async function `main()`
- Parse CLI arguments: `const options = parseArguments()`
- If `options.help`, show help and exit(0)
- Display banner:
  ```
  ═══════════════════════════════════════════
  🌱 OOTDay Knowledge Base Seeding Tool
  ═══════════════════════════════════════════
  ```
- If `options.verbose`, log all active options
- Check environment:
  - Verify vector store directory exists or can be created
  - Log environment status
- Call `seedKnowledgeBase(options)`
- Display completion banner with final statistics
- Exit with code 0 on success
- Wrap entire execution in try-catch:
  - Log error with emoji indicator: '❌'
  - Display error message and stack trace if verbose
  - Exit with code 1 on failure

### 12. Add Progress Logging System
- Create helper function `log(message: string, emoji: string, verbose: boolean)`
- Use consistent emoji indicators:
  - 🌱 Seeding operations
  - 📚 Document operations
  - ✅ Success indicators
  - ❌ Error indicators
  - ⚠️ Warning indicators
  - 🗑️ Clearing operations
  - ⏱️ Timing statistics
  - 💾 Storage information
  - 🔍 Verbose/debug information
- Log each major step with clear, concise messages
- Show document counts per category (verbose mode)
- Display progress for long-running operations
- Show final summary: total docs, chunks, categories, timing
- Format timing in human-readable format (ms, seconds)

### 13. Add Script Execution Documentation
- Add JSDoc header to main script with:
  - Purpose and description
  - Usage examples for all CLI options
  - Requirements (environment variables, dependencies)
  - Exit codes (0=success, 1=failure)
- Add inline comments for complex transformations
- Document the document ID generation strategy
- Explain category mapping rationale in comments
- Add TypeScript type annotations throughout

### 14. Validate and Test Script
- Add TypeScript type checking for all functions
- Ensure all imports resolve correctly
- Verify document IDs are unique across all categories
- Check that all metadata fields match RAG system expectations
- Test that `createKnowledgeDocument` calls have all required parameters
- Confirm `indexDocuments` receives properly formatted documents
- Verify CLI argument parsing handles all flags correctly
- Test error handling with missing dependencies

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npx tsc --noEmit scripts/seed-knowledge.ts` - Type-check the script without compiling
- `cd frontend && npx tsx scripts/seed-knowledge.ts --help` - Display help message (should show usage and options)
- `cd frontend && npx tsx scripts/seed-knowledge.ts --dry-run --verbose` - Preview seeding without indexing (should show all documents and estimates)
- `cd frontend && npx tsx scripts/seed-knowledge.ts --clear --verbose` - Clear and seed with detailed logging (full execution test)
- `cd frontend && npx tsx scripts/seed-knowledge.ts` - Run seeding in normal mode (should index all documents)
- Manual inspection: Verify console output shows proper emoji indicators, progress messages, and statistics
- Manual inspection: Check that --dry-run mode shows documents but doesn't actually index
- Manual inspection: Confirm --verbose mode shows category breakdowns and storage estimates
- Manual inspection: Test --clear flag actually clears the index before seeding
- Manual inspection: Verify error handling by temporarily breaking a transformation function
- Code review: Confirm all 5 knowledge constants are imported and transformed
- Code review: Verify all documents use `createKnowledgeDocument` from knowledge-base.ts
- Code review: Check that `indexDocuments` is used for batch indexing
- Code review: Ensure stable document IDs for idempotent re-runs

## Notes
- This script is designed for one-time migration and periodic re-seeding of knowledge base
- Document IDs must be stable and deterministic to support idempotent re-runs
- The `--clear` flag is essential for development/testing to reset the index
- The `--dry-run` flag allows previewing transformations without affecting the vector store
- The `--verbose` flag provides detailed insights into the seeding process
- Content formatting should optimize for embedding quality - clear, self-contained, natural language
- Metadata fields (topics, occasions, gender, seasonality) enable advanced filtering in retrieval
- Priority can be added to metadata to boost certain documents during retrieval
- The script should handle failures gracefully and provide actionable error messages
- Consider running this script after major updates to fashion-summaries.ts
- Storage estimates help plan vector store capacity requirements
- Validation ensures documents meet RAG system requirements before indexing
- The script patterns can be reused for other knowledge source migrations
