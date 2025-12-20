# PRD: Central Group Product Scraping System

## Introduction/Overview

The Central Group Product Scraping System is a robust, multi-worker web scraping solution designed to build a comprehensive product database from Central Group's e-commerce platform (central.co.th). This system will extract product information from the Women's and Men's fashion categories to populate the OOTDay fashion assistant's product catalog, enabling accurate product recommendations and purchase links.

The scraper will utilize Crawl4AI technology with a multi-agent architecture, supporting parallel processing through configurable workers. The system is designed for a one-time initial data load to establish the product database for the OOTDay platform.

**Problem Statement:** The OOTDay fashion assistant requires a complete, structured product catalog from Central Group's inventory to provide users with relevant fashion recommendations and direct purchase links. Manual data collection is impractical given the scale of products across categories.

## Goals

1. **Complete Data Coverage:** Successfully scrape 100% of SKUs from both Women's and Men's categories on central.co.th
2. **Data Quality:** Ensure all scraped data meets validation criteria with required fields properly populated
3. **Structured Output:** Generate well-organized JSON files by category with comprehensive product information
4. **Scalable Architecture:** Implement a multi-worker sub-agent system capable of efficient parallel scraping
5. **Operational Transparency:** Maintain detailed logs of scraping operations, duration, and summary statistics
6. **Reliable Execution:** Handle pagination limits and anti-scraping measures automatically

## User Stories

1. **As a Data Engineer**, I want to run the scraper once to populate the initial product database, so that the OOTDay platform has a complete inventory to work with.

2. **As a Fashion Assistant AI**, I need access to structured product data (SKU, brand, name, prices, images, descriptions, sizes/colors), so that I can recommend relevant products to users.

3. **As a System Administrator**, I want detailed logs of scraping operations in JSON format, so that I can monitor performance, troubleshoot issues, and verify data completeness.

4. **As a Developer**, I want the scraper to handle all pagination and category traversal automatically, so that I don't need to manually configure URL patterns for each category.

5. **As a Product Manager**, I need the scraper to validate data quality and ensure no category is saved with incomplete data, so that downstream systems can rely on data integrity.

## Functional Requirements

### Core Scraping Functionality

1. The system MUST scrape all products from the following categories:
   - Women's: https://www.central.co.th/th/women
   - Men's: https://www.central.co.th/th/men

2. The system MUST extract the following data fields for each product:
   - SKU (unique product identifier)
   - Brand name
   - Product name
   - Unit price (discounted price if applicable)
   - Original price (before discount)
   - Product URL (e.g., "https://www.central.co.th/th/expressionsevening-women-midi-dress-with-mock-neck-and-fishtail-skirt-grcds53725070552")
   - Product image URLs
   - Product description/details
   - Available sizes and colors (variants)

3. The system MUST traverse all pagination within each category to capture every SKU.

4. The system MUST handle anti-scraping measures and pagination limits automatically with appropriate strategies (rate limiting, user-agent rotation, retry logic, etc.).

### Data Validation & Quality

5. The system MUST validate that all required fields are present for each scraped product:
   - SKU exists and is not empty
   - Product name and brand are present
   - At least one price field (unit or original) exists
   - Product URL is valid and properly formatted

6. The system MUST validate price formats to ensure they are numeric and within reasonable ranges.

7. The system MUST verify that image URLs are accessible and return valid responses.

8. The system MUST check for and handle duplicate SKUs, keeping only unique entries.

9. The system MUST NOT save a category's data until ALL SKUs for that category have been successfully scraped and validated.

### Multi-Worker Architecture

10. The system MUST implement a sub-agent architecture named "scraper" using Crawl4AI.

11. The scraper sub-agent MUST support configurable parallel processing with multiple workers (default: 3 workers, but must be configurable for dynamic adjustment).

12. The number of workers MUST be easily adjustable through configuration to optimize performance based on system resources.

13. All sub-agent code MUST be stored in `/Users/naruechon/Documents/Project/OOTDay/agents/`.

### Error Handling & Recovery

14. The system MUST retry failed page requests automatically with exponential backoff strategy.

15. The system MUST log errors and continue scraping other categories if one category encounters issues.

16. The system MUST save partial results and support resuming from the last successful scraping point in case of failures.

17. The system MUST extend timeout durations as needed to wait for complete category scraping before saving results.

### Output & Storage

18. The system MUST generate a master file `all_categories.json` containing all scraped products at `/Users/naruechon/Documents/Project/OOTDay/products/`.

19. The system MUST generate individual category files named `{category-name}.json` at `/Users/naruechon/Documents/Project/OOTDay/products/` for each successfully completed category.

20. If multiple versions of output files are created, the system MUST append version numbers (e.g., `{category-name}_1.json`, `{category-name}_2.json`).

21. All JSON output files MUST be properly formatted, valid JSON with appropriate indentation for readability.

### Logging & Monitoring

22. The system MUST generate detailed log files in JSON format at `/Users/naruechon/Documents/Project/OOTDay/log/`.

23. Log files MUST include:
    - Total scraping duration (start time, end time, elapsed time)
    - Summary statistics (total SKUs scraped, success rate, failure count)
    - Category-by-category breakdown of results
    - Error details for any failed operations
    - Worker utilization and performance metrics

24. The system MUST timestamp all log entries for troubleshooting and audit purposes.

### Code Organization

25. All scraping code MUST be written in Python and stored at `/Users/naruechon/Documents/Project/OOTDay/BEcode/`.

26. Python files MUST follow version naming conventions (e.g., `central_scrape_1.py`, `central_scrape_2.py`) when creating new versions.

27. The code MUST be modular with clear separation between:
    - Configuration management
    - Scraping logic
    - Data validation
    - Output generation
    - Logging functionality

