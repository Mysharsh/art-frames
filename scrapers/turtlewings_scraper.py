"""
TurtleWings.co.in Web Scraper
Scrapes product information, images, pricing, and details from TurtleWings e-commerce store
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import csv
import logging
import time
import os
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
BASE_URL = "https://www.turtlewings.co.in"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
REQUEST_DELAY = 2  # seconds between requests
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
LOG_FILE = os.path.join(DATA_DIR, f'scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

# Setup logging
os.makedirs(DATA_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class TurtleWingsScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.products = []
        self.failed_urls = []
        self.collections = []
        
    def discover_collections(self) -> List[Dict]:
        """Discover all product collections from the homepage"""
        logger.info("Starting collection discovery...")
        try:
            response = self.session.get(BASE_URL, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            collections = []
            
            # Look for collection links in navigation
            collection_links = soup.find_all('a', href=True)
            for link in collection_links:
                href = link.get('href')
                if href and '/collections/' in href and href not in [c['url'] for c in collections]:
                    url = urljoin(BASE_URL, href)
                    collection_name = href.split('/collections/')[-1].replace('-', ' ').title()
                    collections.append({
                        'name': collection_name,
                        'url': url,
                        'slug': href.split('/collections/')[-1]
                    })
            
            logger.info(f"Discovered {len(collections)} collections")
            self.collections = collections
            return collections
            
        except Exception as e:
            logger.error(f"Error discovering collections: {e}")
            return []
    
    def get_collection_max_pages(self, collection_url: str) -> int:
        """Determine maximum pages in a collection"""
        try:
            response = self.session.get(collection_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for pagination - Shopify typically shows max pages in pagination
            pagination = soup.find('ul', class_='pagination')
            if pagination:
                pages = pagination.find_all('a', href=True)
                if pages:
                    last_page_url = pages[-1].get('href')
                    if 'page=' in last_page_url:
                        return int(last_page_url.split('page=')[-1])
            
            # If no pagination found, assume single page
            return 1
            
        except Exception as e:
            logger.warning(f"Could not determine max pages for {collection_url}: {e}")
            return 1
    
    def scrape_collection_page(self, collection_url: str, page: int = 1) -> List[Dict]:
        """Scrape products from a collection page"""
        url = f"{collection_url}?page={page}" if page > 1 else collection_url
        products = []
        
        try:
            time.sleep(REQUEST_DELAY)
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product cards
            product_cards = soup.find_all('a', href=True)
            
            for card in product_cards:
                href = card.get('href')
                if not href or '/products/' not in href:
                    continue
                
                try:
                    product_url = urljoin(BASE_URL, href)
                    
                    # Extract information from card
                    card_text = card.get_text()
                    
                    # Look for price information in the card
                    price_text = card_text
                    
                    # Extract product name (usually the first text in the link)
                    product_name = card.get_text(strip=True).split('\n')[0]
                    
                    # Get thumbnail image
                    img = card.find('img')
                    image_url = img.get('src') if img else None
                    if image_url:
                        image_url = urljoin(BASE_URL, image_url)
                    
                    product_data = {
                        'name': product_name,
                        'url': product_url,
                        'thumbnail_image': image_url,
                        'collection': collection_url.split('/collections/')[-1].rstrip('/'),
                        'scraped_at': datetime.now().isoformat()
                    }
                    
                    products.append(product_data)
                    
                except Exception as e:
                    logger.warning(f"Error parsing product card: {e}")
                    continue
            
            logger.info(f"Scraped {len(products)} products from {url}")
            return products
            
        except Exception as e:
            logger.error(f"Error scraping collection page {url}: {e}")
            self.failed_urls.append(url)
            return []
    
    def scrape_product_details(self, product_url: str) -> Dict:
        """Scrape detailed product information using Selenium"""
        product_data = {}
        
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--start-maximized')
            options.add_argument('--disable-blink-features=AutomationControlled')
            
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=options
            )
            
            time.sleep(REQUEST_DELAY)
            driver.get(product_url)
            
            # Wait for page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.TAG_NAME, 'img'))
            )
            
            # Extract data from page
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            # Product name
            title = soup.find('h1')
            product_data['name'] = title.get_text(strip=True) if title else 'N/A'
            
            # Price information
            price_section = soup.find('div', class_='price')
            if price_section:
                price_text = price_section.get_text()
                # Parse regular and sale prices
                if 'Sale' in price_text or 'Rs.' in price_text:
                    product_data['price_info'] = price_text.strip()
            
            # Description
            description = soup.find('div', class_='description')
            product_data['description'] = description.get_text(strip=True) if description else 'N/A'
            
            # Product images
            images = []
            img_containers = soup.find_all('img', class_='product-image')
            for img in img_containers:
                src = img.get('src')
                if src:
                    images.append(urljoin(BASE_URL, src))
            product_data['images'] = images
            
            # Stock status
            stock_element = soup.find('span', class_='inventory')
            product_data['stock_status'] = stock_element.get_text(strip=True) if stock_element else 'Unknown'
            
            # Rating and reviews
            rating = soup.find('span', class_='rating')
            product_data['rating'] = rating.get_text(strip=True) if rating else 'N/A'
            
            review_count = soup.find('span', class_='review-count')
            product_data['review_count'] = review_count.get_text(strip=True) if review_count else '0'
            
            # Variants
            variants = []
            variant_select = soup.find('select', class_='variant')
            if variant_select:
                options = variant_select.find_all('option')
                for option in options:
                    if option.get('value'):
                        variants.append(option.get_text(strip=True))
            product_data['variants'] = variants
            
            driver.quit()
            logger.info(f"Successfully scraped details for {product_data.get('name', 'Unknown')}")
            
        except TimeoutException:
            logger.warning(f"Timeout scraping details for {product_url}")
            self.failed_urls.append(product_url)
        except Exception as e:
            logger.error(f"Error scraping product details from {product_url}: {e}")
            self.failed_urls.append(product_url)
        finally:
            try:
                driver.quit()
            except:
                pass
        
        return product_data
    
    def scrape_all_collections(self, sample_mode: bool = False, max_products: int = None):
        """Scrape all collections and their products"""
        logger.info("=" * 50)
        logger.info("Starting TurtleWings Web Scraper")
        logger.info("=" * 50)
        
        # Discover collections
        collections = self.discover_collections()
        
        if not collections:
            logger.error("Could not discover any collections. Exiting.")
            return
        
        total_products = 0
        
        for idx, collection in enumerate(collections, 1):
            logger.info(f"\n[{idx}/{len(collections)}] Processing collection: {collection['name']}")
            
            collection_url = collection['url']
            max_pages = self.get_collection_max_pages(collection_url)
            
            if sample_mode:
                max_pages = min(2, max_pages)  # Only scrape first 2 pages in sample mode
            
            logger.info(f"Collection has {max_pages} page(s)")
            
            for page in range(1, max_pages + 1):
                logger.info(f"  Scraping page {page}/{max_pages}...")
                
                page_products = self.scrape_collection_page(collection_url, page)
                self.products.extend(page_products)
                total_products += len(page_products)
                
                if max_products and total_products >= max_products:
                    logger.info(f"Reached max products limit ({max_products})")
                    break
            
            if max_products and total_products >= max_products:
                break
        
        logger.info(f"\nTotal products scraped: {total_products}")
        return self.products
    
    def scrape_product_details_for_all(self, scrape_details: bool = True, max_details: int = None):
        """Scrape detailed information for all products"""
        if not scrape_details:
            logger.info("Skipping product details scraping")
            return
        
        logger.info(f"\nScraping product details for {len(self.products)} products...")
        
        for idx, product in enumerate(self.products, 1):
            if max_details and idx > max_details:
                logger.info(f"Reached max details limit ({max_details})")
                break
            
            logger.info(f"[{idx}/{len(self.products)}] Scraping: {product.get('name', 'Unknown')}")
            
            details = self.scrape_product_details(product['url'])
            product.update(details)
    
    def export_to_csv(self, filename: str = None) -> str:
        """Export scraped products to CSV"""
        if not self.products:
            logger.warning("No products to export")
            return None
        
        if filename is None:
            filename = os.path.join(DATA_DIR, f"turtlewings_products_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        
        try:
            # Flatten data for CSV (images and variants as JSON strings)
            data_for_csv = []
            for product in self.products:
                row = product.copy()
                if isinstance(row.get('images'), list):
                    row['images'] = ';'.join(row['images'])
                if isinstance(row.get('variants'), list):
                    row['variants'] = ';'.join(row['variants'])
                data_for_csv.append(row)
            
            df = pd.DataFrame(data_for_csv)
            df.to_csv(filename, index=False, encoding='utf-8')
            
            logger.info(f"Exported {len(self.products)} products to CSV: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            return None
    
    def export_to_json(self, filename: str = None) -> str:
        """Export scraped products to JSON"""
        if not self.products:
            logger.warning("No products to export")
            return None
        
        if filename is None:
            filename = os.path.join(DATA_DIR, f"turtlewings_products_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        try:
            export_data = {
                'metadata': {
                    'source': BASE_URL,
                    'scraped_at': datetime.now().isoformat(),
                    'total_products': len(self.products),
                    'collections_count': len(set(p.get('collection') for p in self.products)),
                    'failed_urls_count': len(self.failed_urls)
                },
                'products': self.products,
                'failed_urls': self.failed_urls
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Exported {len(self.products)} products to JSON: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
            return None
    
    def generate_summary_report(self) -> Dict:
        """Generate a summary report of scraping results"""
        report = {
            'total_products': len(self.products),
            'collections': len(set(p.get('collection') for p in self.products)),
            'failed_urls': len(self.failed_urls),
            'scrape_timestamp': datetime.now().isoformat(),
            'log_file': LOG_FILE,
            'data_files': {
                'csv': None,
                'json': None
            }
        }
        
        # List files in data directory
        if os.path.exists(DATA_DIR):
            files = os.listdir(DATA_DIR)
            report['data_files']['csv'] = [f for f in files if f.endswith('.csv')]
            report['data_files']['json'] = [f for f in files if f.endswith('.json')]
        
        return report


def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='TurtleWings Web Scraper')
    parser.add_argument('--sample', action='store_true', help='Run in sample mode (limited data)')
    parser.add_argument('--max-products', type=int, default=None, help='Maximum products to scrape')
    parser.add_argument('--no-details', action='store_true', help='Skip detailed product scraping')
    parser.add_argument('--max-details', type=int, default=None, help='Maximum products to get details for')
    
    args = parser.parse_args()
    
    scraper = TurtleWingsScraper()
    
    # Scrape collections
    scraper.scrape_all_collections(
        sample_mode=args.sample,
        max_products=args.max_products
    )
    
    # Scrape details
    scraper.scrape_product_details_for_all(
        scrape_details=not args.no_details,
        max_details=args.max_details
    )
    
    # Export data
    csv_file = scraper.export_to_csv()
    json_file = scraper.export_to_json()
    
    # Print summary
    report = scraper.generate_summary_report()
    if csv_file:
        report['data_files']['csv'] = csv_file
    if json_file:
        report['data_files']['json'] = json_file
    
    print("\n" + "=" * 50)
    print("SCRAPING SUMMARY")
    print("=" * 50)
    print(f"Total Products: {report['total_products']}")
    print(f"Collections: {report['collections']}")
    print(f"Failed URLs: {report['failed_urls']}")
    print(f"Log File: {report['log_file']}")
    if csv_file:
        print(f"CSV Export: {csv_file}")
    if json_file:
        print(f"JSON Export: {json_file}")
    print("=" * 50)


if __name__ == '__main__':
    main()
