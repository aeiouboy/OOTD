"""
Simple test script to verify Crawl4AI functionality
"""
import asyncio
from crawl4ai import AsyncWebCrawler

async def test_crawl4ai():
    """Test basic Crawl4AI functionality"""
    print("Testing Crawl4AI with a simple URL...")

    async with AsyncWebCrawler(verbose=True) as crawler:
        # Test with a simple product page
        test_url = "https://www.central.co.th/th/women"

        print(f"Fetching: {test_url}")
        result = await crawler.arun(url=test_url)

        print(f"\nSuccess: {result.success}")
        print(f"Status Code: {result.status_code}")
        print(f"HTML Length: {len(result.html) if result.html else 0} characters")
        print(f"Links Found: {len(result.links) if hasattr(result, 'links') and result.links else 0}")

        if result.success:
            print("\n✓ Crawl4AI is working correctly!")
            return True
        else:
            print(f"\n✗ Crawl4AI failed: {result.error_message if hasattr(result, 'error_message') else 'Unknown error'}")
            return False

if __name__ == "__main__":
    success = asyncio.run(test_crawl4ai())
    exit(0 if success else 1)
