#!/usr/bin/env python3
"""Quick Firecrawl API scraper for Session 1"""
import os
import sys
import time
from datetime import datetime

os.environ['FIRECRAWL_API_KEY'] = 'fc-18b59533f9974201acded74b7cc0614d'

from firecrawl import FirecrawlApp
from incremental_scraper import load_products, load_progress, record_scraped_item
from markdown_parser import parse_product_page_markdown

print("="*60)
print("FIRECRAWL API SCRAPER - SESSION 1")
print("="*60)

# Initialize
app = FirecrawlApp(api_key=os.environ['FIRECRAWL_API_KEY'])
products = load_products()
progress = load_progress()
completed = set(progress.get('completed_indices', []))

start_idx = 7
end_idx = 249
total = end_idx - start_idx + 1
remaining = [i for i in range(start_idx, end_idx + 1) if i not in completed]

print(f"\nStatus:")
print(f"  Total products: {len(products)}")
print(f"  Session 1 range: {start_idx}-{end_idx} ({total} products)")
print(f"  Already completed: {len(completed)}")
print(f"  Remaining: {len(remaining)}")
print(f"\nEstimated time: ~{len(remaining) * 0.5:.0f} minutes")
print(f"Credits needed: {len(remaining)}")
print("\nStarting scraping...")
print("-"*60)

start_time = datetime.now()
success_count = 0
fail_count = 0

for idx in remaining:
    product = products[idx]
    url = product.get('link', '')
    name = product.get('product_name', 'Unknown')
    
    try:
        # Scrape
        result = app.scrape(url=url, formats=['markdown'])
        markdown = result.markdown
        
        # Parse
        attrs = parse_product_page_markdown(markdown)
        
        # Save
        record_scraped_item(idx, product, attrs, success=True)
        success_count += 1
        
        # Progress
        if success_count % 10 == 0:
            elapsed = (datetime.now() - start_time).total_seconds()
            rate = success_count / elapsed if elapsed > 0 else 0
            remaining_time = (len(remaining) - success_count) / rate if rate > 0 else 0
            print(f"[{success_count}/{len(remaining)}] Progress: {success_count/len(remaining)*100:.1f}% | ETA: {remaining_time/60:.1f} min")
        
        # Rate limit
        time.sleep(0.1)
        
    except Exception as e:
        print(f"[{idx}] FAILED: {name[:50]} - {str(e)[:100]}")
        record_scraped_item(idx, product, {}, success=False)
        fail_count += 1

elapsed = (datetime.now() - start_time).total_seconds()
print("\n" + "="*60)
print("SCRAPING COMPLETE")
print("="*60)
print(f"Success: {success_count}")
print(f"Failed: {fail_count}")
print(f"Time: {elapsed/60:.1f} minutes")
print(f"Rate: {success_count/elapsed*60:.1f} products/minute")
print("="*60)
