"""
Test script for TurtleWings scraper - verify functionality before full run
"""

import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE_URL = "https://www.turtlewings.co.in"


def test_site_accessibility():
    """Test if the website is accessible"""
    logger.info("Testing website accessibility...")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            logger.info(f"✓ Website is accessible (Status: {response.status_code})")
            return True
        else:
            logger.error(f"✗ Website returned status {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"✗ Failed to access website: {e}")
        return False


def test_collection_discovery():
    """Test if we can discover collections"""
    logger.info("\nTesting collection discovery...")
    try:
        response = requests.get(BASE_URL, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find collection links
        collection_links = soup.find_all('a', href=True)
        collections = [link.get('href') for link in collection_links 
                      if link.get('href') and '/collections/' in link.get('href')]
        
        if collections:
            logger.info(f"✓ Found {len(set(collections))} unique collections")
            logger.info(f"Sample collections: {list(set(collections))[:3]}")
            return True
        else:
            logger.warning("✗ Could not find any collections (links may be dynamically loaded)")
            return False
    except Exception as e:
        logger.error(f"✗ Error discovering collections: {e}")
        return False


def test_product_page_parsing():
    """Test if we can parse a product page"""
    logger.info("\nTesting product page parsing...")
    try:
        # Try to find a product by searching for a collection first
        collection_url = f"{BASE_URL}/collections"
        response = requests.get(collection_url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find a product link
        product_links = soup.find_all('a', href=True)
        product_url = None
        for link in product_links:
            href = link.get('href')
            if href and '/products/' in href:
                product_url = f"{BASE_URL}{href}" if href.startswith('/') else href
                break
        
        if product_url:
            logger.info(f"Found product: {product_url}")
            response = requests.get(product_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to extract product info
            title = soup.find('h1')
            price = soup.find('span', class_='price')
            
            if title:
                logger.info(f"✓ Found product title: {title.get_text(strip=True)}")
            if price:
                logger.info(f"✓ Found price info")
            
            return True
        else:
            logger.warning("✗ Could not find any products")
            return False
            
    except Exception as e:
        logger.error(f"✗ Error parsing product page: {e}")
        return False


def test_imports():
    """Test if all required packages are installed"""
    logger.info("\nTesting required imports...")
    
    imports = {
        'requests': 'requests',
        'beautifulsoup4': 'bs4',
        'selenium': 'selenium',
        'pandas': 'pandas',
        'webdriver-manager': 'webdriver_manager'
    }
    
    all_good = True
    for package, import_name in imports.items():
        try:
            __import__(import_name)
            logger.info(f"✓ {package}")
        except ImportError:
            logger.error(f"✗ {package} - NOT INSTALLED")
            logger.info(f"  Run: pip install {package}")
            all_good = False
    
    return all_good


def main():
    logger.info("=" * 50)
    logger.info("TurtleWings Scraper - Pre-flight Check")
    logger.info("=" * 50)
    
    results = {}
    
    # Run tests
    results['imports'] = test_imports()
    results['accessibility'] = test_site_accessibility()
    results['collection_discovery'] = test_collection_discovery()
    results['product_parsing'] = test_product_page_parsing()
    
    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("TEST SUMMARY")
    logger.info("=" * 50)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{test_name:.<35} {status}")
    
    all_passed = all(results.values())
    
    logger.info("=" * 50)
    if all_passed:
        logger.info("✓ All tests passed! Ready to run scraper.")
        logger.info("\nRun scraper with: python turtlewings_scraper.py --sample")
    else:
        logger.warning("✗ Some tests failed. Check errors above.")
        logger.warning("\nBefore running scraper:")
        logger.warning("1. Install missing packages: pip install -r requirements.txt")
        logger.warning("2. Check your internet connection")
        logger.warning("3. Verify website is accessible")
    
    logger.info("=" * 50)
    
    return all_passed


if __name__ == '__main__':
    import sys
    success = main()
    sys.exit(0 if success else 1)
