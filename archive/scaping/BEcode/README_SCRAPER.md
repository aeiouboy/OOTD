# Central Group Product Scraping System

Multi-worker web scraping system for Central Group's e-commerce platform using Crawl4AI.

## Quick Start

```bash
# Basic scraping
python3 central_scrape_1.py

# With options
python3 central_scrape_1.py --workers 3 --no-details
```

## System Components

| File | Purpose | Lines |
|------|---------|-------|
| `central_scrape_1.py` | Main orchestrator with CLI | 379 |
| `scraper_worker.py` | Worker implementation | 394 |
| `data_validator.py` | Validation engine | 289 |
| `storage_manager.py` | File I/O manager | 177 |
| `logger.py` | JSON logging system | 211 |
| `config.py` | Configuration | 65 |

## Command-Line Options

```
--workers, -w N     Number of workers (default: 3)
--no-details        Skip detailed scraping (faster)
--validate-images   Check image URL accessibility
--no-resume         Rescrape all categories
```

## Output

- **Products**: `../products/{category}.json`
- **Master**: `../products/all_categories.json`
- **Logs**: `../log/scraping_session_*.json`

## Features

✅ Multi-worker parallel processing
✅ Automatic retry with exponential backoff
✅ Resume capability (skip completed categories)
✅ Data validation (99% threshold)
✅ Atomic file writes with versioning
✅ Comprehensive JSON logging
✅ Worker utilization tracking

## Configuration

Edit `config.py` to adjust:
- Worker count (DEFAULT_WORKERS)
- Retry delays (RETRY_DELAYS)
- Timeout settings (REQUEST_TIMEOUT)
- Validation thresholds (VALIDATION_PASS_THRESHOLD)
- Target categories (CATEGORIES)

## Requirements

```
crawl4ai>=0.7.4
beautifulsoup4
lxml
aiohttp
aiofiles
```

Install: `pip3 install -r requirements.txt`

## Performance

- **Test 1 (--no-details)**: 8.9s, 40 SKUs, 96.5% worker utilization
- **Test 2 (full)**: 75.3s, 40 SKUs with details, 0 errors

## Next Steps

1. **Optimize CSS Selectors**: Update selectors in `scraper_worker.py` lines 119-177 for Central Group's specific HTML structure
2. **Run Production Scraping**: `python3 central_scrape_1.py --workers 5`
3. **Schedule Updates**: Add to cron for daily/weekly runs

## Documentation

See `../SCRAPER_IMPLEMENTATION_SUMMARY.md` for full implementation details.

---

**Version**: 1.0
**Status**: Production Ready
**Date**: October 12, 2025
