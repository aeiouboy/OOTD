# Chore: Scrape Product Details with Firecrawl MCP for Enhanced Classification

## Metadata
adw_id: `e07cb522`
prompt: `Create scrape_product_details.py and markdown_parser.py for Firecrawl MCP web scraping. Use firecrawl_scrape with onlyMainContent=false to get breadcrumb (subcategory), material, fit, color from Central.co.th product pages. Save to women_clothing_scraped.json. Then re-run classification with scraped data for better accuracy.`

## Chore Description

Enhance the women's clothing occasion classification system by implementing web scraping capabilities using Firecrawl MCP to extract missing product attributes from Central.co.th product pages. Currently, the classification system achieves 97.4% coverage (32/1,247 unclassified) but relies only on product names and limited metadata. By scraping actual product pages for detailed attributes like subcategory, material, fit, care instructions, and color, we can improve classification accuracy and reduce unclassified products.

### Objectives

1. **Web Scraping Implementation**: Create `scrape_product_details.py` to scrape product pages using Firecrawl MCP's `firecrawl_scrape` tool with `onlyMainContent=false` to capture breadcrumb navigation and product details sections.

2. **Markdown Parsing**: Create enhanced `markdown_parser.py` module to extract structured data from scraped markdown content using robust regex patterns.

3. **Data Enrichment**: Save enriched product data to `women_clothing_scraped.json` with new fields: `subcategory`, `material`, `fit`, `care`, `color_from_page`, `sleeve_type`, `length_type`.

4. **Re-classification**: Update `classify_occasions.py` to optionally load scraped data and leverage new attributes for improved occasion matching.

### Expected Improvements

- **Unclassified Products**: Target reduction from 32 (2.6%) to <10 (0.8%)
- **Classification Accuracy**: Improve precision for edge cases (blazers, vests, specialty items)
- **Material-Based Matching**: Enable occasion rules to match based on fabric (e.g., sequin/satin for party occasions)
- **Subcategory Intelligence**: Use Central.co.th's own categorization as validation signals

### Cost Optimization

| Method | Credits/Page | Total Credits | Cost Efficiency |
|--------|--------------|---------------|-----------------|
| ~~firecrawl_extract (LLM-based)~~ | 26 | 32,422 | Expensive |
| **firecrawl_scrape + regex parse** | **1** | **1,247** | **26x cheaper** |

Using `firecrawl_scrape` with client-side regex parsing instead of LLM-based extraction saves 96% of credits while providing full control over parsing logic.

## Relevant Files

### Existing Files (Read & Modify)

- `scripts/classification/markdown_parser.py` - **ENHANCE**: Add scraping-specific parsing functions for breadcrumb, material, fit, care instructions with more robust patterns
- `scripts/classification/classify_occasions.py` - **MODIFY**: Add optional parameter to load scraped data from `women_clothing_scraped.json` and use enriched attributes
- `scripts/classification/occasion_rules.py` - **ENHANCE**: Update rules to leverage new attributes (material matching, subcategory validation)
- `data/products/women_clothing_v1.json` - Source file with 1,247 products (read-only for this chore)

### New Files to Create

- `scripts/classification/scrape_product_details.py` - Main scraping orchestration script using Firecrawl MCP
- `data/products/women_clothing_scraped.json` - Output file with enriched product data

### Reference Files

- `specs/chore-4c900686-classify-women-occasions.md` - Previous classification chore specification for context
- `README.md` - Project structure and conventions

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Enhance Markdown Parser Module

Update `scripts/classification/markdown_parser.py` with enhanced parsing capabilities:

- Add `parse_product_page_markdown(markdown: str) -> dict` function for full page parsing
- Enhance breadcrumb extraction with multiple fallback patterns:
  - Primary: `5. [Subcategory](url)` pattern (5th breadcrumb level)
  - Secondary: Category path extraction from nested links
  - Tertiary: URL path analysis as last resort
