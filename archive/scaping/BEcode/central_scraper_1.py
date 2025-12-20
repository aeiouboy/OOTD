"""
Central Thailand Product Scraper v1.0
Scrapes product information from Central Thailand e-commerce website
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import re
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup
import logging

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
TIMEOUT = 60000  # 60 seconds


class ProductScraper:
    """Scraper for Central Thailand products"""

    def __init__(self, num_workers: int = NUM_WORKERS):
        self.num_workers = num_workers
        self.all_products = {}
        self.scraping_stats = {
            "start_time": None,
            "end_time": None,
            "total_duration": None,
            "categories_scraped": 0,
            "total_products": 0,
            "errors": []
        }

    def extract_products_from_html(self, html: str, category_url: str) -> List[Dict]:
        """Extract product information from HTML content"""
        products = []
        soup = BeautifulSoup(html, 'html.parser')

        # Find product cards/items
        # This selector needs to be adjusted based on actual HTML structure
        product_elements = soup.find_all(['div', 'article'], class_=re.compile(r'product|item|card', re.I))

        logger.info(f"Found {len(product_elements)} potential product elements")

        for element in product_elements:
            try:
                product = self.extract_product_data(element, category_url)
                if product and product.get('sku'):
                    products.append(product)
            except Exception as e:
                logger.warning(f"Error extracting product: {e}")
                continue

        return products

    def extract_product_data(self, element, base_url: str) -> Optional[Dict]:
        """Extract individual product data from HTML element"""
        try:
            # Find product link
            link_elem = element.find('a', href=re.compile(r'/th/'))
            if not link_elem:
                return None

            product_url = link_elem.get('href', '')
            if not product_url.startswith('http'):
                product_url = f"https://www.central.co.th{product_url}"

            # Extract SKU from URL
            sku_match = re.search(r'([a-z0-9]+)$', product_url.lower())
            sku = sku_match.group(1) if sku_match else None

            if not sku:
                return None

            # Extract brand
            brand_elem = element.find(['span', 'div', 'p'], class_=re.compile(r'brand', re.I))
            brand = brand_elem.get_text(strip=True) if brand_elem else "Unknown"

            # Extract product name
            name_elem = element.find(['h2', 'h3', 'h4', 'p', 'span'], class_=re.compile(r'name|title|product', re.I))
            name = name_elem.get_text(strip=True) if name_elem else "Unknown Product"

            # Extract prices
            price_elements = element.find_all(['span', 'div', 'p'], class_=re.compile(r'price', re.I))

            unit_price = None
            original_price = None

            for price_elem in price_elements:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'[\d,]+(?:\.\d{2})?', price_text.replace(',', ''))
                if price_match:
                    price_value = float(price_match.group().replace(',', ''))

                    # Check if it's a discounted price
                    if 'sale' in price_elem.get('class', []) or 'discount' in str(price_elem).lower():
                        unit_price = price_value
                    elif 'original' in price_elem.get('class', []) or 'strikethrough' in str(price_elem).lower():
                        original_price = price_value
                    elif unit_price is None:
                        unit_price = price_value

            # If only one price found, use it as both
            if unit_price and not original_price:
                original_price = unit_price

            return {
                "sku": sku,
                "brand": brand,
                "name": name,
                "unit_price": unit_price,
                "original_price": original_price,
                "url": product_url
            }

        except Exception as e:
            logger.debug(f"Error extracting product data: {e}")
            return None

    def find_next_page_url(self, html: str, current_url: str) -> Optional[str]:
        """Find the URL for the next page"""
        soup = BeautifulSoup(html, 'html.parser')

        # Look for next page link
        next_link = soup.find('a', class_=re.compile(r'next', re.I))
        if not next_link:
            next_link = soup.find('a', attrs={'aria-label': re.compile(r'next', re.I)})

        if next_link:
            next_url = next_link.get('href', '')
            if next_url and not next_url.startswith('http'):
                next_url = f"https://www.central.co.th{next_url}"
            return next_url

        # Check for pagination with page numbers
        page_match = re.search(r'page=(\d+)', current_url)
        if page_match:
            current_page = int(page_match.group(1))
            next_url = re.sub(r'page=\d+', f'page={current_page + 1}', current_url)
            return next_url

        return None

    async def scrape_category_page(self, crawler, url: str, page_num: int = 1) -> tuple[List[Dict], Optional[str]]:
        """Scrape a single category page"""
        logger.info(f"Scraping page {page_num}: {url}")

        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=TIMEOUT,
            wait_for="networkidle"
        )

        for attempt in range(MAX_RETRIES):
            try:
                result = await crawler.arun(url=url, config=config)

                if result.success:
                    products = self.extract_products_from_html(result.html, url)
                    next_url = self.find_next_page_url(result.html, url)
                    logger.info(f"Successfully scraped {len(products)} products from page {page_num}")
                    return products, next_url
                else:
                    logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {url}: {result.error_message}")

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {url}: {e}")

            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

        self.scraping_stats["errors"].append(f"Failed to scrape {url} after {MAX_RETRIES} attempts")
        return [], None

    async def scrape_category(self, category_name: str, category_url: str) -> Dict:
        """Scrape all products from a category (all pages)"""
        logger.info(f"Starting to scrape category: {category_name}")
        category_start_time = time.time()

        all_category_products = []
        current_url = category_url
        page_num = 1
        max_pages = 100  # Safety limit

        async with AsyncWebCrawler(verbose=True) as crawler:
            while current_url and page_num <= max_pages:
                products, next_url = await self.scrape_category_page(crawler, current_url, page_num)
                all_category_products.extend(products)

                if not next_url or next_url == current_url:
                    break

                current_url = next_url
                page_num += 1
                await asyncio.sleep(1)  # Be respectful to the server

        # Remove duplicates based on SKU
        unique_products = {p['sku']: p for p in all_category_products}.values()
        unique_products_list = list(unique_products)

        category_duration = time.time() - category_start_time

        category_data = {
            "category": category_name,
            "url": category_url,
            "total_products": len(unique_products_list),
            "pages_scraped": page_num,
            "scraping_duration": category_duration,
            "timestamp": datetime.now().isoformat(),
            "products": unique_products_list
        }

        logger.info(f"Completed {category_name}: {len(unique_products_list)} unique products in {category_duration:.2f}s")

        return category_data

    def validate_category_data(self, category_data: Dict) -> bool:
        """Validate that category data is complete and correct"""
        if not category_data.get("products"):
            logger.warning(f"Category {category_data.get('category')} has no products")
            return False

        products = category_data["products"]
        total_products = len(products)

        # Check for required fields
        valid_products = 0
        for product in products:
            if all(key in product for key in ["sku", "brand", "name", "url"]):
                valid_products += 1

        validation_rate = valid_products / total_products if total_products > 0 else 0

        logger.info(f"Validation: {valid_products}/{total_products} products valid ({validation_rate:.1%})")

        return validation_rate >= 0.95  # At least 95% valid

    def save_category_data(self, category_data: Dict, version: int = 1):
        """Save category data to JSON file"""
        category_name = category_data["category"]
        filename = f"{category_name}_{version}.json" if version > 1 else f"{category_name}.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(category_data, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved {category_name} data to {filepath}")

    def save_all_categories(self, version: int = 1):
        """Save all categories combined into one file"""
        filename = f"all_categories_{version}.json" if version > 1 else "all_categories.json"
        filepath = PRODUCTS_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.all_products, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved all categories to {filepath}")

    def save_scraping_summary(self):
        """Save scraping summary to log file"""
        summary_file = LOG_DIR / f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(self.scraping_stats, f, ensure_ascii=False, indent=2)

        logger.info(f"Saved scraping summary to {summary_file}")

    async def scrape_all_categories(self):
        """Scrape all configured categories"""
        self.scraping_stats["start_time"] = datetime.now().isoformat()
        start_time = time.time()

        logger.info(f"Starting scraping of {len(CATEGORIES)} categories with {self.num_workers} workers")

        # Process categories sequentially to be respectful to the server
        # Could be parallelized with semaphore for controlled concurrency
        for category_name, category_url in CATEGORIES.items():
            try:
                category_data = await self.scrape_category(category_name, category_url)

                # Validate data
                is_valid = self.validate_category_data(category_data)

                if is_valid:
                    # Save individual category file
                    self.save_category_data(category_data)
                    self.all_products[category_name] = category_data
                    self.scraping_stats["categories_scraped"] += 1
                    self.scraping_stats["total_products"] += category_data["total_products"]
                else:
                    logger.warning(f"Category {category_name} data validation failed - not saving")
                    self.scraping_stats["errors"].append(f"Validation failed for {category_name}")

            except Exception as e:
                error_msg = f"Error scraping category {category_name}: {e}"
                logger.error(error_msg)
                self.scraping_stats["errors"].append(error_msg)

        # Save combined file
        if self.all_products:
            self.save_all_categories()

        # Update stats
        end_time = time.time()
        self.scraping_stats["end_time"] = datetime.now().isoformat()
        self.scraping_stats["total_duration"] = end_time - start_time

        # Save summary
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
    scraper = ProductScraper(num_workers=NUM_WORKERS)
    await scraper.scrape_all_categories()


if __name__ == "__main__":
    asyncio.run(main())
