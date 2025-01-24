from flask import Flask, jsonify, request
import json
import asyncio
import time
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import re

executor = ThreadPoolExecutor(max_workers=3)

def convert_price(number):
    """Convert number to US formatted string"""
    return "{:,}".format(number)

def convert_to_number(string):
    """Convert string price to number"""
    if not string:
        return 0
    return float(string.replace(',', ''))

async def myntra_data(url):
    start_time = time.time()
    try:
        async with AsyncWebCrawler(verbose=True) as crawler:
            result = await crawler.arun(url=url)
            
            if not result.success:
                return {
                    "success": False,
                    "error": result.error_message
                }
            
            soup = BeautifulSoup(result.html, 'html.parser')
            
            website_name = 'Myntra'
            prod_name = soup.select_one('h1.pdp-name').text.strip() if soup.select_one('h1.pdp-name') else ''

            if len(prod_name) == 0:
                return {
                    "success": False,
                    "error": "Product name not found"
                }
            
            # Extract current price
            price_element = soup.select_one('span.pdp-price strong')
            prod_currentPriceText = price_element.text.strip() if price_element else ''
            prod_currentPriceText = prod_currentPriceText.replace(prod_currentPriceText[0], "").replace(" ", "")
            prod_currentPrice = convert_to_number(prod_currentPriceText)
            prod_currentPriceText = convert_price(prod_currentPrice)

            print(prod_currentPriceText)

            currency_symbol = "₹"
            
            # Extract maximum price
            max_price_element = soup.select_one('span.pdp-mrp > s:first-child')
            max_price_text = max_price_element.text.strip() if max_price_element else '0'
            max_price_text = max_price_text.replace(max_price_text[0], "") if price_element else '0'
            max_price = convert_to_number(max_price_text) if price_element else 0
            max_price_text = convert_price(max_price) if price_element else '0'

            print( max_price_text)
            
            # Extract rating and reviews
            rating_element = soup.select_one('div.index-overallRating > div:first-child')
            rating = float(rating_element.text.strip()) if rating_element else 0
            
            reviews_element = soup.select_one('div.index-ratingsCount')
            reviews = reviews_element.text.strip() if reviews_element else ''
            
            # Extract product image
            image_div = soup.select_one('div.image-grid-image')
            prod_image = ''
            if image_div and 'style' in image_div.attrs:
                style = image_div['style']
                url_match = re.search(r'url\("(.+?)"\)', style)
                if url_match:
                    prod_image = url_match.group(1)

            prod_description = soup.select_one('div.pdp-productDescriptorsContainer > div:first-child')
            prod_description = prod_description.decode_contents().strip()

            print(prod_description)

            execution_time = time.time() - start_time 

            data = {
                "success": True,
                "data": {
                    "website_name": website_name,
                    "prod_name": prod_name,
                    "prod_image": prod_image,
                    "prod_URL": url,
                    "prod_currencySymbol": currency_symbol,
                    "prod_currentPriceText": prod_currentPriceText,
                    "prod_currentPrice": prod_currentPrice,
                    "prod_maxPriceText": max_price_text,
                    "prod_maxPrice": max_price,
                    "prod_rating": rating,
                    "prod_reviews": reviews,
                    "prod_description": prod_description,
                    "execution_time": f"{execution_time:.2f} seconds"
                }
            }
            return data

    except Exception as e:
        execution_time = time.time() - start_time
        print(f"Error: {str(e)}")
        print(f"Failed after {execution_time:.2f} seconds")
        return {
            "success": False,
            "error": str(e),
            "execution_time": f"{execution_time:.2f} seconds"
        }

def convert_price(number):
    return f'{number:,}'

def convert_to_number(text):
    if not text:
        return 0
    return int(float(text.replace(',', '')))
