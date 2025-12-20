# Chore: Separate Products by Category

## Metadata
adw_id: `38ac62c8`
prompt: `Read products/product_master.json and separate products by category field into two files: 1) products/women_clothing.json containing all products where category equals 'women_clothing', 2) products/men_clothing.json containing all products where category equals 'men_clothing'. Preserve the exact same JSON structure and fields for each product. Output should be formatted JSON arrays with 2-space indentation.`

## Chore Description
This chore involves reading the master product data file (`product_master.json`) and splitting it into two separate category-specific files based on the `category` field value. Products with `category: "women_clothing"` should be written to `women_clothing.json`, and products with `category: "men_clothing"` should be written to `men_clothing.json`. The output files must maintain the exact same JSON structure and formatting as the source file, using 2-space indentation for readability.

## Relevant Files

- `products/product_master.json` - Source file containing all products (~28,535 lines, ~1.5MB). Contains products with `category` field set to either "women_clothing" or "men_clothing"

### New Files

- `products/women_clothing.json` - Will contain all products where `category == "women_clothing"`. Should be a JSON array with 2-space indentation
- `products/men_clothing.json` - Will contain all products where `category == "men_clothing"`. Should be a JSON array with 2-space indentation

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Parse Source Data
- Read the entire `products/product_master.json` file
- Parse the JSON array to access individual product objects
- Verify the file structure matches expected format (array of product objects)

### 2. Filter Products by Category
- Iterate through all products in the parsed array
- Create two separate arrays:
  - `women_products` - collect all products where `category === "women_clothing"`
  - `men_products` - collect all products where `category === "men_clothing"`
- Preserve all fields exactly as they appear in the source (category, price, original_price, brand, product_name, link, image_url, availability, product_description)

### 3. Write Category-Specific Files
- Write `women_products` array to `products/women_clothing.json` as formatted JSON with 2-space indentation
- Write `men_products` array to `products/men_clothing.json` as formatted JSON with 2-space indentation
- Ensure proper JSON formatting with newlines and indentation

### 4. Validate Output Files
- Verify both output files are valid JSON
- Confirm all products in `women_clothing.json` have `category: "women_clothing"`
- Confirm all products in `men_clothing.json` have `category: "men_clothing"`
- Verify total product count: (women count + men count) should equal total in product_master.json
- Check file sizes are reasonable and files are not empty

## Validation Commands
Execute these commands to validate the chore is complete:

- `jq length products/women_clothing.json` - Count women's products
- `jq length products/men_clothing.json` - Count men's products
- `jq length products/product_master.json` - Count total products (for comparison)
- `jq '.[0].category' products/women_clothing.json` - Verify first product in women's file has correct category
- `jq '.[0].category' products/men_clothing.json` - Verify first product in men's file has correct category
- `jq -e '.[].category | select(. != "women_clothing")' products/women_clothing.json && echo "ERROR: Found non-women products" || echo "✓ All products are women_clothing"` - Verify no incorrect categories in women's file
- `jq -e '.[].category | select(. != "men_clothing")' products/men_clothing.json && echo "ERROR: Found non-men products" || echo "✓ All products are men_clothing"` - Verify no incorrect categories in men's file

## Notes
- The source file is approximately 1.5MB, so ensure sufficient memory is available for parsing
- Both category values use underscore format: "women_clothing" and "men_clothing" (not hyphenated or camelCase)
- Output files should use 2-space indentation for consistency with common JSON formatting standards
- All product fields should be preserved exactly as they appear in the source, including empty strings for product_description
