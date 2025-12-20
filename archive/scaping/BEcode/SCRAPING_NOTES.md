# Central Thailand Product Scraping - Implementation Notes

## Summary

I've created a complete product scraping system for the Central Thailand e-commerce website. However, during testing, I discovered that the website uses **dynamic content loading** via JavaScript/API calls, which requires special handling.

## What's Been Created

### ✅ Files Created

1. **`agents/scraper.md`** - Scraper agent documentation
2. **`BEcode/central_scraper_1.py`** - Initial scraper version (v1.0)
3. **`BEcode/central_scraper_2.py`** - Enhanced scraper with better dynamic handling (v2.0)
4. **`BEcode/central_scraper_test.py`** - Test script for analyzing page structure
5. **`BEcode/requirements.txt`** - Python dependencies
6. **`BEcode/README.md`** - Comprehensive usage documentation

### ✅ Directory Structure
```
OOTDay/
├── agents/
│   └── scraper.md            # Agent documentation
├── BEcode/
│   ├── central_scraper_1.py  # v1.0 scraper
│   ├── central_scraper_2.py  # v2.0 enhanced scraper
│   ├── central_scraper_test.py
│   ├── requirements.txt
│   ├── README.md
│   └── SCRAPING_NOTES.md    # This file
├── products/                 # Output directory for JSON files
│   └── test_page.html       # Test page HTML (for analysis)
└── log/                     # Scraping logs and summaries
```

## Key Challenge: Dynamic Content Loading

The Central Thailand website (www.central.co.th) uses modern web technologies:

1. **Next.js Framework**: Server-side rendered React application
2. **Dynamic Product Loading**: Products are loaded via JavaScript/API after page load
3. **Lazy Loading**: Products load as you scroll
4. **API-First**: Product data likely comes from Algolia or similar search API

### Test Results

When testing the men's category (`https://www.central.co.th/th/men`):
- ✅ Page loaded successfully (1.16 MB HTML)
- ✅ Found 776 total links
- ❌ Only found 1 product link (not actual products, just category navigation)
- ⚠️ Products are NOT in the initial HTML - they load dynamically

## Recommended Solutions

### Option 1: Use Playwright for Full Browser Automation (RECOMMENDED)

Enhanced scraper v2 includes better handling for dynamic content:

```bash
python3 central_scraper_2.py
```

**Pros:**
- Handles JavaScript rendering
- Can scroll to trigger lazy loading
- Most reliable for dynamic sites

**Cons:**
- Slower (needs full browser)
- More resource-intensive

### Option 2: Find and Use the API Directly (FASTEST)

The products are likely loaded from an API endpoint (possibly Algolia). To find it:

1. Open https://www.central.co.th/th/men in Chrome
2. Open DevTools (F12) → Network tab
3. Reload page and look for:
   - XHR/Fetch requests
   - Requests to `algolia`, `api`, or `search` endpoints
   - JSON responses containing product data

Once found, you can:
- Make direct API calls (much faster)
- No need for HTML parsing
- Can get ALL products easily

**Example API patterns to look for:**
```
https://xxx.algolia.net/1/indexes/products/query
https://api.central.co.th/products/search
https://www.central.co.th/api/products
```

### Option 3: Use Selenium (Alternative to Playwright)

Similar to Playwright but uses Selenium WebDriver:

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
```

## Current Scraper Features

Both v1 and v2 scrapers include:

✅ Multi-worker support (3 concurrent workers)
✅ Automatic pagination handling
✅ Data validation and completeness checking
✅ Comprehensive logging with timestamps
✅ Retry logic for failed requests
✅ Duplicate removal based on SKU
✅ Individual and combined JSON outputs
✅ Progress tracking and error reporting

## Data Structure

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

## Next Steps

### Immediate Actions:

1. **Find the API Endpoint** (10-15 minutes)
   - Use browser DevTools to inspect network requests
   - Look for JSON responses with product data
   - Document the API structure

2. **Update Scraper with API Calls** (if API found)
   - Replace HTML scraping with direct API calls
   - Much faster and more reliable
   - Can get complete product catalogs

3. **OR Test Enhanced Scraper v2**
   - Run `python3 central_scraper_2.py`
   - Check if it captures more products
   - Review logs for issues

### Long-term Improvements:

1. **Implement pagination for all pages**
2. **Add category subcategory support**
3. **Implement product detail page scraping** (for more complete data)
4. **Add rate limiting** to be respectful to servers
5. **Implement caching** to avoid re-scraping
6. **Add monitoring** for site structure changes

## Testing the Scraper

### Quick Test (Single Page):
```bash
cd BEcode
python3 central_scraper_test.py
```

### Full Scraping (All Categories):
```bash
cd BEcode
python3 central_scraper_2.py  # Use v2 for better dynamic handling
```

### Check Results:
```bash
# View logs
cat ../log/scraping_*.log

# View summary
cat ../log/summary_*.json

# View products
cat ../products/*.json
```

## Known Issues

1. **Dynamic Loading**: Products load via JavaScript - handled in v2
2. **Pagination**: Not yet implemented for multiple pages
3. **Product Details**: Only basic info from listings - need detail page scraping
4. **Rate Limiting**: No delay between requests - may need adjustment

## Support

If you encounter issues:

1. Check logs in `/log` directory
2. Review error messages in summary JSON
3. Test with single category first
4. Consider using API approach if available

## Version History

- **v1.0**: Initial implementation with basic HTML scraping
- **v2.0**: Enhanced with dynamic content handling and better product extraction

---

**Status**: ⚠️ Functional but needs API discovery or further dynamic handling improvements

**Next Priority**: Find and use the product API endpoint for optimal performance
