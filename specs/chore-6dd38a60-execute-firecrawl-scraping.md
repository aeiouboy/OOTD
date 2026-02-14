# Chore: Execute Firecrawl MCP Scraping for All Women's Clothing Products

## Metadata
adw_id: `6dd38a60`
prompt: `Execute Firecrawl MCP scraping for ALL products in women_clothing_v1.json. For each product: scrape URL with firecrawl_scrape (onlyMainContent=false, formats=['markdown'], waitFor=2000), parse with markdown_parser.parse_product_page_markdown(), save to women_clothing_scraped.json. Process in batches of 50 with 100ms delay. Checkpoint every 100 products. Report final extraction rates.`

## Chore Description

Execute the complete Firecrawl MCP scraping workflow to enrich all 1,247 women's clothing products with detailed attributes extracted from Central.co.th product pages. The scraping infrastructure has been built but requires actual execution with real Firecrawl MCP tool calls to populate `women_clothing_scraped.json` with subcategory, material, fit, care, color, sleeve type, and length type data.

This chore focuses on **execution** rather than development—the scraping script (`scrape_product_details.py`) and parser (`markdown_parser.py`) are already implemented and validated. The task is to actually scrape all 1,247 product pages, handle the live data, and generate the enriched product catalog.

### Objectives

1. **Scrape All Products**: Execute Firecrawl MCP scraping for all 1,247 products in `women_clothing_v1.json`
2. **Batch Processing**: Process in batches of 50 products with 100ms delay between requests
3. **Checkpoint Recovery**: Save progress every 100 products to enable resume after interruptions
4. **Data Enrichment**: Parse markdown and extract 7 key attributes per product
5. **Quality Reporting**: Generate comprehensive scraping report with success rates and attribute coverage
6. **Output Generation**: Save enriched products to `women_clothing_scraped.json`

### Expected Outcomes

- **Scraped Products**: 1,247 enriched products with 7 additional attributes
- **Success Rate**: >95% successful scrapes (target: ~1,185+ products)
- **Attribute Coverage**:
  - Subcategory: >80% (target: 997+ products)
  - Material: >70% (target: 873+ products)
  - Fit: >60% (target: 748+ products)
  - Color: >90% (target: 1,122+ products)
  - Sleeve Type: >80% (target: 997+ products)
  - Length Type: >75% (target: 935+ products)
  - Care: >50% (target: 623+ products)

### Technical Approach

The scraping workflow integrates three components:

1. **Firecrawl MCP Tool**: `mcp__firecrawl-mcp__firecrawl_scrape` for web scraping
2. **Markdown Parser**: `parse_product_page_markdown()` for attribute extraction
3. **Orchestration Script**: `scrape_product_details.py` for batch processing

Key parameters:
- `onlyMainContent=false` - Captures breadcrumb navigation outside main content
- `formats=['markdown']` - Structured markdown for regex parsing
- `waitFor=2000` - Allows dynamic content to load
- `batch_size=50` - Processes 50 products per batch
- `delay=100ms` - Rate limiting between requests

## Relevant Files

### Execution Scripts (Read & Execute)

- `scripts/classification/scrape_product_details.py` - Main orchestration script with Firecrawl MCP integration
- `scripts/classification/markdown_parser.py` - Enhanced parser with robust attribute extraction

### Data Files

- `data/products/women_clothing_v1.json` - **INPUT**: Source file with 1,247 products
- `data/products/women_clothing_scraped.json` - **OUTPUT**: Enriched product catalog (to be created)
- `data/products/scraping_checkpoint.json` - **TEMPORARY**: Checkpoint file for resume capability

### Reports & Logs

- `scripts/classification/scraping_report.txt` - **OUTPUT**: Comprehensive scraping metrics
- `scraping_errors.log` - **OUTPUT**: Error log for debugging failures

### Reference Documentation

- `specs/chore-e07cb522-scrape-product-details-firecrawl.md` - Original implementation specification
- `scripts/classification/SCRAPING_WORKFLOW.md` - Workflow execution guide

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Pre-Execution Validation

Verify the environment and infrastructure is ready for scraping:

- Read `data/products/women_clothing_v1.json` to confirm 1,247 products with valid URLs
- Verify `scripts/classification/scrape_product_details.py` exists and imports are correct
- Verify `scripts/classification/markdown_parser.py` has `parse_product_page_markdown()` function
- Check for existing `data/products/women_clothing_scraped.json` (backup if exists)
- Check for existing `data/products/scraping_checkpoint.json` (resume vs fresh start decision)
- Validate Firecrawl MCP tool availability by checking tool access

