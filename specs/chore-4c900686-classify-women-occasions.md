# Chore: Classify Women Clothing Occasions

## Metadata
adw_id: `4c900686`
prompt: `Classify all products in women_clothing_v1.json with 30 comprehensive occasions using web scraping + rule-based classification`

## Chore Description
สร้างระบบ classification สำหรับ 30 occasions ให้กับ products ใน women_clothing_v1.json (1,247 products) โดย:

1. **Web Scraping**: ใช้ **Firecrawl MCP** (`firecrawl_scrape`) + Python regex parser
2. **Rule-based Classification**: สร้าง rules สำหรับ 30 occasions
3. **Update JSON**: เพิ่ม field `occasions` ให้กับทุก product

### Cost Optimization
| Method | Credits/Page | Total Credits |
|--------|--------------|---------------|
| ~~firecrawl_extract~~ | 26 | 32,422 |
| **firecrawl_scrape + parse** | **1** | **1,247** |

**ประหยัด 25x** โดยใช้ `firecrawl_scrape` แล้ว parse ด้วย regex

### 30 Occasions ที่ต้อง Classify

| หมวด | Occasions |
|------|-----------|
| Work & Professional (5) | `work_formal`, `work_casual`, `business_meeting`, `interview`, `presentation` |
| Social & Events (7) | `date`, `party`, `clubbing`, `dinner`, `brunch`, `concert`, `wedding_guest` |
| Casual & Lifestyle (6) | `casual`, `cafe`, `shopping`, `travel`, `beach`, `weekend` |
| Formal & Ceremonies (4) | `graduation`, `gala`, `ceremony`, `funeral` |
| Thai Cultural (5) | `temple`, `thai_wedding`, `songkran`, `loy_krathong`, `cny` |
| Active & Sports (3) | `sport`, `yoga`, `outdoor` |

## Relevant Files
Use these files to complete the chore:

- `/Users/naruechon/OOTD/data/products/women_clothing_v1.json` - Source file with 1,247 products to classify
- `/Users/naruechon/OOTD/scripts/migration/` - Directory for migration/classification scripts

### New Files
- `/Users/naruechon/OOTD/scripts/classification/__init__.py` - Module init
- `/Users/naruechon/OOTD/scripts/classification/scrape_product_details.py` - Firecrawl scraper + markdown parser
- `/Users/naruechon/OOTD/scripts/classification/markdown_parser.py` - Regex parser for scraped markdown
- `/Users/naruechon/OOTD/scripts/classification/occasion_rules.py` - Classification rules for 30 occasions
- `/Users/naruechon/OOTD/scripts/classification/classify_occasions.py` - Main classification script

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Classification Directory Structure
- Create `/Users/naruechon/OOTD/scripts/classification/` directory
- Create `__init__.py` for the module

### 2. Create Markdown Parser (markdown_parser.py)
Parse scraped markdown to extract structured data using regex:

```python
import re
from typing import Optional

def parse_product_markdown(markdown: str) -> dict:
    """Parse Central.co.th product page markdown to extract structured data."""
    result = {}

    # Extract subcategory from breadcrumb
    # Pattern: "5. [Mini Dresses](url)"
    breadcrumb_match = re.search(r'5\.\s*\[([^\]]+)\]', markdown)
    if breadcrumb_match:
        result['subcategory'] = breadcrumb_match.group(1).strip()

    # Extract material/fabric
    material_match = re.search(r'Material/Fabric\s*:\s*(.+?)(?:\n|$)', markdown)
    if material_match:
        result['material'] = material_match.group(1).strip()

    # Extract fit
    fit_match = re.search(r'Fit\s*:\s*(.+?)(?:\n|$)', markdown)
    if fit_match:
        result['fit'] = fit_match.group(1).strip()

    # Extract care instructions
    care_match = re.search(r'Care\s*:\s*(.+?)(?:\n|$)', markdown)
    if care_match:
        result['care'] = care_match.group(1).strip()

    # Extract color from title or product name
    colors = ['Blue', 'Black', 'White', 'Red', 'Pink', 'Green', 'Yellow',
              'Brown', 'Grey', 'Gray', 'Beige', 'Navy', 'Purple', 'Orange',
              'Cream', 'Gold', 'Silver', 'Burgundy', 'Olive', 'Khaki']
    color_pattern = r'\b(' + '|'.join(colors) + r')\b'
    color_match = re.search(color_pattern, markdown, re.IGNORECASE)
    if color_match:
        result['color'] = color_match.group(1).title()

    # Extract description (text between PRODUCT DETAILS and Material/Fabric)
    desc_match = re.search(r'PRODUCT DETAILS\s*\n\s*DELIVERY.*?\n\s*(.+?)(?:Material/Fabric|$)',
                           markdown, re.DOTALL)
    if desc_match:
        result['description'] = desc_match.group(1).strip()

    return result
```

