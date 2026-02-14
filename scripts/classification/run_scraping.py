#!/usr/bin/env python3
"""
Run the full Firecrawl MCP scraping workflow.

This script is designed to be executed within Claude Code with MCP tool access.
It processes all products and calls Firecrawl MCP for each one.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# Import the parser
import sys
sys.path.insert(0, str(Path(__file__).parent))
from markdown_parser import parse_product_page_markdown


def load_products(filepath: str) -> tuple:
    """Load products from JSON."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    products = data.get('products', [])
    metadata = {k: v for k, v in data.items() if k != 'products'}
    return products, metadata


def parse_scraped_content(markdown: str, product_name: str, url: str) -> Dict:
    """Parse markdown and return structured data."""
    try:
        parsed = parse_product_page_markdown(markdown)
        return {
            'scraping_status': 'success',
            'scraping_timestamp': datetime.now().isoformat(),
            'url': url,
            'product_name': product_name,
            **parsed
        }
    except Exception as e:
        return {
            'scraping_status': 'parse_failed',
            'scraping_timestamp': datetime.now().isoformat(),
            'url': url,
            'product_name': product_name,
            'error': str(e)
        }


def create_product_id(product: Dict, index: int) -> str:
    """Create a unique product ID."""
    # Use product name + index as ID
    name = product.get('product_name', f'product_{index}')
    return f"{name.replace(' ', '_')}_{index}"


def merge_scraped_data(products: List[Dict], scraped_data: List[Dict]) -> List[Dict]:
    """Merge scraped data back into products."""
    # Create index-based mapping
    scraped_map = {i: scraped_data[i] for i in range(len(scraped_data))}

    enriched = []
    for i, product in enumerate(products):
        enriched_product = {**product}

        if i in scraped_map:
            scraped = scraped_map[i]

            # Add scraped attributes
            for key in ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']:
                if key in scraped and scraped[key]:
                    enriched_product[key] = scraped[key]

            # Add metadata
            enriched_product['scraping_metadata'] = {
                'status': scraped.get('scraping_status', 'not_scraped'),
                'timestamp': scraped.get('scraping_timestamp', '')
            }
            if 'error' in scraped:
                enriched_product['scraping_metadata']['error'] = scraped['error']
        else:
            enriched_product['scraping_metadata'] = {
                'status': 'not_scraped',
                'timestamp': ''
            }

        enriched.append(enriched_product)

    return enriched


def save_results(filepath: str, products: List[Dict], metadata: Dict):
    """Save enriched products to file."""
    output_data = {
        **metadata,
        'products': products,
        'scraping_metadata': {
            'total_products': len(products),
            'scraping_timestamp': datetime.now().isoformat(),
            'scraper_version': '1.0'
        }
    }

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)


def save_checkpoint(filepath: Path, scraped_data: List[Dict], next_index: int):
    """Save checkpoint."""
    checkpoint = {
        'next_index': next_index,
        'scraped_data': scraped_data,
        'timestamp': datetime.now().isoformat()
    }
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(checkpoint, f, indent=2, ensure_ascii=False)


def load_checkpoint(filepath: Path) -> tuple:
    """Load checkpoint if exists."""
    if filepath.exists():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('scraped_data', []), data.get('next_index', 0)
        except Exception:
            pass
    return [], 0


def generate_report(scraped_data: List[Dict], total_products: int) -> str:
    """Generate scraping report."""
    lines = [
        "=" * 70,
        "FIRECRAWL MCP SCRAPING REPORT",
        "=" * 70,
        f"Total Products: {total_products}",
        f"Scraped Products: {len(scraped_data)}",
        ""
    ]

    # Count by status
    status_counts = {}
    for item in scraped_data:
        status = item.get('scraping_status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    lines.append("Status Breakdown:")
    for status, count in sorted(status_counts.items()):
        pct = (count / len(scraped_data) * 100) if scraped_data else 0
        lines.append(f"  {status}: {count} ({pct:.1f}%)")

    # Count attribute coverage
    successful = [s for s in scraped_data if s.get('scraping_status') == 'success']
    if successful:
        lines.extend(["", "Attribute Coverage (for successful scrapes):"])

        attributes = {
            'subcategory': 80, 'material': 70, 'fit': 60, 'care': 50,
            'color_from_page': 90, 'sleeve_type': 80, 'length_type': 75
        }

        for attr, target in attributes.items():
            count = sum(1 for s in successful if s.get(attr))
            pct = (count / len(successful) * 100)
            status_mark = '✓' if pct >= target else '✗'
            lines.append(f"  {status_mark} {attr}: {count}/{len(successful)} ({pct:.1f}%) [target: {target}%]")

    # List failures
    failures = [s for s in scraped_data if s.get('scraping_status') in ['failed', 'parse_failed']]
    if failures:
        lines.extend(["", f"Failed Products ({len(failures)}):"])
        for item in failures[:10]:
            lines.append(f"  - {item.get('product_name', 'unknown')} ({item.get('error', 'unknown error')})")
        if len(failures) > 10:
            lines.append(f"  ... and {len(failures) - 10} more")

    lines.append("=" * 70)
    return "\n".join(lines)


# Export for use by Claude Code
__all__ = [
    'load_products',
    'parse_scraped_content',
    'create_product_id',
    'merge_scraped_data',
    'save_results',
    'save_checkpoint',
    'load_checkpoint',
    'generate_report'
]
