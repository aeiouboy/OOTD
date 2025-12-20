# Scraper Update - Clothing Categories Configuration

## Update Date: October 12, 2025

## Changes Made

### 1. Updated Target Categories

**File**: `BEcode/config.py` (lines 12-16)

**Previous Configuration**:
```python
CATEGORIES = {
    "women": "https://www.central.co.th/th/women",
    "men": "https://www.central.co.th/th/men"
}
```

**New Configuration**:
```python
# Categories to scrape - Clothing only
CATEGORIES = {
    "women": "https://www.central.co.th/th/women/clothing",
    "men": "https://www.central.co.th/th/men/clothing"
}
```

### 2. Test Results

#### Quick Test (--no-details)
```bash
python3 central_scrape_1.py --workers 3 --no-details
```

**Results**:
- Duration: 10.62 seconds
- Women's Clothing: 17 products
- Men's Clothing: 20 products
- Total SKUs: 37
- Success Rate: 100%

**Sample Products Scraped**:
- Women's: dresses, jeans, hoodies, jackets, polo shirts
- Men's: polo shirts, dress shirts, plaid shirts, jackets, pants

#### Full Scraping Test (with details)
```bash
python3 central_scrape_1.py --workers 3
```

**Results**:
- Duration: 72.28 seconds
- Women's Clothing: 17 products
- Men's Clothing: 20 products
- Total SKUs: 37
- Validation Pass Rate: ~11% (4/37 products)

### 3. Validation Analysis

**Current Status**: 11.76% validation pass rate for women, 10% for men

**Issue Identified**: While the updated selectors work correctly in Playwright MCP (verified with real product page), Crawl4AI may not be fully rendering JavaScript or waiting long enough for dynamic content to load.

**Test Product Analysis** (https://www.central.co.th/th/steel-blue-women-straight-jeans-model-lj1n003-grmkppr000176058):

Using Playwright MCP, successfully extracted:
- ✅ Brand: "BEVERLY HILLS POLO CLUB"
- ✅ Product Name: "กางเกงยีนส์ผู้หญิงทรงปกติ รุ่น LJ1N003 สี STEEL BLUE"
- ✅ Unit Price: 619 THB
- ✅ Original Price: 2,090 THB
- ✅ Images: 7 product images
- ✅ Sizes: 28, 30, 32

**Current Scraper Output** (same product via Crawl4AI):
- ❌ Brand: "Unknown"
- ❌ Product Name: "Unknown Product"
- ❌ Unit Price: null
- ❌ Original Price: null
- ❌ Images: 0
- ❌ Sizes: 0

### 4. Root Cause Analysis

The selectors in `scraper_worker.py` (lines 188-273) are correct and work in Playwright, but Crawl4AI's rendering differs:

1. **JavaScript Rendering**: Central Group's website heavily relies on JavaScript to render product details
2. **Wait Time**: Current `PAGE_LOAD_WAIT` (5 seconds) may be insufficient
3. **Dynamic Content**: Prices, images, and variants load asynchronously after initial page load

### 5. Recommendations

#### Option A: Increase Wait Times (Quick Fix)
Update `config.py`:
```python
REQUEST_TIMEOUT = 45  # Increase from 30
PAGE_LOAD_WAIT = 10   # Increase from 5
```

#### Option B: Add Explicit Wait for Product Details (Better Solution)
Modify `scraper_worker.py` `_extract_product_details` method to add wait for specific elements:

```python
# After line 183 (result = await crawler.arun(...))
# Add wait for price elements to load
config = CrawlerRunConfig(
    page_timeout=REQUEST_TIMEOUT * 1000,
    wait_for_images=False,
    wait_until="networkidle",  # Wait until network is idle
    js_code="""
    async () => {
        // Wait for price elements to appear
        await new Promise(resolve => setTimeout(resolve, 5000));
        return document.documentElement.outerHTML;
    }
    """
)
```

#### Option C: Switch to Playwright for Product Details (Most Reliable)
Use Playwright for detailed product scraping instead of Crawl4AI, since Playwright MCP confirmed the selectors work perfectly.

### 6. Current Selector Implementation

The selectors in `SCRAPER_SELECTOR_UPDATE.md` are correct and verified. They work with:
- Playwright MCP ✅
- Real browser rendering ✅

They need adjustment for:
- Crawl4AI async rendering ⚠️
- Dynamic content loading ⚠️

## Usage Instructions

### Running the Scraper

**Basic usage** (clothing categories only):
```bash
cd /Users/naruechon/Documents/Project/OOTDay/BEcode
python3 central_scrape_1.py --workers 3
```

**Quick test** (URLs and SKUs only):
```bash
python3 central_scrape_1.py --workers 3 --no-details
```

**Clean start** (remove old files):
```bash
rm ../products/women.json ../products/men.json ../products/all_categories.json
python3 central_scrape_1.py --workers 3
```

### Output Files

- `../products/women.json` - Women's clothing products
- `../products/men.json` - Men's clothing products
- `../products/all_categories.json` - Combined catalog
- `../log/scraping_session_*.json` - Session logs

## Summary

✅ **Completed**:
- Updated configuration to target clothing-specific URLs
- Verified product URLs are correctly from clothing categories
- Confirmed selectors work correctly with Playwright

⚠️ **In Progress**:
- Improving data extraction reliability with Crawl4AI
- Need to address JavaScript rendering timing issues

📋 **Next Steps**:
1. Try Option A (increase wait times) as quick fix
2. If that doesn't improve validation rate, implement Option B (explicit waits)
3. If issues persist, consider Option C (switch to Playwright for product details)

---

**Status**: ✅ Categories Updated, ⚠️ Extraction Needs Optimization
**Test Date**: October 12, 2025
**Validation Rate**: 11% (needs improvement to reach 99% target)
