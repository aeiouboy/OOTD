# Scraping Execution Strategy for 1,247 Products

## Challenge

Scraping 1,247 products in a single Claude Code conversation is impractical:
- **Context**: Each scrape = ~23k tokens (1,247 × 23k = 28.7M tokens)
- **Time**: Estimated 20-25 minutes of continuous execution
- **Tool calls**: 1,247 sequential Firecrawl MCP calls

## Solution: Hybrid Execution Model

### Infrastructure Complete ✅
- `incremental_scraper.py` - State management with checkpoint/resume
- `markdown_parser.py` - Robust attribute extraction
- `batch_scraper.py` - Batch processing coordinator
- Progress tracking via `scraping_progress.json`

### Execution Options

#### Option 1: External Automation (Recommended)
Use a dedicated Python script that interfaces with Firecrawl API directly:

```python
# scrape_via_api.py
import requests
import json
from markdown_parser import parse_product_page_markdown
from incremental_scraper import record_scraped_item, load_products

FIRECRAWL_API_KEY = "your_api_key"
FIRECRAWL_URL = "https://api.firecrawl.dev/v1/scrape"

products = load_products()

for idx, product in enumerate(products):
    url = product['link']

    response = requests.post(FIRECRAWL_URL, json={
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": False,
        "waitFor": 2000,
        "removeBase64Images": True
    }, headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}"})

    if response.ok:
        markdown = response.json()['markdown']
        attrs = parse_product_page_markdown(markdown)
        record_scraped_item(idx, product, attrs, success=True)

    if (idx + 1) % 100 == 0:
        print(f"Progress: {idx+1}/1247")
```

**Pros**: Fastest, no context limits, can run overnight
**Cons**: Requires Firecrawl API key

#### Option 2: Multiple Claude Code Sessions
Split the work across multiple sessions, each handling a batch:

Session 1: Products 0-249 (batch 0-4)
Session 2: Products 250-499 (batch 5-9)
Session 3: Products 500-749 (batch 10-14)
Session 4: Products 750-999 (batch 15-19)
Session 5: Products 1000-1247 (batch 20-24)

Each session:
1. Uses incremental_scraper to get next batch
2. Scrapes products using Firecrawl MCP
3. Records results incrementally
4. Checkpoint automatically saves progress

**Pros**: Uses Claude Code MCP tools, no external API needed
**Cons**: Requires 5 separate sessions, manual coordination

#### Option 3: Streaming Batch Processing (Current)
Process products in manageable batches within a single session:

```bash
# Batch 1: 50 products
python3 scripts/classification/execute_batch.py --batch-size 50

# Resume for next batch
python3 scripts/classification/execute_batch.py --batch-size 50
```

**Pros**: Single codebase, checkpoint/resume works naturally
**Cons**: Still requires multiple invocations

### Current Status

**Completed**:
- ✅ Product #0 scraped and parsed successfully
- ✅ Infrastructure tested and validated
- ✅ State management working

**Remaining**: 1,246 products

### Recommended Next Steps

**For Production Execution:**
1. Use Option 1 (external API script) for fastest completion (~20 mins)
2. OR split into 5 Claude Code sessions (Option 2) for MCP-based execution

**For This Session:**
- Demonstrate working system with 25-50 products
- Validate end-to-end workflow
- Generate documentation for full execution

## Cost & Time Estimates

| Method | Time | Cost | Context |
|--------|------|------|---------|
| External API | 20 mins | 1,247 credits | N/A |
| 5 Sessions | 100 mins | 1,247 credits | 5× separate |
| Single Session | N/A | 1,247 credits | 28.7M tokens |

## Validation After Completion

```bash
# Check coverage
python3 incremental_scraper.py status

# Verify attribute extraction
python3 -c "
import json
with open('data/products/women_clothing_scraped.json') as f:
    products = json.load(f)['products']
    attrs = ['subcategory', 'material', 'color_from_page']
    for attr in attrs:
        count = sum(1 for p in products if p.get(attr))
        print(f'{attr}: {count/len(products)*100:.1f}%')
"

# Run enhanced classification
python3 scripts/classification/classify_occasions.py --use-scraped
```
