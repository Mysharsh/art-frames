# TurtleWings Web Scraper - Quick Start Guide

## Setup

### 1. Install Dependencies
```bash
cd scrapers
pip install -r requirements.txt
```

### 2. Run the Scraper

#### Basic run (all data):
```bash
python turtlewings_scraper.py
```

#### Sample mode (first 2 pages of each collection):
```bash
python turtlewings_scraper.py --sample
```

#### Limit number of products:
```bash
python turtlewings_scraper.py --max-products 100
```

#### Skip detailed product scraping (only get listing data):
```bash
python turtlewings_scraper.py --no-details
```

#### Get details for only first 50 products:
```bash
python turtlewings_scraper.py --max-details 50
```

### 3. Combine Options
```bash
# Sample mode with detail limit
python turtlewings_scraper.py --sample --max-details 20

# All collections, max 500 products
python turtlewings_scraper.py --max-products 500
```

## Output Files

All scraped data is saved in the `data/` directory:

- **CSV Files**: `turtlewings_products_YYYYMMDD_HHMMSS.csv`
  - Columns: name, url, thumbnail_image, collection, scraped_at, price_info, description, images, stock_status, rating, review_count, variants
  - Easy to import into Excel or Supabase

- **JSON Files**: `turtlewings_products_YYYYMMDD_HHMMSS.json`
  - Includes metadata (source, timestamp, counts)
  - Structured nested format for programmatic access
  - Lists failed URLs for review

- **Log Files**: `scraper_YYYYMMDD_HHMMSS.log`
  - Detailed logging of all operations
  - Error and warning messages

## Data Fields Scraped

### Listing Page Data:
- `name` - Product name
- `url` - Product page URL
- `thumbnail_image` - Small product image
- `collection` - Collection/category name
- `scraped_at` - ISO timestamp when scraped

### Detail Page Data (when --no-details not used):
- `price_info` - Price information (regular, sale, EMI)
- `description` - Full product description
- `images` - All product images (list)
- `stock_status` - In stock, out of stock, etc.
- `rating` - Star rating (e.g., "4.5 stars")
- `review_count` - Number of customer reviews
- `variants` - Available sizes/colors (list)

## Processing Time Estimates

- **Sample mode** (2 pages): ~5-10 minutes
- **100 products**: ~20-30 minutes
- **500 products**: ~2-3 hours
- **All 4,900 products**: ~12-15 hours (for listing only, add more time for details)

*Includes 2-second delays between requests to be respectful to the server*

## Troubleshooting

### Chrome/ChromeDriver Issues
If you see WebDriver errors:
- The script uses `webdriver-manager` to auto-download ChromeDriver
- Install Chrome browser if not already installed
- Run: `webdriver-manager chrome --latest` to update driver

### Request Timeouts
- Increase the `REQUEST_DELAY` in the script if getting blocked
- Check your internet connection
- Monitor website status

### Memory Issues with Large Datasets
- Use `--sample` mode for testing
- Limit with `--max-products`
- Data is exported after scraping completes

## Next Steps

### 1. Import to Supabase
```python
import pandas as pd
from supabase import create_client

# Read CSV
df = pd.read_csv('data/turtlewings_products_*.csv')

# Upload to Supabase
# (See your Supabase integration code)
```

### 2. Download Product Images
```bash
python download_images.py --csv data/turtlewings_products_*.csv
```

### 3. Integration with Next.js App
Copy the JSON or CSV file to your app's public/data directory:
```bash
cp data/turtlewings_products_*.json ../app/public/data/
```

## Support

- Check `data/scraper_*.log` for detailed error messages
- Failed URLs are saved in the JSON output for manual review
- Adjust `REQUEST_DELAY` and other settings in the script as needed