### 3. Create Web Scraping Script (scrape_product_details.py)
- Use **Firecrawl MCP** (`firecrawl_scrape`) with `onlyMainContent: false` to get breadcrumb
- Parse markdown using `markdown_parser.py`
- Save scraped + parsed data to `/Users/naruechon/OOTD/data/products/women_clothing_scraped.json`
- Implement batch processing with progress tracking
- Handle errors gracefully with retry logic

#### Firecrawl MCP Usage:
```python
# Using firecrawl_scrape (1 credit per page)
result = firecrawl_scrape(
    url="https://www.central.co.th/en/product-page",
    formats=["markdown"],
    onlyMainContent=False,  # IMPORTANT: Get breadcrumb
    maxAge=172800000  # 48-hour cache
)

# Parse the markdown
from markdown_parser import parse_product_markdown
parsed = parse_product_markdown(result['markdown'])
# Returns: {'subcategory': 'Mini Dresses', 'material': '100% Linen', 'fit': 'No Fit', ...}
```

### 4. Create Occasion Rules (occasion_rules.py)
Define classification rules for each of the 30 occasions:

```python
OCCASION_RULES = {
    # Work & Professional
    'work_formal': {
        'include_subcategories': ['blazers', 'suits', 'dress pants', 'pencil skirts', 'blouses', 'midi dresses'],
        'include_keywords': ['blazer', 'suit', 'formal', 'office', 'professional', 'tailored'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'bikini', 'sport', 'gym', 'sleeveless'],
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'min_price': 1500,
    },
    'work_casual': {
        'include_subcategories': ['blouses', 'shirts', 'pants', 'midi skirts', 'cardigans'],
        'include_keywords': ['blouse', 'shirt', 'casual', 'comfortable'],
        'exclude_keywords': ['bikini', 'swimwear', 'sport', 'gym'],
        'require_coverage': {'shoulders': 'covered'},
    },

    # Social & Events
    'date': {
        'include_subcategories': ['dresses', 'midi dresses', 'mini dresses', 'blouses', 'skirts'],
        'include_keywords': ['dress', 'elegant', 'romantic', 'pretty', 'cute', 'feminine'],
        'exclude_keywords': ['sport', 'gym', 'swimwear', 'pajama'],
    },
    'party': {
        'include_subcategories': ['mini dresses', 'dresses', 'tops', 'jumpsuits'],
        'include_keywords': ['party', 'sequin', 'glitter', 'sparkle', 'cocktail', 'evening'],
        'include_materials': ['sequin', 'satin', 'silk', 'velvet'],
    },
    'cafe': {
        'include_subcategories': ['dresses', 'blouses', 'skirts', 'jeans', 'tops'],
        'include_keywords': ['dress', 'blouse', 'skirt', 'casual', 'cute', 'chic'],
        'exclude_keywords': ['sport', 'gym', 'active', 'swimwear', 'formal'],
        'price_range': [500, 15000],
    },

    # Thai Cultural
    'temple': {
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'sleeveless', 'off-shoulder'],
        'exclude_subcategories': ['mini dresses', 'shorts', 'swimwear'],
    },
    'funeral': {
        'include_colors': ['black', 'dark', 'navy'],
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'exclude_keywords': ['bright', 'colorful', 'party', 'sequin'],
    },
    'cny': {
        'include_colors': ['red', 'gold', 'pink', 'orange', 'burgundy'],
        'exclude_colors': ['black', 'white'],
    },

    # ... (define all 30 occasions)
}
```