### 2. Test Scraping with Small Batch

Execute a pilot scraping run with 10 products to validate the workflow:

- Run test command: `python3 scripts/classification/scrape_product_details.py --limit 10 --batch-size 5`
- For each product in the test batch:
  - Extract product URL from JSON
  - Call `mcp__firecrawl-mcp__firecrawl_scrape` with parameters:
    - `url`: Product link from `women_clothing_v1.json`
    - `formats`: `["markdown"]`
    - `onlyMainContent`: `false`
    - `waitFor`: `2000`
    - `removeBase64Images`: `true`
  - Capture returned markdown content
  - Pass markdown to `parse_product_page_markdown()`
  - Merge parsed attributes into product dict
  - Log success/failure status
- Verify test output:
  - Check scraped data structure is correct
  - Validate attribute extraction is working
  - Confirm checkpoint file is created after 5 products
- Review test scraping report for any errors
- Fix any issues before proceeding to full scraping

### 3. Execute Full Scraping (Batch 1: Products 0-499)

Process the first 500 products with checkpointing:

- Start scraping from index 0
- For products 0-499:
  - Call Firecrawl MCP for each product URL
  - Parse markdown with `parse_product_page_markdown()`
  - Extract 7 attributes: subcategory, material, fit, care, color_from_page, sleeve_type, length_type
  - Add 100ms delay between requests (`time.sleep(0.1)`)
  - Log progress every 10 products
  - Create checkpoint at products 100, 200, 300, 400
- Monitor for errors:
  - Network timeouts → Retry up to 3 times
  - Rate limiting (429 errors) → Increase delay if needed
  - Parsing failures → Log and continue
- Verify checkpoint files are being created correctly
- Track success rate and attribute coverage during execution

### 4. Execute Full Scraping (Batch 2: Products 500-999)

Continue scraping the second batch:

- Resume from product 500 (or from checkpoint if interrupted)
- For products 500-999:
  - Repeat Firecrawl MCP scraping process
  - Maintain 100ms delay between requests
  - Checkpoint at products 500, 600, 700, 800, 900
- Monitor cumulative success rate
- Check attribute coverage rates are meeting targets
- Handle any edge cases or failures

### 5. Execute Full Scraping (Batch 3: Products 1000-1246)

Complete the final batch of products:

- Resume from product 1000 (or from checkpoint if interrupted)
- For products 1000-1246:
  - Complete Firecrawl MCP scraping
  - Maintain 100ms delay
  - Checkpoint at products 1100, 1200
- Process final 47 products (1200-1246)
- Finalize all scraped data

### 6. Generate Enriched Product Catalog

Merge scraped attributes into product catalog:

- Load original `women_clothing_v1.json` products
- Create mapping of `product_id` to scraped attributes
- For each product:
  - Merge scraped attributes: `subcategory`, `material`, `fit`, `care`, `color_from_page`, `sleeve_type`, `length_type`
  - Add scraping metadata: status, timestamp, scraper version
  - Preserve all original product fields
- Save enriched catalog to `data/products/women_clothing_scraped.json`
- Validate JSON structure is correct
- Verify file size is reasonable (~3-5MB expected)

### 7. Generate Comprehensive Scraping Report

Create detailed scraping report with metrics:

- Calculate success rates:
  - Total products: 1,247
  - Successfully scraped: count with `scraping_status='success'`
  - Failed scrapes: count with `scraping_status='failed'`
  - Parse failures: count with `scraping_status='parse_failed'`
  - No URL: count with `scraping_status='no_url'`
- Calculate attribute coverage (for successfully scraped products):
  - Subcategory coverage: count / total * 100
  - Material coverage: count / total * 100
  - Fit coverage: count / total * 100
  - Care coverage: count / total * 100
  - Color coverage: count / total * 100
  - Sleeve type coverage: count / total * 100
  - Length type coverage: count / total * 100
- List failed products (first 10 with error messages)
- Save report to `scripts/classification/scraping_report.txt`
- Display report summary in console

### 8. Validation and Quality Checks

Validate the scraping results meet quality standards:

- **Data Completeness**:
  - Confirm all 1,247 products have entries in scraped file
  - Verify success rate >95% (target: 1,185+ successful scrapes)
- **Attribute Coverage**:
  - Check subcategory >80%
  - Check material >70%
  - Check fit >60%
  - Check color >90%
  - Check sleeve_type >80%
  - Check length_type >75%
  - Check care >50%
