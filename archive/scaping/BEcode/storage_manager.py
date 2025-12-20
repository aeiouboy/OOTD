"""
Storage Manager for Product Scraping System
Handles JSON file I/O with versioning and atomic writes
"""
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import logging

from config import (
    PRODUCTS_DIR, JSON_INDENT, OUTPUT_ENCODING,
    MASTER_OUTPUT_FILE
)

logger = logging.getLogger(__name__)


class StorageManager:
    """Manages storage of scraped product data"""

    def __init__(self):
        """Initialize storage manager"""
        self.products_dir = Path(PRODUCTS_DIR)
        self.products_dir.mkdir(parents=True, exist_ok=True)

    def _get_versioned_filename(self, base_filename: str) -> str:
        """
        Get filename with version number if file already exists

        Args:
            base_filename: Base filename (e.g., 'women.json')

        Returns:
            Versioned filename (e.g., 'women_1.json')
        """
        filepath = self.products_dir / base_filename

        if not filepath.exists():
            return base_filename

        # File exists, find next version number
        base_name = filepath.stem
        extension = filepath.suffix
        version = 1

        while True:
            versioned_name = f"{base_name}_{version}{extension}"
            versioned_path = self.products_dir / versioned_name

            if not versioned_path.exists():
                logger.info(f"File '{base_filename}' exists, using version: '{versioned_name}'")
                return versioned_name

            version += 1

    def _atomic_write(self, filepath: Path, data: Dict) -> bool:
        """
        Write JSON data atomically using temp file and rename

        Args:
            filepath: Destination file path
            data: Data to write

        Returns:
            True if successful, False otherwise
        """
        try:
            # Write to temporary file first
            with tempfile.NamedTemporaryFile(
                mode='w',
                encoding=OUTPUT_ENCODING,
                dir=self.products_dir,
                delete=False,
                suffix='.tmp'
            ) as tmp_file:
                json.dump(data, tmp_file, ensure_ascii=False, indent=JSON_INDENT)
                tmp_path = tmp_file.name

            # Atomic rename
            shutil.move(tmp_path, filepath)
            logger.info(f"Successfully saved: {filepath}")
            return True

        except Exception as e:
            logger.error(f"Failed to write {filepath}: {e}")
            # Clean up temp file if it exists
            try:
                Path(tmp_path).unlink(missing_ok=True)
            except:
                pass
            return False

    def save_category(self, category_data: Dict, use_versioning: bool = True) -> bool:
        """
        Save category data to JSON file

        Args:
            category_data: Category data dictionary
            use_versioning: If True, append version number if file exists

        Returns:
            True if successful, False otherwise
        """
        category_name = category_data.get('category_name', 'unknown')
        base_filename = f"{category_name}.json"

        if use_versioning:
            filename = self._get_versioned_filename(base_filename)
        else:
            filename = base_filename

        filepath = self.products_dir / filename

        logger.info(f"Saving category '{category_name}' to {filename}...")
        return self._atomic_write(filepath, category_data)

    def save_all_categories(self, all_categories: Dict[str, Dict]) -> bool:
        """
        Save all categories combined into master file

        Args:
            all_categories: Dictionary mapping category names to category data

        Returns:
            True if successful, False otherwise
        """
        master_data = {
            "generated_at": datetime.utcnow().isoformat(),
            "total_categories": len(all_categories),
            "total_products": sum(
                cat.get('total_products', 0)
                for cat in all_categories.values()
            ),
            "categories": all_categories
        }

        filepath = self.products_dir / MASTER_OUTPUT_FILE

        logger.info(f"Saving master file with {len(all_categories)} categories...")
        return self._atomic_write(filepath, master_data)

    def category_exists(self, category_name: str) -> bool:
        """
        Check if category file already exists

        Args:
            category_name: Name of category

        Returns:
            True if exists, False otherwise
        """
        filepath = self.products_dir / f"{category_name}.json"
        return filepath.exists()

    def load_category(self, category_name: str) -> Dict:
        """
        Load category data from file

        Args:
            category_name: Name of category

        Returns:
            Category data dictionary, or empty dict if not found
        """
        filepath = self.products_dir / f"{category_name}.json"

        try:
            with open(filepath, 'r', encoding=OUTPUT_ENCODING) as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load category '{category_name}': {e}")
            return {}

    def get_saved_categories(self) -> List[str]:
        """
        Get list of categories that have been saved

        Returns:
            List of category names
        """
        category_files = self.products_dir.glob("*.json")
        categories = []

        for filepath in category_files:
            # Skip master file and versioned files
            if filepath.name == MASTER_OUTPUT_FILE:
                continue
            if '_' in filepath.stem and filepath.stem.split('_')[-1].isdigit():
                continue

            categories.append(filepath.stem)

        return categories