### 5. Create Classification Script (classify_occasions.py)
- Load scraped data from `women_clothing_scraped.json`
- Merge with existing product data
- Apply occasion rules to each product
- Generate `occasions` field as dict with boolean values
- Save classified products to `women_clothing_v1.json`
- Generate classification report

### 6. Run Web Scraping (via Claude Code MCP)
- Use Firecrawl MCP to scrape all 1,247 products
- Process in batches of 50-100 for progress tracking
- Save intermediate results to avoid data loss
- Estimated time: 30-60 minutes (with caching)
- Estimated credits: ~1,247

### 7. Run Classification
- Execute classify_occasions.py
- Apply rules to all products
- Update women_clothing_v1.json with occasions field

### 8. Validate Classification Results
- Spot check 50+ products for accuracy
- Generate distribution report (how many products per occasion)
- Verify no products have all false occasions
- Verify occasion distribution is reasonable

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Verify occasions field exists with 30 keys
python3 -c "import json; d=json.load(open('data/products/women_clothing_v1.json')); p=d['products'][0]; print('occasions' in p, len(p.get('occasions', {})))"
```

```bash
# Print occasion distribution
python3 -c "
import json
with open('data/products/women_clothing_v1.json') as f:
    d = json.load(f)
products = d['products']
occasion_counts = {}
for p in products:
    for occ, val in p.get('occasions', {}).items():
        if val:
            occasion_counts[occ] = occasion_counts.get(occ, 0) + 1
for occ, count in sorted(occasion_counts.items(), key=lambda x: -x[1]):
    print(f'{occ}: {count} ({count*100/len(products):.1f}%)')
"
```

```bash
# Verify all products have at least one occasion
python3 -c "
import json
with open('data/products/women_clothing_v1.json') as f:
    d = json.load(f)
products = d['products']
no_occasion = [p for p in products if not any(p.get('occasions', {}).values())]
print(f'Products with no occasions: {len(no_occasion)}')
"
```

## Notes

### Cost Summary
| Item | Credits |
|------|---------|
| firecrawl_scrape x 1,247 products | 1,247 |
| Caching (repeat requests) | 0 |
| **Total** | **~1,247** |

### Firecrawl Scrape Strategy
- Use `onlyMainContent: false` to get breadcrumb (subcategory)
- Use `maxAge: 172800000` (48 hours) for caching
- Parse markdown with regex (no additional credits)
- 1 credit per page = 25x cheaper than firecrawl_extract

### Regex Parser Coverage
| Field | Regex Pattern | Source |
|-------|---------------|--------|
| subcategory | `5\.\s*\[([^\]]+)\]` | Breadcrumb |
| material | `Material/Fabric\s*:\s*(.+)` | Product Details |
| fit | `Fit\s*:\s*(.+)` | Product Details |
| care | `Care\s*:\s*(.+)` | Product Details |
| color | `\b(Blue|Black|...)\b` | Title/Description |

### Classification Accuracy
- Rule-based classification อาจไม่ 100% accurate
- ควร spot check และปรับ rules ถ้าจำเป็น
- บาง products อาจเหมาะกับหลาย occasions

### Fallback Strategy
- ถ้า scraping ล้มเหลว ให้ใช้ข้อมูลที่มีอยู่ใน JSON (product_name, price, coverage)
- Classification ยังทำได้แม้ไม่มีข้อมูลเพิ่มเติม (แต่อาจแม่นยำน้อยกว่า)

### Thai Cultural Occasions Rules
| Occasion | Key Rules |
|----------|-----------|
| `temple` | shoulders + knees covered, no crop/mini/tank |
| `thai_wedding` | formal + ไม่ใช่สีขาว/ดำ |
| `funeral` | สีดำ/เข้ม + formal + coverage |
| `songkran` | casual + quick-dry materials |
| `loy_krathong` | dress + สีสวย + feminine |
| `cny` | สีแดง/ทอง/ชมพู, ไม่ใช่ขาว/ดำ |