- Enhance material/fabric extraction:
  - Primary: `Material/Fabric : <value>` pattern
  - Secondary: `Material: <value>` or `Fabric: <value>` variants
  - Tertiary: Inline material mentions (e.g., "100% Cotton", "Polyester blend")
- Add fit extraction: `Fit : <value>` pattern with variants
- Add care instruction extraction: `Care : <value>` pattern
- Enhance color extraction with multi-source priority:
  1. Product details section color mentions
  2. Title/heading color keywords
  3. Existing color extraction from product name (fallback)
- Add sleeve type extraction from description text (sleeveless, short, long, cap, 3/4, off-shoulder, strapless)
- Add length type extraction (mini, midi, maxi, crop, knee, ankle, floor)
- Add robust error handling and logging for parsing failures
- Return structured dict with all extracted fields (empty string for missing values)

### 2. Create Product Details Scraper

Create `scripts/classification/scrape_product_details.py`:

- Import required modules: `json`, `sys`, `pathlib`, `datetime`, `typing`, Firecrawl MCP functions, `markdown_parser`
- Implement `load_products(filepath: str) -> tuple` - Load women_clothing_v1.json
- Implement `scrape_product_page(url: str, product_name: str) -> dict`:
  - Call `mcp__firecrawl-mcp__firecrawl_scrape` with:
    - `url`: Product link from JSON
    - `formats`: `["markdown"]`
    - `onlyMainContent`: `false` (critical for breadcrumb capture)
    - `waitFor`: `2000` (ms) to ensure full page load
  - Parse returned markdown using `parse_product_page_markdown()`
  - Add error handling for scraping failures (network, parsing)
  - Add retry logic (max 3 attempts) for failed scrapes
  - Return enriched product dict with scraped fields
- Implement `scrape_all_products(products: List[dict], start_index: int = 0, batch_size: int = 50) -> List[dict]`:
  - Process products in batches to avoid rate limits
  - Add progress indicators every 10 products
  - Implement batch checkpointing (save progress every 100 products)
  - Add delay between requests (100ms) to respect rate limits
  - Handle interruptions gracefully (resume from checkpoint)
  - Return list of enriched products
- Implement `save_scraped_data(filepath: str, products: List[dict])` - Save to women_clothing_scraped.json
- Implement `generate_scraping_report(products: List[dict]) -> str`:
  - Count successfully scraped fields per attribute
  - Report missing/failed scrapes
  - Calculate success rates (subcategory, material, fit, color coverage)
  - List products with scraping failures
- Implement `main()` function:
  - Load products from women_clothing_v1.json
  - Check for existing checkpoint file to resume interrupted scraping
  - Scrape all product pages with progress tracking
  - Save enriched data to women_clothing_scraped.json
  - Generate and print scraping report
- Add command-line arguments:
  - `--start`: Start index for resuming (default 0)
  - `--limit`: Limit number of products to scrape (default all)
  - `--batch-size`: Batch size for checkpointing (default 100)
- Add comprehensive error logging to `scraping_errors.log`

### 3. Update Classification System to Use Scraped Data

Modify `scripts/classification/classify_occasions.py`:

- Add `--use-scraped` command-line flag to enable loading from scraped data
- Update `load_products()` to accept optional `scraped_filepath` parameter
- When `--use-scraped` is enabled:
  - Load scraped data from `women_clothing_scraped.json`
  - Merge scraped attributes into product dicts before classification
  - Prioritize scraped attributes over existing ones
- Pass enriched products to `classify_all_products()`
- Update classification report to show impact of scraped data:
  - Compare coverage before/after scraped data
  - Highlight newly classified products
  - Report attribute usage statistics (how many times material, subcategory, etc. influenced classification)

### 4. Enhance Occasion Rules with Scraped Attributes

Update `scripts/classification/occasion_rules.py`:

