# Task List: Central Group Product Scraping System

Generated from: `0003-prd-central-product-scraping-system.md`

## Current State Assessment

**Existing Infrastructure:**
- `/BEcode/` directory exists with prototype scrapers (Playwright-based)
- `/agents/` directory exists with a basic scraper agent definition
- `/products/` directory exists with some sample product data
- `/log/` directory exists with sample log files
- Existing code uses Playwright for scraping (not Crawl4AI as specified in PRD)

**Key Existing Files:**
- `BEcode/central_scraper_playwright.py` - Playwright-based scraper with async architecture
- `agents/scraper.md` - Basic scraper agent documentation
- Sample outputs in `products/` directory

**Architecture Patterns Identified:**
- Async/await pattern for concurrent operations
- JSON output with structured data
- Logging to both file and console
- Category-based organization

## Relevant Files

### To Be Created:
- `BEcode/central_scrape_1.py` - Main orchestrator for Crawl4AI-based multi-worker scraping system
- `BEcode/config.py` - Configuration management for workers, categories, timeouts, and paths
- `BEcode/scraper_worker.py` - Individual worker implementation using Crawl4AI
- `BEcode/data_validator.py` - Data validation engine for quality checks
- `BEcode/storage_manager.py` - Handles JSON file I/O with versioning and atomic writes
- `BEcode/logger.py` - Centralized JSON logging system
- `BEcode/requirements.txt` - Python dependencies including crawl4ai
- `agents/scraper.md` - Update existing agent definition with new architecture details

### To Be Modified:
- `agents/scraper.md` - Enhance with Crawl4AI-specific capabilities and multi-worker architecture

### Output Directories:
- `/products/` - Category JSON files and `all_categories.json`
- `/log/` - JSON-formatted log files with scraping sessions

### Notes
- This project uses Crawl4AI framework (not Playwright) as specified in the PRD
- The system requires Python 3.9+
- All scrapers must use version naming conventions (e.g., `central_scrape_1.py`, `central_scrape_2.py`)
- No test files specified in PRD - this is a one-time data collection script

## Tasks

- [ ] 1.0 Set up Crawl4AI environment and project configuration
  - [ ] 1.1 Install Crawl4AI and verify it works with a simple test script
  - [ ] 1.2 Create `BEcode/requirements.txt` with all dependencies (crawl4ai, asyncio, uuid, etc.)
  - [ ] 1.3 Create `BEcode/config.py` with configuration constants (CATEGORIES dict with women/men URLs, DEFAULT_WORKERS=3, PRODUCTS_DIR, LOG_DIR, timeout settings)
  - [ ] 1.4 Verify all required directories exist (`/products/`, `/log/`, `/agents/`) and create if missing
  - [ ] 1.5 Test basic Crawl4AI functionality by fetching a single product page from central.co.th

- [ ] 2.0 Implement multi-worker scraper architecture with configurable workers
  - [ ] 2.1 Create `BEcode/scraper_worker.py` with a Worker class that uses Crawl4AI to scrape a single category
  - [ ] 2.2 Implement category page crawling logic to extract all product URLs (handle pagination and infinite scroll)
  - [ ] 2.3 Implement product detail extraction for each SKU (brand, name, unit_price, original_price, url, image_urls, description, variants with sizes/colors)
  - [ ] 2.4 Add anti-scraping mitigation strategies (user-agent rotation, intelligent throttling, session management)
  - [ ] 2.5 Create `BEcode/central_scrape_1.py` main orchestrator that manages worker pool using multiprocessing or asyncio
  - [ ] 2.6 Implement configurable worker count (read from config, default to 3 workers)
  - [ ] 2.7 Create work queue that distributes categories to available workers
  - [ ] 2.8 Add worker monitoring to track progress and utilization metrics

- [ ] 3.0 Build data extraction and validation engine
  - [ ] 3.1 Create `BEcode/data_validator.py` with validation functions for each field type
  - [ ] 3.2 Implement SKU validation (exists, non-empty, unique within category)
  - [ ] 3.3 Implement required fields validation (brand, product_name, at least one price, valid URL)
  - [ ] 3.4 Implement price validation (numeric format, reasonable ranges, unit_price <= original_price)
  - [ ] 3.5 Implement image URL validation (accessible, returns valid response - use HEAD request)
  - [ ] 3.6 Add duplicate SKU detection across products within a category
  - [ ] 3.7 Create validation report structure showing pass/fail counts and specific errors
  - [ ] 3.8 Integrate validator into scraper workflow - validate after scraping each category

- [ ] 4.0 Implement comprehensive error handling and recovery mechanisms
  - [ ] 4.1 Implement exponential backoff retry logic for failed HTTP requests (max 3 retries, delays: 2s, 4s, 8s)
  - [ ] 4.2 Add timeout extension logic to wait for complete category scraping before saving
  - [ ] 4.3 Implement partial results saving mechanism (checkpoint after each category)
  - [ ] 4.4 Add resume capability - detect existing category files and skip completed categories
  - [ ] 4.5 Implement graceful error handling for worker failures (log error, continue with other categories)
  - [ ] 4.6 Add validation check before saving - only save category if 100% of expected SKUs are scraped and validated
  - [ ] 4.7 Create error aggregation system to collect all errors across workers

- [ ] 5.0 Create output generation and JSON logging systems
  - [ ] 5.1 Create `BEcode/storage_manager.py` with functions for saving JSON files
  - [ ] 5.2 Implement category file generation with naming format `{category-name}.json` (e.g., `women.json`, `men.json`)
  - [ ] 5.3 Implement version numbering for output files if file already exists (e.g., `women_1.json`, `women_2.json`)
  - [ ] 5.4 Implement atomic file writes using temp files and rename to prevent corruption
  - [ ] 5.5 Generate `all_categories.json` combining all successfully scraped categories
  - [ ] 5.6 Create `BEcode/logger.py` for JSON-formatted logging system
  - [ ] 5.7 Implement log structure with session_id, timestamps, configuration, summary stats, category details, and errors
  - [ ] 5.8 Add worker utilization metrics to logs (% time active, products per worker, etc.)
  - [ ] 5.9 Generate final summary log file in `/log/` directory with ISO timestamp in filename

- [ ] 6.0 Perform end-to-end testing and validation
  - [ ] 6.1 Run full scraping test on a single small category to verify workflow
  - [ ] 6.2 Verify all product fields are correctly extracted and formatted
  - [ ] 6.3 Test with 1, 2, and 3 workers to verify parallel processing works correctly
  - [ ] 6.4 Run full scrape of Women's and Men's categories
  - [ ] 6.5 Validate output JSON files are properly formatted and contain all expected products
  - [ ] 6.6 Verify validation pass rate is ≥ 99% as per success metrics
  - [ ] 6.7 Check log files contain complete session information and error details
  - [ ] 6.8 Verify no duplicate SKUs exist in final output files
  - [ ] 6.9 Calculate and verify worker utilization is ≥ 80%
  - [ ] 6.10 Update `agents/scraper.md` with final architecture documentation and usage instructions
