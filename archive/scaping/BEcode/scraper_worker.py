"""
Scraper Worker Implementation using Crawl4AI
Individual worker for scraping Central Group product categories
"""
import asyncio
import re
import random
from datetime import datetime
from typing import List, Dict, Set, Optional
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
import logging

from config import (
    REQUEST_TIMEOUT, PAGE_LOAD_WAIT, SCROLL_WAIT, MAX_SCROLLS,
    USER_AGENTS, REQUEST_DELAY_MIN, REQUEST_DELAY_MAX
)

logger = logging.getLogger(__name__)


class ScraperWorker:
    """Worker class for scraping a single category using Crawl4AI"""

    def __init__(self, worker_id: int):
        """
        Initialize scraper worker

        Args:
            worker_id: Unique identifier for this worker
        """
        self.worker_id = worker_id
        self.products_scraped = 0
        self.start_time = None
        self.end_time = None
        self.errors = []

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

    async def _extract_product_details(self, crawler, product_url: str) -> Dict:
        """
        Extract detailed product information from product page

        Args:
            crawler: AsyncWebCrawler instance
            product_url: Product page URL

        Returns:
            Product details dictionary
        """
        try:
            # Add random delay for anti-scraping
            await asyncio.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))

            # Add JavaScript to wait for product details to load
            js_wait_code = """
            async () => {
                // Wait for price elements to appear
                let attempts = 0;
                while (attempts < 10) {
                    const priceElements = document.querySelectorAll('div');
                    const hasPrices = Array.from(priceElements).some(div =>
                        /^฿[\d,]+(?:\.\d+)?$/.test(div.textContent.trim())
                    );
                    if (hasPrices) break;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                // Additional wait for other dynamic content
                await new Promise(resolve => setTimeout(resolve, 2000));
                return document.documentElement.outerHTML;
            }
            """

            config = CrawlerRunConfig(
                page_timeout=REQUEST_TIMEOUT * 1000,
                wait_for_images=False,
                js_code=js_wait_code
            )

            result = await crawler.arun(url=product_url, config=config)

            if not result.success:
                raise Exception(f"Failed to fetch product page: {result.error_message}")

            soup = BeautifulSoup(result.html, 'lxml')
            sku = self._extract_sku_from_url(product_url)

            # Extract brand from h1 > a
            brand = "Unknown"
            h1_tag = soup.find('h1')
            if h1_tag:
                brand_link = h1_tag.find('a')
                if brand_link:
                    brand = brand_link.get_text(strip=True)

            # Extract product name (h1 text minus brand)
            name = "Unknown Product"
            if h1_tag:
                full_name = h1_tag.get_text(strip=True)
                if brand != "Unknown":
                    name = full_name.replace(brand, '').strip()
                else:
                    name = full_name

            # Extract prices - find divs that contain ONLY price text (฿X,XXX.X)
            unit_price = None
            original_price = None
            all_divs = soup.find_all('div')
            price_divs = [div for div in all_divs if re.match(r'^฿[\d,]+(?:\.\d+)?$', div.get_text(strip=True))]

            prices = []
            for div in price_divs:
                text = div.get_text(strip=True)
                match = re.search(r'฿([\d,]+(?:\.\d+)?)', text)
                if match:
                    try:
                        price_val = float(match.group(1).replace(',', ''))
                        prices.append(price_val)
                    except ValueError:
                        pass

            if len(prices) >= 2:
                unit_price = prices[0]  # First price is usually discounted
                original_price = prices[1]  # Second price is usually original
            elif len(prices) == 1:
                unit_price = prices[0]
                original_price = prices[0]

            # Extract images - look for product images
            image_urls = []
            img_tags = soup.find_all('img', alt=True)
            for img in img_tags:
                alt_text = img.get('alt', '')
                src = img.get('src', '')
                # Find images with product-related alt text and valid src
                if src and 'http' in src and (alt_text and len(alt_text) > 10):
                    image_urls.append(src)
                    if len(image_urls) >= 8:  # Limit to 8 images
                        break

            # Extract description from paragraphs
            description = ""
            paragraphs = soup.find_all('p')
            desc_parts = []
            for p in paragraphs:
                text = p.get_text(strip=True)
                # Get meaningful paragraphs (longer than 20 chars, not copyright)
                if text and len(text) > 20 and 'Copyright' not in text and '©' not in text:
                    desc_parts.append(text)
                if len(desc_parts) >= 3:  # Get first 3 meaningful paragraphs
                    break
            description = ' '.join(desc_parts)[:500]

            # Extract variants (sizes) - look for UK size patterns
            variants = []
            all_text_divs = soup.find_all('div')
            size_texts = []
            for div in all_text_divs:
                text = div.get_text(strip=True)
                # Match UK size patterns like "3 UK", "4.5 UK", "3-5 UK"
                if re.match(r'^[\d\.\-\s]+UK$', text):
                    size_texts.append(text)

            # Create variant list from sizes
            for size in size_texts[:10]:  # Limit to 10 sizes
                variants.append({
                    "size": size,
                    "color": None,
                    "availability": True
                })

            return {
                "sku": sku,
                "brand": brand,
                "product_name": name,
                "unit_price": unit_price,
                "original_price": original_price,
                "product_url": product_url,
                "image_urls": image_urls,
                "description": description,
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
        Scrape all products from a category

        Args:
            category_name: Name of the category
            category_url: Category page URL
            scrape_details: If True, visit each product page for details

        Returns:
            Dictionary with category data and products
        """
        self.start_time = datetime.utcnow()
        logger.info(f"Worker {self.worker_id}: Starting category '{category_name}'")
        logger.info(f"Worker {self.worker_id}: URL: {category_url}")

        all_product_urls = set()

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
                logger.info(f"Worker {self.worker_id}: Fetching category page...")
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

                # Scrape detailed product information
                products = []
                if scrape_details:
                    logger.info(f"Worker {self.worker_id}: Scraping product details...")
                    for i, url in enumerate(all_product_urls, 1):
                        if i % 10 == 0:
                            logger.info(f"Worker {self.worker_id}: Progress: {i}/{len(all_product_urls)}")

                        product = await self._extract_product_details(crawler, url)
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

            except Exception as e:
                logger.error(f"Worker {self.worker_id}: Category scraping failed: {e}")
                self.errors.append({
                    "category": category_name,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })
                products = []

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
