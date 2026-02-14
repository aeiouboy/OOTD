# Product Classification Scripts

This directory contains scripts for scraping and classifying women's clothing products from Central.co.th.

## Automated Session 1 Scraping

### Prerequisites

1. Install Firecrawl Python SDK:
   ```bash
   pip install firecrawl-py
   ```

2. Set up Firecrawl API key:
   ```bash
   export FIRECRAWL_API_KEY="your-api-key-here"
   ```

   Get your API key from: https://firecrawl.dev/

### Running the Script

```bash
cd scripts/classification
python3 scrape_session1_complete.py
```

The script will:
- Load 243 remaining products (indices 7-249)
- Scrape each product using Firecrawl API
- Parse extracted attributes using markdown_parser.py
- Save progress after every 10 products
- Generate final summary report
- Complete in approximately 2 hours

### Command-Line Options

```bash
# Scrape all remaining Session 1 products (7-249)
python3 scrape_session1_complete.py

# Scrape specific range
python3 scrape_session1_complete.py --start 7 --end 50

# Custom log file and batch size
python3 scrape_session1_complete.py --log-file my_scrape.log --batch-size 20

# Show all options
python3 scrape_session1_complete.py --help
```

### Monitoring Progress

Watch the log file in real-time:
```bash
tail -f scrape_session1.log
```

Check current progress:
```bash
python3 incremental_scraper.py status
```

### Interruption and Resume

The script can be interrupted at any time (Ctrl+C). Progress is saved every 10 products.

To resume, simply run the script again:
```bash
python3 scrape_session1_complete.py
```

Already-completed products will be automatically skipped.

### Expected Output

The script creates and updates:
- `../../data/products/women_clothing_scraped.json` - Scraped product data
- `scraping_progress.json` - Progress tracking
- `scrape_session1.log` - Execution log

### Troubleshooting

**Error: "Firecrawl SDK not installed"**
- Run: `pip install firecrawl-py`

**Error: "FIRECRAWL_API_KEY environment variable not set"**
- Set your API key: `export FIRECRAWL_API_KEY="your-key"`

**High failure rate (>5%)**
- Check network connectivity
- Verify Firecrawl API key is valid
- Review scrape_session1.log for error patterns
- Check if Central.co.th page structure changed

**Script won't start**
- Check Python version: `python3 --version` (need 3.7+)
- Verify working directory: Should be in `scripts/classification/`
- Check file permissions: `chmod +x scrape_session1_complete.py`

## Infrastructure Scripts

### incremental_scraper.py
Core state management module for resumable product scraping.

**Key Functions:**
- `load_products()` - Load source catalog
- `load_progress()` - Load scraping state
- `record_scraped_item(index, product, attrs, success)` - Save individual product
- `get_status()` - Get overall statistics

### markdown_parser.py
Attribute extraction engine for product pages.

**Main Function:**
- `parse_product_page_markdown(markdown)` - Extract 8 attributes from markdown

**Extracted Attributes:**
- subcategory
- material
- fit
- care
- color_from_page
- sleeve_type
- length_type
- description

### batch_scraper.py
Legacy batch coordination system (superceded by scrape_session1_complete.py).

## Data Files

### Input
- `../../data/products/women_clothing_v1.json` - Source catalog (1,247 products)

### Output
- `../../data/products/women_clothing_scraped.json` - Scraped product data
- `scraping_progress.json` - Progress tracking state

### State Format

`scraping_progress.json` structure:
```json
{
  "completed_indices": [0, 1, 2, 3, 4, 5, 6, 7, ...],
  "failed_indices": [],
  "total_products": 1247,
  "last_updated": "2026-02-09T15:45:23"
}
```

## Next Steps

After Session 1 completion:

1. **Validate Results**:
   ```bash
   python3 incremental_scraper.py status
   ```

2. **Session 2 Planning** (Products 250-499):
   ```bash
   python3 scrape_session1_complete.py --start 250 --end 499 --log-file scrape_session2.log
   ```

3. **Quality Review**:
   - Sample random products
   - Verify attribute accuracy
   - Document extraction errors

## Performance Notes

- Single product: ~30 seconds (API call + parsing + I/O)
- 10 products: ~5 minutes
- 243 products: ~2 hours
- Firecrawl API credits: ~250 credits total (including retries)
