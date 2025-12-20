# Central Thailand Product Scraper

## Overview
This scraper extracts product information from Central Thailand's e-commerce website (www.central.co.th) across multiple categories.

## Features
- ✅ Multi-worker scraping support (default: 3 workers)
- ✅ Automatic pagination handling
- ✅ Data validation and completeness checking
- ✅ Comprehensive logging with timestamps
- ✅ Retry logic for failed requests
- ✅ Duplicate removal based on SKU
- ✅ Individual and combined JSON outputs

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Steps

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up crawl4ai (first time only):
```bash
crawl4ai-setup
```

This will install required browser dependencies for web scraping.

## Usage

### Basic Usage
Run the scraper for all categories:
```bash
python central_scraper_1.py
```

### Configuration
Edit the script to modify:
- `NUM_WORKERS`: Number of concurrent workers (default: 3)
- `MAX_RETRIES`: Maximum retry attempts (default: 3)
- `TIMEOUT`: Page load timeout in ms (default: 60000)

### Categories Scraped
1. Women's Fashion: https://www.central.co.th/th/women
2. Men's Fashion: https://www.central.co.th/th/men
3. Fashion Accessories: https://www.central.co.th/th/fashion-accessories
4. Watches & Jewelry: https://www.central.co.th/th/watches-jewelry

## Output

### Directory Structure
```
OOTDay/
├── products/           # Scraped product data
│   ├── women.json
│   ├── men.json
│   ├── fashion-accessories.json
│   ├── watches-jewelry.json
│   └── all_categories.json
├── log/               # Scraping logs
│   ├── scraping_YYYYMMDD_HHMMSS.log
│   └── summary_YYYYMMDD_HHMMSS.json
└── BEcode/            # Scraper code
    └── central_scraper_1.py
```

### Product Data Format
Each product includes:
```json
{
  "sku": "grcds53725070552",
  "brand": "EXPRESSIONS",
  "name": "Women Midi Dress with Mock Neck",
  "unit_price": 1590.0,
  "original_price": 2650.0,
  "url": "https://www.central.co.th/th/..."
}
```

### Category File Format
```json
{
  "category": "women",
  "url": "https://www.central.co.th/th/women",
  "total_products": 1234,
  "pages_scraped": 45,
  "scraping_duration": 456.78,
  "timestamp": "2025-10-07T10:30:00",
  "products": [...]
}
```

## Data Validation

The scraper validates:
- ✅ All required fields present (sku, brand, name, url)
- ✅ At least 95% of products are valid
- ✅ Only saves categories that pass validation
- ✅ Waits for complete SKU collection before saving

## Logging

Two types of logs are generated:

### 1. Scraping Log (`log/scraping_*.log`)
- Real-time scraping progress
- Errors and warnings
- Page-by-page status

### 2. Summary Log (`log/summary_*.json`)
- Total duration
- Categories scraped
- Total products collected
- List of errors

## Error Handling

- **Failed requests**: Automatic retry with exponential backoff (up to 3 attempts)
- **Incomplete data**: Logged as errors, scraping continues
- **Validation failures**: Category not saved, error logged
- **Network issues**: Timeout protection, graceful failure

## Performance

- **Estimated time**: 5-15 minutes per category (depends on product count)
- **Concurrent workers**: 3 (adjustable)
- **Respectful scraping**: 1-second delay between pages

## Troubleshooting

### Browser not installed error
Run:
```bash
crawl4ai-setup
```

### No products found
- Check if website structure has changed
- Review HTML selectors in `extract_products_from_html()`
- Check log files for specific errors

### Validation failures
- Increase timeout value
- Check internet connection
- Review error logs for patterns

## Version History

- **v1.0** (2025-10-07): Initial release
  - Multi-worker support
  - Pagination handling
  - Data validation
  - Comprehensive logging

## Notes

- Be respectful to the server (built-in delays)
- Monitor log files during scraping
- Review validation results before using data
- Categories are scraped sequentially to avoid overloading the server

## Support

Check logs in `/log` directory for detailed error information.
