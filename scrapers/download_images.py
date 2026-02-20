"""
Helper script to download product images from TurtleWings scraper data
"""

import pandas as pd
import requests
import os
from pathlib import Path
import logging
import argparse
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.dirname(__file__)
IMAGES_DIR = os.path.join(DATA_DIR, 'images')


def download_images(csv_file: str, images_dir: str = IMAGES_DIR, max_images: int = None):
    """Download product images from CSV data"""
    
    os.makedirs(images_dir, exist_ok=True)
    
    try:
        df = pd.read_csv(csv_file)
        logger.info(f"Loaded {len(df)} products from {csv_file}")
        
        total_images = 0
        failed_images = 0
        
        for idx, row in df.iterrows():
            product_name = row.get('name', f'product_{idx}').replace('/', '_')
            product_dir = os.path.join(images_dir, product_name)
            os.makedirs(product_dir, exist_ok=True)
            
            # Download thumbnail
            thumbnail_url = row.get('thumbnail_image')
            if thumbnail_url and str(thumbnail_url) != 'nan':
                try:
                    img_filename = os.path.join(product_dir, 'thumbnail.jpg')
                    response = requests.get(thumbnail_url, timeout=10)
                    if response.status_code == 200:
                        with open(img_filename, 'wb') as f:
                            f.write(response.content)
                        logger.info(f"Downloaded thumbnail for {product_name}")
                        total_images += 1
                except Exception as e:
                    logger.warning(f"Failed to download thumbnail for {product_name}: {e}")
                    failed_images += 1
            
            # Download detail images
            images_str = row.get('images')
            if images_str and str(images_str) != 'nan':
                image_urls = images_str.split(';')
                for img_idx, img_url in enumerate(image_urls, 1):
                    if img_url.strip():
                        try:
                            img_filename = os.path.join(product_dir, f'image_{img_idx}.jpg')
                            response = requests.get(img_url.strip(), timeout=10)
                            if response.status_code == 200:
                                with open(img_filename, 'wb') as f:
                                    f.write(response.content)
                                total_images += 1
                        except Exception as e:
                            logger.warning(f"Failed to download image {img_idx} for {product_name}: {e}")
                            failed_images += 1
            
            if max_images and total_images >= max_images:
                logger.info(f"Reached max images limit ({max_images})")
                break
            
            if (idx + 1) % 50 == 0:
                logger.info(f"Processed {idx + 1}/{len(df)} products")
        
        logger.info(f"\nDownload Summary:")
        logger.info(f"Total images downloaded: {total_images}")
        logger.info(f"Failed downloads: {failed_images}")
        logger.info(f"Images saved to: {images_dir}")
        
    except Exception as e:
        logger.error(f"Error downloading images: {e}")


def main():
    parser = argparse.ArgumentParser(description='Download product images from scraper CSV')
    parser.add_argument('--csv', required=True, help='Path to CSV file')
    parser.add_argument('--output-dir', default=IMAGES_DIR, help='Output directory for images')
    parser.add_argument('--max-images', type=int, default=None, help='Maximum images to download')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.csv):
        logger.error(f"CSV file not found: {args.csv}")
        return
    
    download_images(args.csv, args.output_dir, args.max_images)


if __name__ == '__main__':
    main()