- Add `include_materials` support to rule matching logic (already present in some rules like `party`, `clubbing`)
- Enhance `classify_product_occasions()` to check product dict for scraped attributes:
  - Use `product.get('material', '')` for material matching
  - Use `product.get('subcategory', '')` for subcategory validation
  - Use `product.get('sleeve_type', '')` for sleeve-based rules
  - Use `product.get('length_type', '')` for length-based rules
  - Use `product.get('color_from_page', '')` as priority over name-based color extraction
- Add material matching to relevant occasions:
  - `party`: sequin, satin, silk, velvet, metallic, chiffon
  - `clubbing`: sequin, satin, velvet, metallic, leather, latex
  - `gala`: silk, satin, velvet, chiffon, organza, taffeta
  - `wedding_guest`: silk, chiffon, lace, organza
  - `sport`: polyester, nylon, spandex, lycra, mesh
  - `beach`: cotton, linen, rayon, lightweight polyester
- Add subcategory validation logic:
  - If Central.co.th categorizes as "Evening Dresses" → boost `gala`, `dinner`, `party` scores
  - If categorized as "Activewear" → boost `sport`, `yoga`, `outdoor` scores
  - If categorized as "Blazers" → boost `work_formal`, `business_meeting`, `interview` scores
- Update scoring algorithm to weight scraped attributes:
  - Material match: +2 points per match
  - Subcategory validation: +3 points if aligned with occasion
  - Sleeve/length match: +1 point per match

### 5. Execute Scraping Workflow

Run the complete scraping and classification workflow:

- Execute `python scripts/classification/scrape_product_details.py` to scrape all 1,247 products
- Monitor progress and handle any interruptions (resume from checkpoint if needed)
- Verify `women_clothing_scraped.json` is created with enriched data
- Review scraping report for success rates and failures
- Re-run classification: `python scripts/classification/classify_occasions.py --use-scraped`
- Compare new classification report with previous results
- Analyze improvements in coverage and accuracy

### 6. Validate Scraping and Classification Results

Comprehensive validation of the implementation:

- **Data Validation**:
  - Verify all 1,247 products have corresponding scraped data
  - Check attribute coverage rates (subcategory >80%, material >70%, fit >60%, color >90%)
  - Validate scraped data quality (no empty strings where data should exist)
  - Spot-check 20 random products: manually verify scraped data against actual product pages
