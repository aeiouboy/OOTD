"""
Quick test of hybrid scraper - scrape just 3 products to verify
"""
import asyncio
import json
import sys
from scraper_worker_hybrid import HybridScraperWorker

async def main():
    worker = HybridScraperWorker(worker_id=1)

    # Test with women's clothing
    result = await worker.scrape_category(
        category_name="women_test",
        category_url="https://www.central.co.th/th/women/clothing",
        scrape_details=True
    )

    # Only keep first 3 products for testing
    if len(result['products']) > 3:
        result['products'] = result['products'][:3]
        result['total_products'] = 3

    print(f"\n=== TEST RESULTS ===")
    print(f"Products scraped: {len(result['products'])}")
    print(f"Duration: {result['scraping_duration_seconds']:.2f}s")
    print(f"\nSample products:")

    for i, product in enumerate(result['products'], 1):
        print(f"\n{i}. SKU: {product.get('sku')}")
        print(f"   Brand: {product.get('brand')}")
        print(f"   Name: {product.get('product_name', '')[:60]}")
        print(f"   Unit Price: ฿{product.get('unit_price')}")
        print(f"   Original Price: ฿{product.get('original_price')}")
        print(f"   Images: {len(product.get('image_urls', []))}")
        print(f"   Variants: {len(product.get('variants', []))}")

        # Check if product has all required fields
        has_data = (
            product.get('brand') not in [None, 'Unknown'] and
            product.get('unit_price') is not None
        )
        print(f"   Status: {'✅ PASS' if has_data else '❌ FAIL'}")

    # Save results
    with open('../products/hybrid_test_output.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Results saved to: ../products/hybrid_test_output.json")

if __name__ == "__main__":
    asyncio.run(main())