## Non-Goals (Out of Scope)

1. **Scheduled/Recurring Scraping:** This is a one-time data load system. Automated scheduling or incremental updates are out of scope.

2. **Real-time Notifications:** The system will not send email, Slack, or other active alerts. Monitoring is via log files only.

3. **Data Downloading:** Product images will be stored as URLs only; downloading actual image files is out of scope.

4. **Review/Rating Collection:** While product ratings may be visible on pages, collecting detailed review text or user-generated content is out of scope.

5. **Price History Tracking:** The system captures current prices only; historical price tracking is not included.

6. **Multi-Region Support:** Only the Thai website (central.co.th/th/) is in scope; other regional sites are excluded.

7. **Product Recommendations:** The scraper only collects data; implementing recommendation logic is handled by the OOTDay fashion assistant separately.

8. **UI Dashboard:** No graphical user interface for monitoring; progress tracking is through JSON log files.

## Design Considerations

### Data Schema

The output JSON should follow this structure for each product:

```json
{
  "sku": "string",
  "brand": "string",
  "product_name": "string",
  "unit_price": "number",
  "original_price": "number",
  "product_url": "string",
  "image_urls": ["string"],
  "description": "string",
  "variants": [
    {
      "size": "string",
      "color": "string",
      "availability": "boolean"
    }
  ],
  "category": "string",
  "scraped_at": "ISO 8601 timestamp"
}
```

### Category File Structure

```json
{
  "category_name": "women",
  "category_url": "https://www.central.co.th/th/women",
  "total_products": 1250,
  "scraped_at": "2025-10-12T10:30:00Z",
  "scraping_duration_seconds": 1800,
  "products": [
    { /* product object */ }
  ]
}
```

### Log File Structure

```json
{
  "scraping_session_id": "uuid",
  "start_time": "ISO 8601 timestamp",
  "end_time": "ISO 8601 timestamp",
  "total_duration_seconds": 3600,
  "configuration": {
    "workers": 3,
    "categories": ["women", "men"]
  },
  "summary": {
    "total_skus_scraped": 2500,
    "successful_categories": 2,
    "failed_categories": 0,
    "validation_pass_rate": 99.5
  },
  "category_details": [
    {
      "category": "women",
      "skus_scraped": 1250,
      "duration_seconds": 1800,
      "status": "completed"
    }
  ],
  "errors": []
}
```

## Technical Considerations

### Technology Stack

- **Scraping Framework:** Crawl4AI (latest stable version)
- **Programming Language:** Python 3.9+
- **Concurrency Model:** Multi-worker/multi-process architecture
- **Storage:** Local filesystem with JSON format

### Architecture Components

1. **Main Orchestrator:** Coordinates workers, manages category queue, aggregates results
2. **Scraper Sub-Agent:** Individual worker agents that process assigned categories/pages
3. **Validation Engine:** Validates scraped data against quality criteria
4. **Storage Manager:** Handles file I/O and ensures atomic writes
5. **Logger:** Centralized logging system for all operations

### Dependencies

- Crawl4AI and its dependencies
- Standard Python libraries: `json`, `logging`, `datetime`, `multiprocessing`
- Consider: `requests`, `beautifulsoup4`, or other parsing libraries as needed by Crawl4AI

### Performance Considerations

- No constraints on scraping speed - optimize for fastest possible completion
- Implement connection pooling for efficient HTTP requests
- Use appropriate timeouts to handle slow-responding pages
- Monitor memory usage when processing large category results

### Anti-Scraping Mitigation

The system should implement strategies to handle potential anti-scraping measures:
- User-agent rotation
- Request rate management (intelligent throttling)
- Session management
- Handling of CAPTCHAs or bot detection (with graceful degradation)
- Respect robots.txt directives where appropriate

## Success Metrics

1. **Complete Coverage:** 100% of SKUs successfully scraped from both Women's and Men's categories
2. **Data Quality:**
   - 100% of products have all required fields populated
   - Validation pass rate ≥ 99%
   - Zero duplicate SKUs in final output
3. **System Reliability:**
   - Successful completion without manual intervention
   - Automatic recovery from transient failures
   - All categories saved only when complete
4. **Performance:**
   - System completes within reasonable time given product count (benchmark after initial run)
   - Worker utilization ≥ 80% during scraping operations

## Open Questions

1. **Product Variants Handling:** When a product has multiple sizes/colors, should we:
   - Create separate SKU entries for each variant?
   - Store variants as nested objects under a parent product?
   - **Recommendation:** Store as nested variants under parent product to avoid SKU explosion

2. **Out-of-Stock Products:** Should we:
   - Include out-of-stock products in the database?
   - Add an availability flag to track stock status?
   - **Recommendation:** Include all products with availability flag for future inventory tracking

3. **Duplicate Products Across Categories:** If a product appears in both Women's and Men's categories:
   - Include in both category files but deduplicate in `all_categories.json`?
   - Assign primary category and store cross-references?
   - **Recommendation:** Clarify with stakeholders on preferred approach

4. **Rate Limiting Strategy:** Should we implement:
   - Aggressive scraping (no rate limiting) for fastest completion?
   - Conservative rate limiting to be respectful of server resources?
   - **Recommendation:** Start conservative and adjust based on server response patterns

5. **Incremental Scraping (Future):** While out of scope for initial load, should the architecture:
   - Support future incremental updates (scraping only new/changed products)?
   - Be designed for easy extension to scheduled updates?
   - **Recommendation:** Design with modularity to facilitate future enhancements

---

**Document Version:** 1.0
**Created:** 2025-10-12
**Last Updated:** 2025-10-12
**Status:** Draft - Pending Review
**Next Steps:** Generate task breakdown using `/generate-tasks` workflow
