"""
Central Thailand Product Scraper v2.0
Enhanced version with better dynamic content handling and API-first approach
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import logging
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup
import re

# Configure paths
BASE_DIR = Path(__file__).parent.parent
PRODUCTS_DIR = BASE_DIR / "products"
LOG_DIR = BASE_DIR / "log"

# Ensure directories exist
PRODUCTS_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
log_file = LOG_DIR / f"scraping_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Category configuration
CATEGORIES = {
    "women": "https://www.central.co.th/th/women",
    "men": "https://www.central.co.th/th/men",
    "fashion-accessories": "https://www.central.co.th/th/fashion-accessories",
    "watches-jewelry": "https://www.central.co.th/th/watches-jewelry"
}

# Scraping configuration
NUM_WORKERS = 3
MAX_RETRIES = 3
PAGE_TIMEOUT = 60000
SCROLL_WAIT = 2  # Wait time after scrolling


class ProductScraperV2:
    """Enhanced scraper for Central Thailand products with dynamic content handling"""

    def __init__(self, num_workers: int = NUM_WORKERS):
        self.num_workers = num_workers
        self.all_products = {}
        self.scraping_stats = {
            "start_time": None,
            "end_time": None,
            "total_duration": None,
            "categories_scraped": 0,
            "total_products": 0,
            "errors": [],
            "api_calls_attempted": 0
        }

    async def scroll_page(self, page, max_scrolls=10):
        """Scroll the page to trigger lazy loading"""
        logger.info("Scrolling page to trigger lazy-loaded content...")

        for i in range(max_scrolls):
            # Scroll to bottom
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(SCROLL_WAIT)

            # Check if we've reached the bottom
            scroll_height = await page.evaluate('document.body.scrollHeight')
            client_height = await page.evaluate('window.innerHeight')
            scroll_top = await page.evaluate('window.scrollY')

            if scroll_top + client_height >= scroll_height - 100:
                logger.info(f"Reached bottom of page after {i+1} scrolls")
                break

    async def extract_api_data(self, page):
        """Try to extract product data from API calls"""
        logger.info("Attempting to intercept API calls for product data...")

        # Get all network requests
        try:
            # Wait a bit for API calls to complete
            await asyncio.sleep(3)

            # Try to find product data in window object
            product_data = await page.evaluate('''() => {
                // Try various common patterns for product data
                const data = [];

                // Check window object for product data
                if (window.__NEXT_DATA__) {
                    data.push({source: 'NEXT_DATA', data: window.__NEXT_DATA__});
                }

                // Check for algolia/search results
                if (window.algolia) {
                    data.push({source: 'algolia', data: window.algolia});
                }

                // Look for product arrays in global scope
                for (const key in window) {
                    if (key.toLowerCase().includes('product') && Array.isArray(window[key])) {
                        data.push({source: key, data: window[key]});
                    }
                }

                return data;
            }''')

            if product_data:
                logger.info(f"Found {len(product_data)} potential data sources")
                return product_data

        except Exception as e:
            logger.warning(f"Could not extract API data: {e}")

        return None

    def extract_products_from_html(self, html: str) -> List[Dict]:
        """Extract product information from HTML content"""
        products = []
        soup = BeautifulSoup(html, 'html.parser')

        # Strategy 1: Look for product links
        product_links = set()
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Match central.co.th product URLs
            if '/th/' in href and not any(x in href for x in ['category', 'brand', 'shopbybrand', 'store']):
                # Product URLs typically have a long SKU at the end
                if re.search(r'[a-z]{2,}[0-9]{8,}', href.lower()):
                    product_links.add(href)

        logger.info(f"Found {len(product_links)} unique product links")

        # Extract data from each product link
        for url in product_links:
            try:
                if not url.startswith('http'):
                    url = f"https://www.central.co.th{url}"

                # Extract SKU from URL
                sku_match = re.search(r'([a-z0-9]+)$', url.lower())
                sku = sku_match.group(1) if sku_match else None

                if sku:
                    # Try to find the product card containing this link
                    link_elem = soup.find('a', href=re.compile(sku))
                    if link_elem:
                        parent = link_elem.find_parent(['div', 'article', 'li'])

                        # Extract brand and name
                        brand = "Unknown"
                        name = "Unknown Product"
                        unit_price = None
                        original_price = None

                        if parent:
                            # Look for text elements
                            texts = parent.find_all(text=True)
                            for text in texts:
                                text = str(text).strip()
                                # Price detection
                                if '฿' in text or re.match(r'^\d{1,3}(,\d{3})*(\.\d{2})?$', text.replace(',', '')):
                                    try:
                                        price = float(re.sub(r'[^\d.]', '', text))
                                        if not unit_price:
                                            unit_price = price
                                        elif price != unit_price:
                                            original_price = max(price, unit_price)
                                            unit_price = min(price, unit_price)
                                    except:
                                        pass

                        products.append({
                            "sku": sku,
                            "brand": brand,
                            "name": name,
                            "unit_price": unit_price,
                            "original_price": original_price or unit_price,
                            "url": url
                        })

            except Exception as e:
                logger.debug(f"Error extracting product from {url}: {e}")
                continue

        return products

    async def scrape_category_page(self, crawler, url: str, page_num: int = 1) -> List[Dict]:
        """Scrape a single category page with enhanced dynamic content handling"""
        logger.info(f"Scraping page {page_num}: {url}")

        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=PAGE_TIMEOUT,
            delay_before_return_html=5.0,  # Wait for initial load
            js_code=[
                # Scroll to trigger lazy loading
                "window.scrollTo(0, document.body.scrollHeight);",
                "await new Promise(r => setTimeout(r, 2000));",
                "window.scrollTo(0, document.body.scrollHeight);",
            ]
        )

        for attempt in range(MAX_RETRIES):
            try:
                result = await crawler.arun(url=url, config=config)

                if result.success:
                    products = self.extract_products_from_html(result.html)
                    logger.info(f"Successfully scraped {len(products)} products from page {page_num}")
                    return products
                else:
                    logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {url}: {result.error_message}")

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {url}: {e}")

            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)

        self.scraping_stats["errors"].append(f"Failed to scrape {url} after {MAX_RETRIES} attempts")
        return []

    async def scrape_category(self, category_name: str, category_url: str) -> Dict:
        """Scrape all products from a category"""
        logger.info(f"Starting to scrape category: {category_name}")
        category_start_time = time.time()

        all_category_products = []

        async with AsyncWebCrawler(verbose=True) as crawler:
            # For now, just scrape the first page
            # TODO: Implement pagination detection and scraping
            products = await self.scrape_category_page(crawler, category_url, 1)
            all_category_products.extend(products)

        # Remove duplicates based on SKU
        unique_products = {p['sku']: p for p in all_category_products}.values()
        unique_products_list = list(unique_products)

        category_duration = time.time() - category_start_time

        category_data = {
            "category": category_name,
            "url": category_url,
            "total_products": len(unique_products_list),
            "pages_scraped": 1,
            "scraping_duration": category_duration,
            "timestamp": datetime.now().isoformat(),
            "products": unique_products_list
        }

        logger.info(f"Completed {category_name}: {len(unique_products_list)} unique products in {category_duration:.2f}s")

        return category_data

    def validate_category_data(self, category_data: Dict) -> bool:
        """Validate that category data is complete"""
        if not category_data.get("products"):
            logger.warning(f"Category {category_data.get('category')} has no products")
            return False

        products = category_data["products"]
        total_products = len(products)

        valid_products = sum(1 for p in products if p.get('sku') and p.get('url'))
        validation_rate = valid_products / total_products if total_products > 0 else 0

        logger.info(f"Validation: {valid_products}/{total_products} products valid ({validation_rate:.1%})")

        return validation_rate >= 0.80  # At least 80% valid

    def save_category_data(self, category_data: Dict, version: int = 2):
        """Save category data to JSON file"""
        category_name = category_data["category"]
        filename = f"{category_name}_{version}.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(category_data, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved {category_name} data to {filepath}")

    def save_all_categories(self, version: int = 2):
        """Save all categories combined"""
        filename = f"all_categories_{version}.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.all_products, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved all categories to {filepath}")

    def save_scraping_summary(self):
        """Save scraping summary"""
        summary_file = LOG_DIR / f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(self.scraping_stats, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved scraping summary to {summary_file}")

    async def scrape_all_categories(self):
        """Scrape all configured categories"""
        self.scraping_stats["start_time"] = datetime.now().isoformat()
        start_time = time.time()

        logger.info(f"Starting scraping of {len(CATEGORIES)} categories")

        for category_name, category_url in CATEGORIES.items():
            try:
                category_data = await self.scrape_category(category_name, category_url)

                is_valid = self.validate_category_data(category_data)

                if is_valid:
                    self.save_category_data(category_data)
                    self.all_products[category_name] = category_data
                    self.scraping_stats["categories_scraped"] += 1
                    self.scraping_stats["total_products"] += category_data["total_products"]
                else:
                    logger.warning(f"Category {category_name} data validation failed")
                    self.scraping_stats["errors"].append(f"Validation failed for {category_name}")

            except Exception as e:
                error_msg = f"Error scraping category {category_name}: {e}"
                logger.error(error_msg)
                self.scraping_stats["errors"].append(error_msg)

        if self.all_products:
            self.save_all_categories()

        end_time = time.time()
        self.scraping_stats["end_time"] = datetime.now().isoformat()
        self.scraping_stats["total_duration"] = end_time - start_time

        self.save_scraping_summary()

        logger.info("="*50)
        logger.info("SCRAPING COMPLETED")
        logger.info(f"Total duration: {self.scraping_stats['total_duration']:.2f}s")
        logger.info(f"Categories scraped: {self.scraping_stats['categories_scraped']}/{len(CATEGORIES)}")
        logger.info(f"Total products: {self.scraping_stats['total_products']}")
        logger.info(f"Errors: {len(self.scraping_stats['errors'])}")
        logger.info("="*50)


async def main():
    """Main entry point"""
    scraper = ProductScraperV2(num_workers=NUM_WORKERS)
    await scraper.scrape_all_categories()


if __name__ == "__main__":
    asyncio.run(main())
