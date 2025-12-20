# Chore: Separate Products by Category

## Metadata
adw_id: `068f14a4`
prompt: `Read products/product_master.json and separate products by category field into two files: 1) products/women_clothing.json containing all products where category equals 'women_clothing', 2) products/men_clothing.json containing all products where category equals 'men_clothing'. Preserve the exact same JSON structure and fields for each product. Output should be formatted JSON arrays with 2-space indentation.`

## Chore Description
This chore splits the master product catalog (`product_master.json`) into two separate category-specific files based on the `category` field. The goal is to create organized, filtered product datasets for women's and men's clothing categories while maintaining the exact same JSON structure and formatting standards.

## Relevant Files
Use these files to complete the chore:

- `products/product_master.json` - Source file containing all products with mixed categories (women_clothing and men_clothing)

### New Files
- `products/women_clothing.json` - Output file containing only products where `category === "women_clothing"`
- `products/men_clothing.json` - Output file containing only products where `category === "men_clothing"`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Parse Source Data
- Read the entire `products/product_master.json` file
- Parse the JSON array to access individual product objects
- Verify the data structure and confirm the presence of `category` field

### 2. Filter Products by Category
- Create two separate arrays:
  - `women_products`: Filter all products where `category === "women_clothing"`
  - `men_products`: Filter all products where `category === "men_clothing"`
- Preserve all fields for each product object without modification
- Maintain the original order of products within each category

### 3. Write Women's Clothing File
- Convert `women_products` array to formatted JSON with 2-space indentation
- Write to `products/women_clothing.json`
- Ensure proper JSON array structure with opening `[` and closing `]`

### 4. Write Men's Clothing File
- Convert `men_products` array to formatted JSON with 2-space indentation
- Write to `products/men_clothing.json`
- Ensure proper JSON array structure with opening `[` and closing `]`

### 5. Validate Output Files
- Verify both output files are valid JSON
- Confirm all products from source file are accounted for in one of the two output files
- Check that no products were duplicated or lost during the split
- Verify the JSON formatting matches requirements (2-space indentation)
- Spot-check sample products to ensure all fields are preserved

## Validation Commands
Execute these commands to validate the chore is complete:

- `python -m json.tool products/women_clothing.json > /dev/null && echo "women_clothing.json is valid JSON"` - Validate women's clothing JSON syntax
- `python -m json.tool products/men_clothing.json > /dev/null && echo "men_clothing.json is valid JSON"` - Validate men's clothing JSON syntax
- `jq 'length' products/product_master.json` - Count total products in master file
- `jq 'length' products/women_clothing.json` - Count products in women's file
- `jq 'length' products/men_clothing.json` - Count products in men's file
- Verify: `women_count + men_count = master_count`
- `jq '.[0] | keys' products/women_clothing.json` - Verify field structure is preserved
- `jq '.[0] | keys' products/men_clothing.json` - Verify field structure is preserved

## Notes
- The source file `product_master.json` is approximately 1.5MB (1,509,962 bytes), so efficient processing is recommended
- All product objects should have the same field structure: `category`, `price`, `original_price`, `brand`, `product_name`, `link`, `image_url`, `availability`, `product_description`
- The original `product_master.json` file should remain unchanged after this operation
- JSON formatting should use 2-space indentation to match project standards
