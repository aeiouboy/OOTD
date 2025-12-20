# Chore: Separate Products by Category

## Metadata
adw_id: `7d9e6b8f`
prompt: `Read products/product_master.json and separate products by category field into two files: 1) products/women_clothing.json containing all products where category equals 'women_clothing', 2) products/men_clothing.json containing all products where category equals 'men_clothing'. Preserve the exact same JSON structure and fields for each product. Output should be formatted JSON arrays.`

## Chore Description
This chore involves reading the master product catalog file (`products/product_master.json`) and splitting it into two separate files based on the `category` field:
- All products with `category: "women_clothing"` will be extracted to `products/women_clothing.json`
- All products with `category: "men_clothing"` will be extracted to `products/men_clothing.json`

Each output file must maintain the exact same JSON structure as the source file, preserving all fields for each product. The output files should be formatted as JSON arrays containing the filtered products.

## Relevant Files

### Existing Files
- `products/product_master.json` (28,535 lines) - Master product catalog containing both women's and men's clothing products with the following structure per product:
  - `category`: Product category (e.g., "women_clothing", "men_clothing")
  - `price`: Current price
  - `original_price`: Original price before discount
  - `brand`: Brand name
  - `product_name`: Full product name
  - `link`: URL to product page
  - `image_url`: Product image URL
  - `availability`: Stock status
  - `product_description`: Product description text

### New Files
- `products/women_clothing.json` - Will contain all products where `category === "women_clothing"`
- `products/men_clothing.json` - Will contain all products where `category === "men_clothing"`

## Step by Step Tasks

### 1. Read and Parse Master Product File
- Read the entire `products/product_master.json` file
- Parse the JSON array to access individual product objects
- Validate that the file is properly formatted JSON

### 2. Filter Products by Category
- Iterate through all products in the master file
- Separate products into two arrays based on the `category` field:
  - Women's array: products where `category === "women_clothing"`
  - Men's array: products where `category === "men_clothing"`
- Ensure all product fields are preserved exactly as they appear in the source

### 3. Write Formatted JSON Output Files
- Write the women's products array to `products/women_clothing.json`
- Write the men's products array to `products/men_clothing.json`
- Format the JSON with proper indentation (2 spaces) for readability
- Ensure valid JSON structure with proper array brackets

### 4. Validate Output Files
- Verify both output files are valid JSON
- Confirm all products in each file have the correct category value
- Check that total product count equals the sum of both output files
- Validate that all expected fields are present in the output products

## Validation Commands
Execute these commands to validate the chore is complete:

- `cat products/women_clothing.json | python -m json.tool > /dev/null && echo "✓ women_clothing.json is valid JSON"` - Validate women's clothing JSON
- `cat products/men_clothing.json | python -m json.tool > /dev/null && echo "✓ men_clothing.json is valid JSON"` - Validate men's clothing JSON
- `grep -c '"category": "women_clothing"' products/women_clothing.json` - Count women's products in output
- `grep -c '"category": "men_clothing"' products/men_clothing.json` - Count men's products in output
- `grep -c '"category": "men_clothing"' products/women_clothing.json || echo "✓ No men's clothing in women's file"` - Verify no cross-contamination
- `grep -c '"category": "women_clothing"' products/men_clothing.json || echo "✓ No women's clothing in men's file"` - Verify no cross-contamination
- `wc -l products/women_clothing.json products/men_clothing.json` - Check line counts of output files

## Notes
- The source file is approximately 28,535 lines, containing a large number of products
- Based on initial inspection, women's clothing products appear in the first ~13,700 lines, with men's clothing starting around line 13,720
- Each product object spans approximately 11 lines in the formatted JSON
- The script should handle large file sizes efficiently
- All product fields must be preserved exactly, including empty strings for fields like `product_description`
