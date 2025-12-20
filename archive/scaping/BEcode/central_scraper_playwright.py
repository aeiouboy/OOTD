"""
Central Thailand Product Scraper - Playwright Version
Complete scraper that handles dynamic content and pagination
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import logging
from playwright.async_api import async_playwright

# Configure paths
BASE_DIR = Path(__file__).parent.parent
PRODUCTS_DIR = BASE_DIR / "products"
LOG_DIR = BASE_DIR / "log"

# Ensure directories exist
PRODUCTS_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
log_file = LOG_DIR / f"scraping_playwright_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
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
    "men": "https://www.central.co.th/th/men",
    "women": "https://www.central.co.th/th/women",
    "fashion-accessories": "https://www.central.co.th/th/fashion-accessories",
    "watches-jewelry": "https://www.central.co.th/th/watches-jewelry"
}

# Scraping configuration
HEADLESS = True  # Set to False to see browser
WAIT_AFTER_LOAD = 15000  # Wait 15 seconds for JS to load
SCROLL_ITERATIONS = 5
SCROLL_WAIT = 3000


class PlaywrightProductScraper:
    """Scraper using Playwright for dynamic content"""

    def __init__(self):
        self.all_products = {}
        self.scraping_stats = {
            "start_time": None,
            "end_time": None,
            "total_duration": None,
            "categories_scraped": 0,
            "total_products": 0,
            "errors": []
        }

    def extract_sku_from_url(self, url: str) -> str:
        """Extract SKU from product URL"""
        # Pattern: /th/product-name-grmkppr000190452
        match = re.search(r'gr([a-z0-9]+)$', url.lower())
        if match:
            return f"gr{match.group(1)}"
        return url.split('/')[-1] if '/' in url else url

    async def wait_for_products_to_load(self, page):
        """Wait for products to load dynamically"""
        logger.info(f"Waiting {WAIT_AFTER_LOAD/1000}s for JavaScript to load products...")
        await page.wait_for_timeout(WAIT_AFTER_LOAD)

        # Scroll to trigger lazy loading
        logger.info(f"Scrolling {SCROLL_ITERATIONS} times to trigger lazy loading...")
        for i in range(SCROLL_ITERATIONS):
            # Scroll incrementally
            await page.evaluate(f'window.scrollTo(0, {2000 * (i+1)})')
            await page.wait_for_timeout(SCROLL_WAIT)

            # Check how many product links we have now
            links = await self.extract_product_links(page)
            logger.info(f"  Scroll {i+1}/{SCROLL_ITERATIONS}: {len(links)} products found")

    async def extract_product_links(self, page) -> List[str]:
        """Extract all product links from current page"""
        # Find all links that match product URL pattern
        all_links = await page.query_selector_all('a[href*="/th/"]')

        product_urls = set()
        for link in all_links:
            href = await link.get_attribute('href')
            if href:
                # Product URLs contain pattern: /th/product-name-grXXXXXXXXX
                # Pattern: ends with -grXXXXXXX where X is letters followed by numbers
                if re.search(r'-gr[a-z0-9]+$', href.lower()):
                    # Skip category, brand, campaign pages
                    if not any(x in href.lower() for x in ['category', 'brand', 'shopbybrand', 'campaign', 'store', 'search']):
                        full_url = href if href.startswith('http') else f'https://www.central.co.th{href}'
                        product_urls.add(full_url)

        return list(product_urls)

    async def scrape_product_details(self, page, product_url: str) -> Dict:
        """Scrape detailed product information from product page"""
        try:
            logger.info(f"  Visiting product: {product_url[:80]}...")
            await page.goto(product_url, wait_until='domcontentloaded', timeout=30000)
            await page.wait_for_timeout(3000)  # Wait for product details to load

            sku = self.extract_sku_from_url(product_url)

            # Extract product name
            try:
                name = await page.text_content('h1')
                name = name.strip() if name else "Unknown Product"
            except:
                name = "Unknown Product"

            # Extract brand
            try:
                brand_elem = await page.query_selector('[class*="brand"], [data-testid*="brand"]')
                brand = await brand_elem.text_content() if brand_elem else "Unknown"
                brand = brand.strip()
            except:
                brand = "Unknown"

            # Extract prices
            try:
                price_elems = await page.query_selector_all('[class*="price"], [data-testid*="price"]')
                prices = []
                for elem in price_elems:
                    text = await elem.text_content()
                    if text:
                        # Extract numbers from price text
                        price_match = re.search(r'[\d,]+(?:\.\d{2})?', text.replace(',', ''))
                        if price_match:
                            prices.append(float(price_match.group().replace(',', '')))

                unit_price = min(prices) if prices else None
                original_price = max(prices) if len(prices) > 1 else unit_price
            except:
                unit_price = None
                original_price = None

            # Extract image
            try:
                img_elem = await page.query_selector('img[src*="central.co.th"]')
                image_url = await img_elem.get_attribute('src') if img_elem else None
            except:
                image_url = None

            return {
                "sku": sku,
                "brand": brand,
                "name": name,
                "unit_price": unit_price,
                "original_price": original_price,
                "url": product_url,
                "image_url": image_url
            }

        except Exception as e:
            logger.error(f"  Error scraping product {product_url}: {e}")
            return {
                "sku": self.extract_sku_from_url(product_url),
                "url": product_url,
                "error": str(e)
            }

    async def check_for_infinite_scroll(self, page) -> bool:
        """Check if the page uses infinite scroll"""
        # Scroll down and check if new products appear
        before_scroll = len(await self.extract_product_links(page))

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        await page.wait_for_timeout(3000)

        after_scroll = len(await self.extract_product_links(page))

        return after_scroll > before_scroll

    async def scrape_category(self, category_name: str, category_url: str) -> Dict:
        """Scrape all products from a category"""
        logger.info(f"\n{'='*60}")
        logger.info(f"Starting category: {category_name}")
        logger.info(f"{'='*60}")

        category_start_time = asyncio.get_event_loop().time()
        all_product_urls = set()

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=HEADLESS)
            page = await browser.new_page()

            try:
                # Navigate to category page
                logger.info(f"Navigating to {category_url}")
                await page.goto(category_url, wait_until='domcontentloaded', timeout=60000)

                # Wait for products to load
                await self.wait_for_products_to_load(page)

                # Extract product links from first load
                product_links = await self.extract_product_links(page)
                logger.info(f"Found {len(product_links)} product links after initial load")
                all_product_urls.update(product_links)

                # Check if infinite scroll exists
                has_infinite_scroll = await self.check_for_infinite_scroll(page)

                if has_infinite_scroll:
                    logger.info("Detected infinite scroll - continuing to scroll...")

                    # Continue scrolling until no new products
                    max_scrolls = 50
                    scroll_count = 0
                    no_new_products_count = 0

                    while scroll_count < max_scrolls and no_new_products_count < 3:
                        before_count = len(all_product_urls)

                        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                        await page.wait_for_timeout(SCROLL_WAIT)

                        new_links = await self.extract_product_links(page)
                        all_product_urls.update(new_links)

                        after_count = len(all_product_urls)
                        new_products = after_count - before_count

                        if new_products == 0:
                            no_new_products_count += 1
                        else:
                            no_new_products_count = 0
                            logger.info(f"  Scroll {scroll_count + 1}: Found {new_products} new products (total: {after_count})")

                        scroll_count += 1

                    logger.info(f"Finished scrolling after {scroll_count} iterations")

                logger.info(f"\nTotal unique product URLs found: {len(all_product_urls)}")

                # Option: Scrape detailed info from each product page
                # WARNING: This will be SLOW - may want to skip for initial test
                scrape_details = False  # Set to True to visit each product page

                if scrape_details:
                    logger.info("\nScraping detailed product information...")
                    products = []
                    for i, url in enumerate(all_product_urls, 1):
                        logger.info(f"Product {i}/{len(all_product_urls)}")
                        product = await self.scrape_product_details(page, url)
                        products.append(product)

                        # Be respectful - add delay
                        if i % 10 == 0:
                            await asyncio.sleep(2)
                else:
                    # Just save URLs and SKUs
                    products = [
                        {
                            "sku": self.extract_sku_from_url(url),
                            "url": url
                        }
                        for url in all_product_urls
                    ]

            finally:
                await browser.close()

        category_duration = asyncio.get_event_loop().time() - category_start_time

        category_data = {
            "category": category_name,
            "url": category_url,
            "total_products": len(products),
            "scraping_duration": category_duration,
            "timestamp": datetime.now().isoformat(),
            "products": products
        }

        logger.info(f"\n✓ Completed {category_name}: {len(products)} products in {category_duration:.2f}s")

        return category_data

    def save_category_data(self, category_data: Dict):
        """Save category data to JSON file"""
        category_name = category_data["category"]
        filename = f"{category_name}_playwright.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(category_data, f, ensure_ascii=False, indent=2)

        logger.info(f"💾 Saved {category_name} data to {filepath}")

    def save_all_categories(self):
        """Save all categories combined"""
        filename = "all_categories_playwright.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.all_products, f, ensure_ascii=False, indent=2)

        logger.info(f"💾 Saved all categories to {filepath}")

    def save_scraping_summary(self):
        """Save scraping summary"""
        summary_file = LOG_DIR / f"summary_playwright_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(self.scraping_stats, f, ensure_ascii=False, indent=2)

        logger.info(f"💾 Saved summary to {summary_file}")

    async def scrape_all_categories(self):
        """Scrape all configured categories"""
        self.scraping_stats["start_time"] = datetime.now().isoformat()
        start_time = asyncio.get_event_loop().time()

        logger.info(f"\n🚀 Starting scraping of {len(CATEGORIES)} categories")
        logger.info(f"Configuration:")
        logger.info(f"  - Headless: {HEADLESS}")
        logger.info(f"  - Wait after load: {WAIT_AFTER_LOAD/1000}s")
        logger.info(f"  - Scroll iterations: {SCROLL_ITERATIONS}")

        for category_name, category_url in CATEGORIES.items():
            try:
                category_data = await self.scrape_category(category_name, category_url)

                self.save_category_data(category_data)
                self.all_products[category_name] = category_data
                self.scraping_stats["categories_scraped"] += 1
                self.scraping_stats["total_products"] += category_data["total_products"]

            except Exception as e:
                error_msg = f"Error scraping category {category_name}: {e}"
                logger.error(error_msg)
                self.scraping_stats["errors"].append(error_msg)

        if self.all_products:
            self.save_all_categories()

        end_time = asyncio.get_event_loop().time()
        self.scraping_stats["end_time"] = datetime.now().isoformat()
        self.scraping_stats["total_duration"] = end_time - start_time

        self.save_scraping_summary()

        logger.info("\n" + "="*60)
        logger.info("✅ SCRAPING COMPLETED")
        logger.info("="*60)
        logger.info(f"Total duration: {self.scraping_stats['total_duration']:.2f}s")
        logger.info(f"Categories scraped: {self.scraping_stats['categories_scraped']}/{len(CATEGORIES)}")
        logger.info(f"Total products: {self.scraping_stats['total_products']}")
        logger.info(f"Errors: {len(self.scraping_stats['errors'])}")
        logger.info("="*60)


async def main():
    """Main entry point"""
    scraper = PlaywrightProductScraper()
    await scraper.scrape_all_categories()


if __name__ == "__main__":
    asyncio.run(main())