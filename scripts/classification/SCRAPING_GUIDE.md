# Firecrawl MCP Scraping Execution Guide

## Overview

Scraping 1,247 products requires systematic execution with Firecrawl MCP tools.
This guide provides the complete workflow for Claude Code to execute the scraping.

## Infrastructure Ready

✅ `incremental_scraper.py` - Progress tracking and state management
✅ `markdown_parser.py` - Attribute extraction from scraped markdown
✅ `women_clothing_v1.json` - Source product catalog (1,247 products)

## Execution Strategy

Due to the scale (1,247 MCP calls), the recommended approach is:

### Option A: Batch Processing (Recommended)
Process products in batches of 25-50, saving progress after each batch.

```python
# Get next batch
python3 incremental_scraper.py next 25

# Claude Code scrapes each URL in the batch
# After each scrape, record the result
python3 -c "
from incremental_scraper import record_scraped_item, parse_scraped_markdown
# record_scraped_item(index, product, scraped_attrs, success=True)
"
```

### Option B: Continuous Execution
Use a long-running Claude Code session to scrape continuously with checkpointing.

### Option C: Parallel Execution
Split the workload across multiple Claude Code sessions, each handling a range of indices.

## Scraping Workflow

For each product:

1. **Load product data**
   ```python
   import json
   with open('data/products/women_clothing_v1.json') as f:
       products = json.load(f)['products']
   product = products[index]
   url = product['link']
   ```

2. **Call Firecrawl MCP**
   ```
   mcp__firecrawl-mcp__firecrawl_scrape(
       url=url,
       formats=["markdown"],
       onlyMainContent=false,
       waitFor=2000,
       removeBase64Images=true
   )
   ```

3. **Parse markdown**
   ```python
   from markdown_parser import parse_product_page_markdown
   scraped_attrs = parse_product_page_markdown(markdown)
   ```

4. **Record result**
   ```python
   from incremental_scraper import record_scraped_item
   record_scraped_item(index, product, scraped_attrs, success=True)
   ```

5. **Check progress**
   ```bash
   python3 incremental_scraper.py status
   ```

## Rate Limiting

- Delay: 100-200ms between requests
- Batch size: 25-50 products per checkpoint
- Error handling: Exponential backoff on failures

## Expected Metrics

- **Duration**: ~15-25 minutes for 1,247 products
- **Cost**: 1,247 Firecrawl credits (1 credit/page)
- **Success rate**: 95%+ target
- **Attribute coverage**:
  - Subcategory: 80%+
  - Material: 70%+
  - Color: 90%+
  - Fit: 60%+
  - Care: 50%+
  - Sleeve: 80%+
  - Length: 75%+

## Monitoring

```bash
# Check status anytime
python3 incremental_scraper.py status

# View output file
jq '.scraping_metadata' data/products/women_clothing_scraped.json

# Check progress file
cat scripts/classification/scraping_progress.json
```

## Resume After Interruption

The scraper automatically resumes from the last checkpoint:

```bash
# Get next batch (skips completed)
python3 incremental_scraper.py next 25

# Continue scraping from where it left off
```

## Completion

When scraping finishes:

1. Verify coverage: `python3 incremental_scraper.py status`
2. Run classification: `python3 scripts/classification/classify_occasions.py --use-scraped`
3. Compare results with baseline classification

## Implementation for Claude Code

To execute the full scraping, Claude Code should:

```python
import json
import time
from pathlib import Path

# Load infrastructure
from incremental_scraper import (
    load_products,
    load_progress,
    record_scraped_item,
    get_status
)
from markdown_parser import parse_product_page_markdown

# Load products
products = load_products()
progress = load_progress()
completed = set(progress.get('completed_indices', []))

# Process each product
for idx, product in enumerate(products):
    if idx in completed:
        continue  # Skip already processed

    try:
        # 1. Scrape with Firecrawl MCP
        url = product['link']
        result = mcp__firecrawl-mcp__firecrawl_scrape(
            url=url,
            formats=["markdown"],
            onlyMainContent=false,
            waitFor=2000,
            removeBase64Images=true
        )

        # 2. Parse markdown
        markdown = result['markdown']
        scraped_attrs = parse_product_page_markdown(markdown)

        # 3. Record success
        record_scraped_item(idx, product, scraped_attrs, success=True)

        # 4. Rate limiting
        time.sleep(0.1)  # 100ms delay

        # 5. Progress checkpoint every 50 products
        if (idx + 1) % 50 == 0:
            status = get_status()
            print(f"Progress: {status['completion_rate']}")

    except Exception as e:
        # Record failure
        record_scraped_item(idx, product, {}, success=False)
        print(f"Failed [{idx}]: {str(e)}")

# Final status
print("\n=== SCRAPING COMPLETE ===")
status = get_status()
print(json.dumps(status, indent=2))
```

## Next Steps After Scraping

1. **Validate Results**
   ```bash
   python3 -c "
   import json
   with open('data/products/women_clothing_scraped.json') as f:
       data = json.load(f)
       products = data['products']

       # Count attribute coverage
       attrs = ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']
       for attr in attrs:
           count = sum(1 for p in products if p.get(attr))
           print(f'{attr}: {count}/{len(products)} ({count/len(products)*100:.1f}%)')
   "
   ```

2. **Run Enhanced Classification**
   ```bash
   python3 scripts/classification/classify_occasions.py --use-scraped
   ```

3. **Compare Results**
   ```bash
   diff -u scripts/classification/classification_report.txt \
           scripts/classification/classification_report_with_scraped.txt
   ```
