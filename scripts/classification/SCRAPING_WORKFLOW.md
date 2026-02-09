# Product Scraping Workflow for Enhanced Classification

## Overview

This workflow enhances the women's clothing occasion classification system by scraping detailed product attributes from Central.co.th using Firecrawl MCP.

## Implementation Status

✅ **Completed Components:**
1. Enhanced `markdown_parser.py` with robust parsing for:
   - Subcategory extraction from breadcrumbs
   - Material/fabric extraction with fallback patterns
   - Fit, care, color extraction
   - Sleeve type and length type detection

2. Created `scrape_product_details.py` with:
   - Firecrawl MCP integration structure
   - Batch processing with checkpointing
   - Error handling and retry logic
   - Progress tracking and reporting

3. Updated `classify_occasions.py` to support:
   - Optional scraped data merging via `--use-scraped` flag
   - Attribute usage tracking
   - Enhanced reporting with scraped data statistics

4. Enhanced `occasion_rules.py` with:
   - Subcategory validation logic (+3 score boost)
   - Material matching enhancements
   - Sleeve type matching (+1 score boost)
   - Length type matching (+1 score boost)
   - Color prioritization (scraped > name-based)

## How to Execute the Workflow

### Step 1: Scrape Product Details (REQUIRES MANUAL EXECUTION WITH MCP)

The scraping script is structured but requires actual Firecrawl MCP tool calls to be executed by Claude Code. The script currently contains placeholder structure.

**To execute scraping:**

```bash
# Test with small batch first (10 products)
python3 scripts/classification/scrape_product_details.py --limit 10 --batch-size 5

# Full scraping (1,247 products)
python3 scripts/classification/scrape_product_details.py
```

**Note:** The actual scraping requires Firecrawl MCP function calls to be integrated. Each product will be scraped using:
```python
mcp__firecrawl-mcp__firecrawl_scrape(
    url=product_link,
    formats=["markdown"],
    onlyMainContent=False,  # CRITICAL for breadcrumb
    waitFor=2000,
    removeBase64Images=True
)
```

### Step 2: Verify Scraped Data

After scraping completes, verify the output:

```bash
# Check scraped data structure
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
```

### Step 3: Run Enhanced Classification

Run classification with scraped data:

```bash
# Run classification with scraped data
python3 scripts/classification/classify_occasions.py --use-scraped
```

This will:
- Load `women_clothing_v1.json` as base
- Merge attributes from `women_clothing_scraped.json`
- Apply enhanced occasion rules with scraped data
- Generate `classification_report_with_scraped.txt`

### Step 4: Compare Results

Compare classification before/after scraped data:

```bash
# Compare reports
diff -u \
  scripts/classification/classification_report.txt \
  scripts/classification/classification_report_with_scraped.txt || true
```

## Expected Improvements

### Target Metrics
- **Unclassified Products**: Reduce from 32 (2.6%) to <10 (0.8%)
- **Attribute Coverage** (after scraping):
  - Subcategory: >80%
  - Material: >70%
  - Fit: >60%
  - Color: >90%
  - Sleeve Type: >80%
  - Length Type: >75%

### Classification Enhancements
- **Material-Based Matching**: Party/gala occasions boosted by sequin, silk, satin
- **Subcategory Intelligence**: Central's categorization validates classification
- **Coverage Precision**: Sleeve/length types improve formal occasion matching

## Cost Optimization

| Method | Credits/Page | Total (1,247 products) |
|--------|--------------|------------------------|
| ~~firecrawl_extract (LLM)~~ | 26 | 32,422 credits |
| **firecrawl_scrape + regex** | **1** | **1,247 credits** |

**Savings: 96% cost reduction (26x cheaper)**

## Troubleshooting

### Scraping Failures
- Check `scraping_errors.log` for details
- Resume from checkpoint: script auto-resumes from `scraping_checkpoint.json`
- Rate limiting: Increase delay if getting 429 errors

### Parsing Issues
- Test markdown parser: Import `parse_product_page_markdown()` and test with sample markdown
- Check for non-standard product page formats
- Add debug logging to identify pattern mismatches

### Classification Not Improving
- Verify scraped attributes are present in products
- Check attribute usage stats in classification report
- Review occasion rules scoring logic

## Files Modified

1. `scripts/classification/markdown_parser.py` - Enhanced parsing
2. `scripts/classification/scrape_product_details.py` - NEW scraper script
3. `scripts/classification/classify_occasions.py` - Added --use-scraped support
4. `scripts/classification/occasion_rules.py` - Enhanced with scraped attributes

## Files Generated

1. `data/products/women_clothing_scraped.json` - Enriched product data
2. `scripts/classification/scraping_report.txt` - Scraping success metrics
3. `scripts/classification/classification_report_with_scraped.txt` - Enhanced classification results
4. `scraping_errors.log` - Error log for debugging

## Next Steps

1. **Execute Actual Scraping**: Integrate Firecrawl MCP calls in scrape_product_details.py
2. **Validate Results**: Run small test batch (10-20 products) first
3. **Full Scraping**: Process all 1,247 products with checkpointing
4. **Re-classify**: Run classification with --use-scraped flag
5. **Analyze Impact**: Compare before/after metrics
6. **Iterate**: Adjust rules based on results if needed

## Maintenance

- **Incremental Updates**: Only scrape new/updated products
- **Data Freshness**: Re-scrape monthly to capture product updates
- **Rule Tuning**: Adjust scoring weights based on classification accuracy