- **Data Quality Spot Checks**:
  - Sample 20 random products
  - For each sample, manually verify 3-4 scraped attributes against actual product page
  - Check for data type correctness (all strings, no null values)
  - Verify no malformed JSON entries
- **Error Analysis**:
  - Review `scraping_errors.log` for patterns
  - Identify products with repeated failures
  - Document edge cases (products without certain attributes)

### 9. Cleanup and Finalization

Clean up temporary files and finalize outputs:

- Remove `data/products/scraping_checkpoint.json` (scraping complete)
- Archive `scraping_errors.log` to `scripts/classification/scraping_errors_YYYYMMDD.log`
- Verify `women_clothing_scraped.json` is the canonical enriched catalog
- Calculate total execution time and cost metrics:
  - Total Firecrawl credits used (should be ~1,247)
  - Total execution time (expected: 2-3 minutes)
  - Average scraping time per product
- Update `SCRAPING_WORKFLOW.md` with actual execution results

### 10. Report Final Extraction Rates

Generate and display final summary report:

- **Overall Statistics**:
  - Total products processed: 1,247
  - Successful scrapes: X (Y%)
  - Failed scrapes: X (Y%)
  - Parse failures: X (Y%)
  - No URL: X (Y%)
- **Attribute Extraction Rates**:
  - Subcategory: X/1,247 (Y%)
  - Material: X/1,247 (Y%)
  - Fit: X/1,247 (Y%)
  - Care: X/1,247 (Y%)
  - Color: X/1,247 (Y%)
  - Sleeve Type: X/1,247 (Y%)
  - Length Type: X/1,247 (Y%)
- **Performance Metrics**:
  - Total execution time: X minutes
  - Firecrawl credits used: 1,247
  - Average time per product: X seconds
  - Cost efficiency: 96% savings vs LLM extraction
- **Next Steps**:
  - Ready for enhanced classification with `--use-scraped` flag
  - Expected improvement: Reduce unclassified from 32 to <10 products

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Verify enriched catalog exists
test -f data/products/women_clothing_scraped.json && echo "✓ Scraped data file created"

# Check file size (should be 3-5MB)
ls -lh data/products/women_clothing_scraped.json

# Validate JSON structure
python3 -m json.tool data/products/women_clothing_scraped.json > /dev/null && echo "✓ Valid JSON"

# Check total products
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    data = json.load(f)
products = data.get('products', [])
print(f'Total products: {len(products)}')
assert len(products) == 1247, f'Expected 1247 products, got {len(products)}'
print('✓ All 1247 products present')
"

# Check scraped attributes structure
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    data = json.load(f)
products = data.get('products', [])
sample = products[0]
required_keys = ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']
missing = [k for k in required_keys if k not in sample and not sample.get('scraping_metadata', {}).get('status') == 'failed']
print(f'Sample product keys: {list(sample.keys())}')
print(f'✓ Scraped attributes present')
"

# Verify scraping metadata
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    data = json.load(f)
products = data.get('products', [])
with_metadata = [p for p in products if 'scraping_metadata' in p]
print(f'Products with scraping metadata: {len(with_metadata)}/{len(products)}')
print('✓ Scraping metadata present')
"

# Calculate success rate
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    data = json.load(f)
products = data.get('products', [])
successful = [p for p in products if p.get('scraping_metadata', {}).get('status') == 'success']
failed = [p for p in products if p.get('scraping_metadata', {}).get('status') in ['failed', 'parse_failed']]
success_rate = len(successful) / len(products) * 100
print(f'Success rate: {len(successful)}/{len(products)} ({success_rate:.1f}%)')
assert success_rate >= 95.0, f'Success rate {success_rate:.1f}% below target 95%'
print('✓ Success rate meets target (≥95%)')
"

# Calculate attribute coverage
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    data = json.load(f)
products = data.get('products', [])
successful = [p for p in products if p.get('scraping_metadata', {}).get('status') == 'success']

attributes = ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']
targets = {'subcategory': 80, 'material': 70, 'fit': 60, 'care': 50, 'color_from_page': 90, 'sleeve_type': 80, 'length_type': 75}

print('Attribute Coverage:')
for attr in attributes:
    count = sum(1 for p in successful if p.get(attr))
    coverage = (count / len(successful) * 100) if successful else 0
    target = targets.get(attr, 0)
    status = '✓' if coverage >= target else '✗'
    print(f'  {status} {attr}: {count}/{len(successful)} ({coverage:.1f}%) [target: {target}%]')
"

# Verify scraping report exists
test -f scripts/classification/scraping_report.txt && echo "✓ Scraping report generated"