- **Classification Validation**:
  - Confirm unclassified count reduced from 32 to target <10 products
  - Verify previously unclassified blazers/vests now have proper occasions
  - Check for over-classification (products shouldn't have 20+ occasions)
  - Validate material-based matching works (party dresses with sequins properly classified)
- **Error Handling**:
  - Review `scraping_errors.log` for failures
  - Ensure checkpoint/resume functionality works
  - Test with `--limit 10` to verify small batch processing
- **Report Analysis**:
  - Compare before/after classification metrics
  - Verify scraping success rates meet targets (>95% success rate)
  - Document edge cases and remaining unclassified products

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Verify new files exist
test -f scripts/classification/scrape_product_details.py && echo "✓ Scraper script created"
test -f data/products/women_clothing_scraped.json && echo "✓ Scraped data file exists"

# Validate Python syntax
python3 -m py_compile scripts/classification/scrape_product_details.py
python3 -m py_compile scripts/classification/markdown_parser.py
python3 -m py_compile scripts/classification/classify_occasions.py

# Run scraping workflow (test with small batch first)
python3 scripts/classification/scrape_product_details.py --limit 10 --batch-size 5

# Verify scraped data structure
python3 -c "
import json
data = json.load(open('data/products/women_clothing_scraped.json'))
products = data.get('products', data if isinstance(data, list) else [])
print(f'Total products: {len(products)}')
sample = products[0] if products else {}
print(f'Sample keys: {list(sample.keys())}')
print(f'Has material: {\"material\" in sample}')
print(f'Has subcategory: {\"subcategory\" in sample}')
"

# Run full scraping (when ready)
# python3 scripts/classification/scrape_product_details.py

# Run enhanced classification with scraped data
python3 scripts/classification/classify_occasions.py --use-scraped

# Compare classification reports
diff -u \
  scripts/classification/classification_report.txt \
  scripts/classification/classification_report_with_scraped.txt || true

# Validate classification improvement
python3 -c "
import json
data = json.load(open('data/products/women_clothing_v1.json'))
products = data.get('products', data if isinstance(data, list) else [])
unclassified = [p for p in products if not p.get('occasions')]
print(f'Unclassified products: {len(unclassified)}')
print(f'Coverage: {(len(products) - len(unclassified)) / len(products) * 100:.1f}%')
"
```

## Notes

### Scraping Strategy

- **Rate Limiting**: Add 100ms delay between requests to respect Central.co.th server limits
- **Checkpoint Resume**: Save progress every 100 products to handle interruptions gracefully
- **Error Resilience**: Implement 3-retry logic with exponential backoff for failed scrapes
- **Selective Scraping**: Consider scraping only the 32 currently unclassified products first as a pilot test

### Firecrawl MCP Configuration

Critical parameters for `firecrawl_scrape`:
- `onlyMainContent: false` - Essential to capture breadcrumb navigation outside main content area
- `formats: ["markdown"]` - Structured markdown is easier to parse than raw HTML
- `waitFor: 2000` - Allow time for dynamic content loading
- `removeBase64Images: true` - Reduce payload size (we don't need embedded images)

### Expected Scraped Attribute Coverage

Based on Central.co.th product page structure:
- **Subcategory** (breadcrumb): 95%+ coverage (most products have breadcrumb navigation)
- **Material/Fabric**: 70%+ coverage (formal/premium items typically have this)
- **Fit**: 60%+ coverage (common for dresses, less for accessories)
- **Care**: 50%+ coverage (varies by product type)
- **Color**: 90%+ coverage (can fallback to product name if not in details)
- **Sleeve Type**: 80%+ coverage (extracted from descriptions)
- **Length Type**: 75%+ coverage (dresses and skirts typically specify)

### Edge Cases to Handle

1. **Scraping Failures**:
   - Network timeouts → Retry with exponential backoff
   - Invalid URLs → Log and skip (mark as scraping_failed)
   - Rate limiting → Increase delay between requests

2. **Parsing Challenges**:
   - Missing product details section → Use fallback extraction from product name
   - Non-English product pages → Pattern matching may fail, rely on product name fallbacks
   - Inconsistent format → Multiple regex patterns with priority ordering

3. **Classification Edge Cases**:
   - Products with rich scraped data but still no clear occasion → May be specialty items (e.g., fashion accessories, unconventional designs)
   - Material conflicts → Trust scraped material over product name mentions
   - Subcategory mismatches → Use as validation signal, not hard requirement

### Performance Considerations

- **Total Scraping Time**: ~2-3 minutes for 1,247 products at 100ms/request
- **Memory Usage**: Load products in batches of 100 to keep memory footprint low
- **Disk I/O**: Checkpoint saves every 100 products (minimal overhead)
- **Network**: 1,247 HTTP requests × ~50KB/response ≈ 60MB total bandwidth

### Success Criteria

1. **Scraping Success Rate**: >95% of products successfully scraped
2. **Attribute Coverage**: Meet minimum coverage targets (subcategory >80%, material >70%)
3. **Classification Improvement**: Reduce unclassified from 32 to <10 products (69% reduction)
4. **Data Quality**: No malformed JSON, all scraped attributes properly typed
5. **Resumability**: Checkpoint/resume functionality works correctly
6. **Error Handling**: All errors logged with actionable information

### Future Enhancements

- **Incremental Scraping**: Only scrape products added/updated since last scrape
- **Multi-threading**: Parallel scraping with thread pool (10-20 concurrent requests)
- **Cache Layer**: Store scraped markdown to avoid re-scraping unchanged products
- **Advanced Parsing**: Use LLM for products where regex parsing fails (fallback strategy)
- **Cross-Validation**: Compare Central.co.th categorization with our classification to identify discrepancies
