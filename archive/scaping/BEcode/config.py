"""
Configuration for Central Group Product Scraping System
"""
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent
PRODUCTS_DIR = BASE_DIR / "products"
LOG_DIR = BASE_DIR / "log"
AGENTS_DIR = BASE_DIR / "agents"

# Categories to scrape - Clothing only
CATEGORIES = {
    "women": "https://www.central.co.th/th/women/clothing",
    "men": "https://www.central.co.th/th/men/clothing"
}

# Worker configuration
DEFAULT_WORKERS = 3
MAX_WORKERS = 10
MIN_WORKERS = 1

# Scraping configuration
REQUEST_TIMEOUT = 45  # seconds (increased for JavaScript rendering)
PAGE_LOAD_WAIT = 10  # seconds to wait for dynamic content (increased for JS-heavy pages)
SCROLL_WAIT = 5  # seconds between scrolls (increased for stability)
MAX_SCROLLS = 50  # maximum scroll attempts for infinite scroll
MAX_RETRIES = 3  # maximum retry attempts for failed requests
RETRY_DELAYS = [2, 4, 8]  # exponential backoff delays in seconds

# Anti-scraping configuration
USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

REQUEST_DELAY_MIN = 1  # minimum delay between requests (seconds)
REQUEST_DELAY_MAX = 3  # maximum delay between requests (seconds)

# Validation configuration
MIN_PRICE = 0
MAX_PRICE = 1000000  # 1 million THB
REQUIRED_FIELDS = ['sku', 'brand', 'product_name', 'product_url']
VALIDATION_PASS_THRESHOLD = 0.99  # 99% validation pass rate

# Output configuration
JSON_INDENT = 2
OUTPUT_ENCODING = 'utf-8'
MASTER_OUTPUT_FILE = "all_categories.json"

# Logging configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
CONSOLE_LOG = True
FILE_LOG = True

# Performance metrics
TARGET_WORKER_UTILIZATION = 0.80  # 80% target utilization
