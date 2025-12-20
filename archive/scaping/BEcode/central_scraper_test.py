"""
Central Thailand Product Scraper - Test Version
Tests scraping functionality on a single page
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup
import logging

# Configure paths
BASE_DIR = Path(__file__).parent.parent
TEST_OUTPUT = BASE_DIR / "products" / "test_output.json"

# Ensure directory exists
TEST_OUTPUT.parent.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Test URL - Men's section
TEST_URL = "https://www.central.co.th/th/men"


async def test_scrape():
    """Test scraping a single page"""
    logger.info(f"Testing scraper on: {TEST_URL}")

    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        page_timeout=30000,
        wait_for_timeout=10000,
        delay_before_return_html=3.0  # Wait 3 seconds for content to load
    )

    async with AsyncWebCrawler(verbose=True) as crawler:
        logger.info("Fetching page...")
        result = await crawler.arun(url=TEST_URL, config=config)

        if result.success:
            logger.info("Page fetched successfully!")
            logger.info(f"HTML length: {len(result.html)} characters")

            # Save raw HTML for inspection
            html_file = BASE_DIR / "products" / "test_page.html"
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(result.html)
            logger.info(f"Saved HTML to: {html_file}")

            # Parse with BeautifulSoup
            soup = BeautifulSoup(result.html, 'html.parser')

            # Find all links
            all_links = soup.find_all('a', href=True)
            product_links = [
                link for link in all_links
                if '/th/' in link['href'] and 'product' in link['href'].lower()
            ]

            logger.info(f"Found {len(all_links)} total links")
            logger.info(f"Found {len(product_links)} potential product links")

            # Sample some product links
            sample_links = product_links[:10]
            logger.info("\nSample product links:")
            for i, link in enumerate(sample_links, 1):
                url = link['href']
                if not url.startswith('http'):
                    url = f"https://www.central.co.th{url}"
                logger.info(f"{i}. {url}")

            # Try to find product containers
            logger.info("\nSearching for product containers...")

            # Try various common selectors
            selectors = [
                {'tag': 'div', 'pattern': r'product'},
                {'tag': 'article', 'pattern': r'product'},
                {'tag': 'div', 'pattern': r'item'},
                {'tag': 'div', 'pattern': r'card'},
            ]

            import re
            for selector in selectors:
                elements = soup.find_all(selector['tag'], class_=re.compile(selector['pattern'], re.I))
                if elements:
                    logger.info(f"Found {len(elements)} elements: <{selector['tag']}> with class containing '{selector['pattern']}'")

                    # Inspect first element
                    if elements:
                        first_elem = elements[0]
                        logger.info(f"First element classes: {first_elem.get('class', [])}")
                        logger.info(f"First element HTML (first 500 chars):\n{str(first_elem)[:500]}")

            # Save test results
            test_results = {
                "url": TEST_URL,
                "timestamp": datetime.now().isoformat(),
                "total_links": len(all_links),
                "product_links": len(product_links),
                "sample_links": [link['href'] for link in sample_links],
                "html_length": len(result.html)
            }

            with open(TEST_OUTPUT, 'w', encoding='utf-8') as f:
                json.dump(test_results, f, ensure_ascii=False, indent=2)

            logger.info(f"\nTest results saved to: {TEST_OUTPUT}")
            logger.info(f"HTML saved to: {html_file}")
            logger.info("\nPlease inspect the HTML file to identify correct selectors for products")

        else:
            logger.error(f"Failed to fetch page: {result.error_message}")


if __name__ == "__main__":
    asyncio.run(test_scrape())
