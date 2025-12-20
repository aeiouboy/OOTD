"""
Data Validation Engine for Product Scraping
Validates scraped product data against quality criteria
"""
import re
import asyncio
import aiohttp
from typing import Dict, List, Set, Tuple
from urllib.parse import urlparse
import logging

from config import (
    MIN_PRICE, MAX_PRICE, REQUIRED_FIELDS,
    VALIDATION_PASS_THRESHOLD
)

logger = logging.getLogger(__name__)


class DataValidator:
    """Validates scraped product data"""

    def __init__(self):
        """Initialize validator"""
        self.validation_results = {
            "total_products": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def _validate_sku(self, product: Dict) -> Tuple[bool, str]:
        """
        Validate SKU field

        Args:
            product: Product dictionary

        Returns:
            Tuple of (is_valid, error_message)
        """
        sku = product.get('sku', '')

        if not sku:
            return False, "SKU is missing or empty"

        if not isinstance(sku, str):
            return False, "SKU must be a string"

        if len(sku) < 3:
            return False, "SKU is too short"

        return True, ""

    def _validate_required_fields(self, product: Dict) -> Tuple[bool, str]:
        """
        Validate all required fields are present

        Args:
            product: Product dictionary

        Returns:
            Tuple of (is_valid, error_message)
        """
        missing_fields = []

        for field in REQUIRED_FIELDS:
            if field not in product or not product[field]:
                missing_fields.append(field)

        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"

        # Check brand and product_name are not default values
        if product.get('brand') == 'Unknown':
            return False, "Brand is 'Unknown' - data extraction may have failed"

        if product.get('product_name') == 'Unknown Product':
            return False, "Product name is 'Unknown Product' - data extraction may have failed"

        return True, ""

    def _validate_prices(self, product: Dict) -> Tuple[bool, str]:
        """
        Validate price fields

        Args:
            product: Product dictionary

        Returns:
            Tuple of (is_valid, error_message)
        """
        unit_price = product.get('unit_price')
        original_price = product.get('original_price')

        # At least one price must exist
        if unit_price is None and original_price is None:
            return False, "No price information available"

        # Validate unit_price if present
        if unit_price is not None:
            if not isinstance(unit_price, (int, float)):
                return False, "Unit price must be numeric"

            if unit_price < MIN_PRICE or unit_price > MAX_PRICE:
                return False, f"Unit price {unit_price} is out of range ({MIN_PRICE}-{MAX_PRICE})"

        # Validate original_price if present
        if original_price is not None:
            if not isinstance(original_price, (int, float)):
                return False, "Original price must be numeric"

            if original_price < MIN_PRICE or original_price > MAX_PRICE:
                return False, f"Original price {original_price} is out of range ({MIN_PRICE}-{MAX_PRICE})"

        # If both present, unit_price should be <= original_price
        if unit_price is not None and original_price is not None:
            if unit_price > original_price:
                return False, f"Unit price ({unit_price}) is greater than original price ({original_price})"

        return True, ""

    def _validate_url(self, product: Dict) -> Tuple[bool, str]:
        """
        Validate product URL

        Args:
            product: Product dictionary

        Returns:
            Tuple of (is_valid, error_message)
        """
        url = product.get('product_url', '')

        if not url:
            return False, "Product URL is missing"

        # Check if valid URL format
        try:
            result = urlparse(url)
            if not all([result.scheme, result.netloc]):
                return False, "Invalid URL format"
        except Exception:
            return False, "Invalid URL format"

        # Check if central.co.th domain
        if 'central.co.th' not in url:
            return False, "URL is not from central.co.th domain"

        return True, ""

    async def _validate_image_url(self, image_url: str, session: aiohttp.ClientSession) -> bool:
        """
        Validate image URL is accessible

        Args:
            image_url: Image URL to validate
            session: aiohttp session

        Returns:
            True if accessible, False otherwise
        """
        try:
            async with session.head(image_url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                return response.status == 200
        except Exception:
            return False

    async def _validate_image_urls(self, product: Dict) -> Tuple[bool, str]:
        """
        Validate image URLs

        Args:
            product: Product dictionary

        Returns:
            Tuple of (is_valid, error_message)
        """
        image_urls = product.get('image_urls', [])

        if not image_urls:
            # Images are optional, so this is just a warning
            return True, ""

        if not isinstance(image_urls, list):
            return False, "Image URLs must be a list"

        # Check at least one image URL
        async with aiohttp.ClientSession() as session:
            tasks = [self._validate_image_url(url, session) for url in image_urls[:3]]  # Check first 3
            results = await asyncio.gather(*tasks)

            if not any(results):
                return False, "No valid/accessible image URLs found"

        return True, ""

    def _check_duplicate_sku(self, sku: str, seen_skus: Set[str]) -> Tuple[bool, str]:
        """
        Check if SKU is duplicate

        Args:
            sku: SKU to check
            seen_skus: Set of already seen SKUs

        Returns:
            Tuple of (is_duplicate, error_message)
        """
        if sku in seen_skus:
            return True, f"Duplicate SKU: {sku}"

        return False, ""

    async def validate_product(self, product: Dict, seen_skus: Set[str],
                              check_images: bool = False) -> Tuple[bool, List[str]]:
        """
        Validate a single product

        Args:
            product: Product dictionary to validate
            seen_skus: Set of SKUs already seen (for duplicate detection)
            check_images: Whether to check image URL accessibility

        Returns:
            Tuple of (is_valid, list of error messages)
        """
        errors = []

        # Skip products with error field (already marked as failed)
        if 'error' in product:
            return False, [f"Product scraping failed: {product.get('error')}"]

        # Validate SKU
        is_valid, error = self._validate_sku(product)
        if not is_valid:
            errors.append(error)
        else:
            # Check for duplicates
            sku = product.get('sku')
            is_dup, error = self._check_duplicate_sku(sku, seen_skus)
            if is_dup:
                errors.append(error)
            else:
                seen_skus.add(sku)

        # Validate required fields
        is_valid, error = self._validate_required_fields(product)
        if not is_valid:
            errors.append(error)

        # Validate prices
        is_valid, error = self._validate_prices(product)
        if not is_valid:
            errors.append(error)

        # Validate URL
        is_valid, error = self._validate_url(product)
        if not is_valid:
            errors.append(error)

        # Validate image URLs (optional, can be slow)
        if check_images:
            is_valid, error = await self._validate_image_urls(product)
            if not is_valid:
                errors.append(error)

        return len(errors) == 0, errors

    async def validate_category(self, category_data: Dict,
                               check_images: bool = False) -> Dict:
        """
        Validate all products in a category

        Args:
            category_data: Category data dictionary with products list
            check_images: Whether to check image URL accessibility

        Returns:
            Validation report dictionary
        """
        products = category_data.get('products', [])
        category_name = category_data.get('category_name', 'Unknown')

        logger.info(f"Validating category '{category_name}' with {len(products)} products...")

        seen_skus = set()
        validation_results = {
            "category_name": category_name,
            "total_products": len(products),
            "passed": 0,
            "failed": 0,
            "pass_rate": 0.0,
            "duplicate_skus": 0,
            "product_errors": []
        }

        for i, product in enumerate(products):
            is_valid, errors = await self.validate_product(product, seen_skus, check_images)

            if is_valid:
                validation_results["passed"] += 1
            else:
                validation_results["failed"] += 1
                validation_results["product_errors"].append({
                    "product_index": i,
                    "sku": product.get('sku', 'unknown'),
                    "url": product.get('product_url', 'unknown'),
                    "errors": errors
                })

                # Count duplicates
                if any('Duplicate SKU' in err for err in errors):
                    validation_results["duplicate_skus"] += 1

        # Calculate pass rate
        if validation_results["total_products"] > 0:
            validation_results["pass_rate"] = validation_results["passed"] / validation_results["total_products"]

        logger.info(f"Validation complete for '{category_name}':")
        logger.info(f"  Passed: {validation_results['passed']}/{validation_results['total_products']}")
        logger.info(f"  Pass rate: {validation_results['pass_rate']:.2%}")
        logger.info(f"  Duplicates: {validation_results['duplicate_skus']}")

        return validation_results

    def meets_quality_threshold(self, validation_report: Dict) -> bool:
        """
        Check if validation results meet quality threshold

        Args:
            validation_report: Validation report from validate_category

        Returns:
            True if meets threshold, False otherwise
        """
        pass_rate = validation_report.get('pass_rate', 0.0)
        meets_threshold = pass_rate >= VALIDATION_PASS_THRESHOLD

        if not meets_threshold:
            logger.warning(
                f"Category '{validation_report.get('category_name')}' "
                f"does not meet quality threshold: {pass_rate:.2%} < {VALIDATION_PASS_THRESHOLD:.2%}"
            )

        return meets_threshold

    def get_summary(self) -> Dict:
        """Get validation summary across all validations"""
        return self.validation_results