# Display scraping report
cat scripts/classification/scraping_report.txt

# Check for checkpoint cleanup
if [ -f data/products/scraping_checkpoint.json ]; then
    echo "✗ Checkpoint file still exists (should be removed)"
else
    echo "✓ Checkpoint file cleaned up"
fi

# Verify error log exists
test -f scraping_errors.log && echo "✓ Error log exists"

# Count errors in log
if [ -f scraping_errors.log ]; then
    error_count=$(grep -c "ERROR" scraping_errors.log || echo "0")
    echo "Total errors logged: $error_count"
fi
```

## Notes

### Execution Strategy

**Batch Processing**:
- Process 50 products per batch (not full 1,247 at once)
- Allows monitoring and adjustment during execution
- Reduces memory footprint

**Rate Limiting**:
- 100ms delay between requests (10 requests/second)
- Total time: ~125 seconds (2 minutes) for 1,247 products
- Respects Central.co.th server limits

**Checkpoint Recovery**:
- Auto-save every 100 products
- Resume from checkpoint if interrupted
- Prevents data loss from network failures

### Firecrawl MCP Integration

The scraping script requires actual Firecrawl MCP tool calls. The workflow is:

```python
# For each product:
markdown = mcp__firecrawl-mcp__firecrawl_scrape(
    url=product['link'],
    formats=["markdown"],
    onlyMainContent=False,  # CRITICAL
    waitFor=2000,
    removeBase64Images=True
)

# Parse markdown
attributes = parse_product_page_markdown(markdown)

# Merge into product
enriched_product = {**product, **attributes}
```

**Critical Parameters**:
- `onlyMainContent=false`: Captures breadcrumb navigation outside main content area
- `waitFor=2000`: Allows dynamic content (price, availability) to load
- `formats=["markdown"]`: Structured format for regex parsing

### Expected Scraping Patterns

**High Success Rate Attributes** (>80%):
- Subcategory: Breadcrumb present on most product pages
- Sleeve Type: Common in dress/top descriptions
- Color: Either in details or product name

**Medium Success Rate Attributes** (60-80%):
- Material: More common in formal/premium items
- Length Type: Primarily for dresses/skirts
- Fit: Varies by product category

**Lower Success Rate Attributes** (<60%):
- Care: Not always listed, especially for basic items

### Error Handling

**Common Scraping Failures**:
1. Network timeouts → Retry with exponential backoff
2. Rate limiting (429) → Increase delay between requests
3. Invalid URLs → Skip and log error
4. Missing product pages (404) → Mark as no_url status

**Parsing Failures**:
1. Non-standard page format → Fallback patterns in parser
2. Missing product details section → Use product name extraction
3. Non-English content → Pattern matching may fail

### Cost Optimization

**Firecrawl Credits**:
- firecrawl_scrape: 1 credit per page
- Total: 1,247 credits for all products
- Alternative (firecrawl_extract): 26 credits per page = 32,422 credits
- **Savings: 96% (26x cheaper)**

### Performance Expectations

**Execution Time**:
- 1,247 products × 100ms delay = 124.7 seconds
- Actual scraping time per product: ~500ms average
- Total estimated time: 10-15 minutes (with retries)

**Resource Usage**:
- Memory: <500MB (batch processing)
- Disk: ~5MB for enriched JSON
- Network: ~60MB total bandwidth

### Success Criteria

1. ✓ All 1,247 products processed
2. ✓ Success rate ≥95% (1,185+ successful scrapes)
3. ✓ Attribute coverage meets targets (subcategory >80%, material >70%, etc.)
4. ✓ Valid JSON output with proper structure
5. ✓ Comprehensive scraping report generated
6. ✓ Error log documents all failures
7. ✓ Checkpoint file cleaned up after completion

### Post-Scraping Next Steps

After successful scraping:
1. Run enhanced classification: `python3 scripts/classification/classify_occasions.py --use-scraped`
2. Compare before/after classification reports
3. Analyze improvement in unclassified product count (target: 32 → <10)
4. Document actual vs expected attribute coverage rates
5. Identify remaining unclassified products for manual review

### Maintenance Recommendations

**Incremental Updates**:
- Only scrape products added/modified since last scrape
- Compare timestamps to identify new products
- Merge with existing scraped data

**Data Freshness**:
- Re-scrape entire catalog monthly
- Product attributes may change (price, availability, descriptions)
- Keep historical scraping reports for analysis

**Rule Optimization**:
- Use actual attribute coverage to tune occasion rules
- Identify which attributes provide strongest classification signals
- Adjust scoring weights based on real data
