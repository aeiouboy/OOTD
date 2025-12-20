"""
Hybrid Scraper Worker Implementation
Uses Crawl4AI for category listing (fast) and Playwright for product details (reliable)
"""
import asyncio
import re
import random
from datetime import datetime
from typing import List, Dict, Set, Optional
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from playwright.async_api import async_playwright, Page, Browser
import logging

from config import (
    REQUEST_TIMEOUT, PAGE_LOAD_WAIT, SCROLL_WAIT, MAX_SCROLLS,
    USER_AGENTS, REQUEST_DELAY_MIN, REQUEST_DELAY_MAX
)

logger = logging.getLogger(__name__)


class HybridScraperWorker:
    """Hybrid worker: Crawl4AI for categories, Playwright for products"""

    def __init__(self, worker_id: int):
        """
        Initialize hybrid scraper worker

        Args:
            worker_id: Unique identifier for this worker
        """
        self.worker_id = worker_id
        self.products_scraped = 0
        self.start_time = None
        self.end_time = None
        self.errors = []
        self.playwright_browser: Optional[Browser] = None
        self.playwright = None

    def _get_random_user_agent(self) -> str:
        """Get random user agent for anti-scraping"""
        return random.choice(USER_AGENTS)

    def _extract_sku_from_url(self, url: str) -> str:
        """
        Extract SKU from product URL

        Args:
            url: Product URL

        Returns:
            SKU identifier
        """
        # Pattern: /th/product-name-grmkppr000190452
        match = re.search(r'gr([a-z0-9]+)$', url.lower())
        if match:
            return f"gr{match.group(1)}"
        return url.split('/')[-1] if '/' in url else url

    def _is_product_url(self, href: str) -> bool:
        """
        Check if URL is a product page

        Args:
            href: URL to check

        Returns:
            True if product URL, False otherwise
        """
        if not href:
            return False

        # Product URLs contain pattern: /th/product-name-grXXXXXXXXX
        if not re.search(r'-gr[a-z0-9]+$', href.lower()):
            return False

        # Skip category, brand, campaign pages
        exclude_patterns = ['category', 'brand', 'shopbybrand', 'campaign', 'store', 'search', '/th/men$', '/th/women$']
        if any(pattern in href.lower() for pattern in exclude_patterns):
            return False

        return True

    async def _extract_product_links(self, html: str, base_url: str) -> Set[str]:
        """
        Extract all product links from HTML

        Args:
            html: Page HTML content
            base_url: Base URL for relative links

        Returns:
            Set of product URLs
        """
        soup = BeautifulSoup(html, 'lxml')
        product_urls = set()

        for link in soup.find_all('a', href=True):
            href = link['href']

            if self._is_product_url(href):
                # Make absolute URL
                if href.startswith('http'):
                    full_url = href
                elif href.startswith('/'):
                    full_url = f"https://www.central.co.th{href}"
                else:
                    full_url = f"{base_url}/{href}"

                product_urls.add(full_url)

        return product_urls

    async def _scroll_page(self, crawler, url: str, initial_html: str) -> str:
        """
        Scroll page to load more products (infinite scroll handling)

        Args:
            crawler: AsyncWebCrawler instance
            url: Page URL
            initial_html: Initial HTML content

        Returns:
            Final HTML after scrolling
        """
        logger.info(f"Worker {self.worker_id}: Handling infinite scroll...")

        # Use JavaScript execution to scroll
        js_code = """
        async () => {
            let previousHeight = document.body.scrollHeight;
            let scrollAttempts = 0;
            const maxScrolls = %d;

            while (scrollAttempts < maxScrolls) {
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(resolve => setTimeout(resolve, %d));

                let newHeight = document.body.scrollHeight;
                if (newHeight === previousHeight) {
                    break;
                }
                previousHeight = newHeight;
                scrollAttempts++;
            }

            return document.documentElement.outerHTML;
        }
        """ % (MAX_SCROLLS, SCROLL_WAIT * 1000)

        config = CrawlerRunConfig(
            js_code=js_code,
            wait_for_images=False,
            page_timeout=REQUEST_TIMEOUT * 1000
        )

        result = await crawler.arun(url=url, config=config)

        if result.success and result.html:
            return result.html
        else:
            logger.warning(f"Worker {self.worker_id}: Scroll failed, using initial HTML")
            return initial_html

    async def _init_playwright(self):
        """Initialize Playwright browser"""
        if self.playwright is None:
            self.playwright = await async_playwright().start()
            self.playwright_browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--disable-blink-features=AutomationControlled']
            )
            logger.info(f"Worker {self.worker_id}: Playwright browser initialized")

    async def _close_playwright(self):
        """Close Playwright browser"""
        if self.playwright_browser:
            await self.playwright_browser.close()
            logger.info(f"Worker {self.worker_id}: Playwright browser closed")
        if self.playwright:
            await self.playwright.stop()

    async def _extract_product_details_playwright(self, product_url: str) -> Dict:
        """
        Extract detailed product information using Playwright (reliable)

        Args:
            product_url: Product page URL

        Returns:
            Product details dictionary
        """
        try:
            # Add random delay for anti-scraping
            await asyncio.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))

            # Ensure Playwright is initialized
            await self._init_playwright()

            # Create new page with random user agent
            context = await self.playwright_browser.new_context(
                user_agent=self._get_random_user_agent()
            )
            page = await context.new_page()

            # Navigate to product page (use 'load' instead of 'networkidle' for faster loading)
            await page.goto(product_url, wait_until='load', timeout=REQUEST_TIMEOUT * 1000)

            # Wait for content to load
            await page.wait_for_timeout(3000)  # Wait 3 seconds for JS to execute

            # Wait for price elements to appear
            try:
                await page.wait_for_selector('h1', timeout=5000)
            except:
                pass  # Continue even if selector doesn't appear

            # Extract data using JavaScript
            product_data = await page.evaluate('''() => {
                // Extract brand from h1 > a
                const h1 = document.querySelector('h1');
                const brandLink = h1 ? h1.querySelector('a') : null;
                const brand = brandLink ? brandLink.textContent.trim() : 'Unknown';

                // Extract full product name from h1
                const fullProductName = h1 ? h1.textContent.trim() : 'Unknown';
                const productName = brand !== 'Unknown' ? fullProductName.replace(brand, '').trim() : fullProductName;

                // Extract prices - look for divs with price pattern
                const allDivs = Array.from(document.querySelectorAll('div'));
                const pricePattern = /^฿[\\d,]+(?:\\.\\d+)?$/;
                const priceDivs = allDivs.filter(div => {
                    const text = div.textContent.trim();
                    return pricePattern.test(text) && div.children.length === 0;
                });

                const prices = priceDivs.map(div => {
                    const text = div.textContent.trim();
                    const match = text.match(/฿([\\d,]+(?:\\.\\d+)?)/);
                    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
                }).filter(p => p !== null);

                // Extract images
                const images = Array.from(document.querySelectorAll('img'))
                    .filter(img => {
                        const alt = img.getAttribute('alt') || '';
                        const src = img.getAttribute('src') || '';
                        return src.includes('http') && alt.length > 10 && !alt.includes('Icon') && !alt.includes('social');
                    })
                    .map(img => img.src)
                    .slice(0, 8);

                // Extract description from text nodes
                const mainContent = document.querySelector('main');
                const textNodes = mainContent ? Array.from(mainContent.querySelectorAll('text')) : [];
                const descriptions = textNodes
                    .map(node => node.textContent.trim())
                    .filter(text => {
                        return text.length > 30 &&
                               text.length < 500 &&
                               !text.includes('Copyright') &&
                               !text.includes('©') &&
                               !text.includes('คะแนน') &&
                               /[ก-ฮ]/.test(text);
                    })
                    .slice(0, 3);

                // Extract sizes
                const sizes = [];
                allDivs.forEach(div => {
                    const text = div.textContent.trim();
                    // Match size patterns: numbers, UK sizes, or standard sizes
                    if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|\\d{1,2}|\\d{1,2}\\.5)$/.test(text) ||
                        /^[\\d\\.\\-\\s]+UK$/.test(text)) {
                        if (!sizes.includes(text) && sizes.length < 10) {
                            sizes.push(text);
                        }
                    }
                });

                return {
                    brand,
                    productName,
                    prices,
                    unitPrice: prices[0] || null,
                    originalPrice: prices[1] || prices[0] || null,
                    images,
                    description: descriptions.join(' ').substring(0, 500),
                    sizes
                };
            }''')

            # Close page and context
            await page.close()
            await context.close()

            # Extract SKU
            sku = self._extract_sku_from_url(product_url)

            # Create variants from sizes
            variants = []
            for size in product_data['sizes']:
                variants.append({
                    "size": size,
                    "color": None,
                    "availability": True
                })

            return {
                "sku": sku,
                "brand": product_data['brand'],
                "product_name": product_data['productName'],
                "unit_price": product_data['unitPrice'],
                "original_price": product_data['originalPrice'],
                "product_url": product_url,
                "image_urls": product_data['images'],
                "description": product_data['description'],
                "variants": variants,
                "scraped_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Worker {self.worker_id}: Error scraping product {product_url}: {e}")
            self.errors.append({
                "url": product_url,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            return {
                "sku": self._extract_sku_from_url(product_url),
                "product_url": product_url,
                "error": str(e)
            }

    async def scrape_category(self, category_name: str, category_url: str,
                             scrape_details: bool = True) -> Dict:
        """
        Scrape all products from a category (hybrid approach)

        Args:
            category_name: Name of the category
            category_url: Category page URL
            scrape_details: If True, visit each product page for details

        Returns:
            Dictionary with category data and products
        """
        self.start_time = datetime.utcnow()
        logger.info(f"Worker {self.worker_id}: Starting category '{category_name}' (Hybrid Mode)")
        logger.info(f"Worker {self.worker_id}: URL: {category_url}")

        all_product_urls = set()

        # Use Crawl4AI for fast category listing
        browser_config = BrowserConfig(
            headless=True,
            user_agent=self._get_random_user_agent()
        )

        crawl_config = CrawlerRunConfig(
            page_timeout=REQUEST_TIMEOUT * 1000,
            wait_for_images=False
        )

        async with AsyncWebCrawler(config=browser_config, verbose=False) as crawler:
            try:
                # Fetch initial category page
                logger.info(f"Worker {self.worker_id}: Fetching category page with Crawl4AI...")
                result = await crawler.arun(url=category_url, config=crawl_config)

                if not result.success:
                    raise Exception(f"Failed to fetch category page: {result.error_message}")

                # Extract initial product links
                product_links = await self._extract_product_links(result.html, category_url)
                logger.info(f"Worker {self.worker_id}: Found {len(product_links)} products initially")
                all_product_urls.update(product_links)

                # Handle infinite scroll
                await asyncio.sleep(PAGE_LOAD_WAIT)
                scrolled_html = await self._scroll_page(crawler, category_url, result.html)

                # Extract products after scrolling
                product_links = await self._extract_product_links(scrolled_html, category_url)
                all_product_urls.update(product_links)

                logger.info(f"Worker {self.worker_id}: Total unique products found: {len(all_product_urls)}")

            except Exception as e:
                logger.error(f"Worker {self.worker_id}: Category listing failed: {e}")
                self.errors.append({
                    "category": category_name,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })

        # Scrape detailed product information using Playwright
        products = []
        if scrape_details and all_product_urls:
            logger.info(f"Worker {self.worker_id}: Scraping product details with Playwright...")

            for i, url in enumerate(all_product_urls, 1):
                if i % 5 == 0:
                    logger.info(f"Worker {self.worker_id}: Progress: {i}/{len(all_product_urls)}")

                product = await self._extract_product_details_playwright(url)
                products.append(product)
                self.products_scraped += 1
        else:
            # Just save URLs and SKUs
            products = [
                {
                    "sku": self._extract_sku_from_url(url),
                    "product_url": url
                }
                for url in all_product_urls
            ]
            self.products_scraped = len(products)

        # Close Playwright browser
        await self._close_playwright()

        self.end_time = datetime.utcnow()
        duration = (self.end_time - self.start_time).total_seconds()

        logger.info(f"Worker {self.worker_id}: Completed '{category_name}' - {len(products)} products in {duration:.2f}s")

        return {
            "category_name": category_name,
            "category_url": category_url,
            "total_products": len(products),
            "scraped_at": self.end_time.isoformat(),
            "scraping_duration_seconds": duration,
            "worker_id": self.worker_id,
            "products": products
        }

    def get_stats(self) -> Dict:
        """Get worker statistics"""
        duration = 0
        if self.start_time and self.end_time:
            duration = (self.end_time - self.start_time).total_seconds()

        return {
            "worker_id": self.worker_id,
            "products_scraped": self.products_scraped,
            "duration_seconds": duration,
            "errors_count": len(self.errors),
            "errors": self.errors
        }
