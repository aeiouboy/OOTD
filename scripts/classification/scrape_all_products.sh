#!/bin/bash
# Scrape all products using Firecrawl MCP
#
# This script coordinates the scraping of all 1,247 products.
# It is designed to be executed by Claude Code with MCP tool access.

echo "=========================================================================="
echo "FIRECRAWL MCP PRODUCT SCRAPING WORKFLOW"
echo "=========================================================================="
echo ""

# Configuration
INPUT_FILE="data/products/women_clothing_v1.json"
OUTPUT_FILE="data/products/women_clothing_scraped.json"
CHECKPOINT_FILE="data/products/scraping_checkpoint.json"
REPORT_FILE="scripts/classification/scraping_report.txt"
ERROR_LOG="scraping_errors.log"

# Check input file
if [ ! -f "$INPUT_FILE" ]; then
    echo "ERROR: Input file not found: $INPUT_FILE"
    exit 1
fi

# Get product count
PRODUCT_COUNT=$(python3 -c "import json; data=json.load(open('$INPUT_FILE')); print(len(data['products']))")
echo "Total products to scrape: $PRODUCT_COUNT"
echo ""

# Check for existing checkpoint
if [ -f "$CHECKPOINT_FILE" ]; then
    RESUME_INDEX=$(python3 -c "import json; data=json.load(open('$CHECKPOINT_FILE')); print(data.get('next_index', 0))")
    echo "Found checkpoint - can resume from index $RESUME_INDEX"
    echo ""
fi

echo "=========================================================================="
echo "READY FOR SCRAPING"
echo "=========================================================================="
echo ""
echo "This script provides the framework for scraping."
echo "The actual scraping requires Claude Code to execute Firecrawl MCP calls."
echo ""
echo "Workflow:"
echo "1. Load products from $INPUT_FILE"
echo "2. For each product URL:"
echo "   - Call mcp__firecrawl-mcp__firecrawl_scrape with:"
echo "     - formats: ['markdown']"
echo "     - onlyMainContent: false"
echo "     - waitFor: 2000"
echo "     - removeBase64Images: true"
echo "3. Parse markdown with parse_product_page_markdown()"
echo "4. Save checkpoint every 100 products"
echo "5. Generate final report and enriched catalog"
echo ""
echo "Estimated time: ~20-30 minutes for $PRODUCT_COUNT products"
echo "Firecrawl credits: $PRODUCT_COUNT"
echo ""
echo "=========================================================================="
echo ""
echo "To execute, Claude Code should:"
echo "1. Load products from women_clothing_v1.json"
echo "2. Loop through each product and call Firecrawl MCP"
echo "3. Parse and save results progressively"
echo ""
