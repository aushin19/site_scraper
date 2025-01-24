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

async def ajio_data(url):
    start_time = time.time()
    try:
        async with AsyncWebCrawler(verbose=True) as crawler:

            js_commands = [
                "window.scrollTo(0, document.body.scrollHeight);",
                "document.querySelector('ul.prod-list li:last-child').remove();"
            ]

            config = CrawlerRunConfig(js_code=js_commands)

            result = await crawler.arun(url=url, config=config)
            
            if not result.success:
                return {
                    "success": False,
                    "error": result.error_message
                }
            
            soup = BeautifulSoup(result.html, 'html.parser')

            website_name = 'Ajio'
            prod_name = soup.select_one('h1.prod-name').text.strip() if soup.select_one('h1.prod-name') else ''
            
            # Extract current price
            current_price_element = soup.select_one('div.prod-sp')
            prod_currentPriceText = current_price_element.text.strip() if current_price_element else ''
            prod_currentPriceText = prod_currentPriceText.replace("MRP", "") if "MRP" in prod_currentPriceText else prod_currentPriceText
            prod_currentPriceText = prod_currentPriceText.replace(prod_currentPriceText[0], "")
            prod_currentPrice = convert_to_number(prod_currentPriceText)

            # Extract currency symbol
            prod_currencySymbol = "₹"

            # Extract maximum price
            max_price_element = soup.select_one('span.prod-cp')
            prod_maxPriceText = max_price_element.text.strip() if max_price_element else "0"
            prod_maxPriceText = prod_maxPriceText.replace(prod_maxPriceText[0], '') if max_price_element else "0"
            prod_maxPrice = convert_to_number(prod_maxPriceText) if max_price_element else 0

            # Extract rating
            rating_element = soup.select_one('span._3c5q0')
            prod_rating = float(rating_element.text.strip()) if rating_element else 0

            # Extract reviews
            reviews_element = soup.select_one('span._38RNg')
            prod_reviews = reviews_element.text.strip() if reviews_element else ''

            # Extract product image
            image_element = soup.select_one('img.rilrtl-lazy-img.img-alignment.zoom-cursor.rilrtl-lazy-img-loaded')
            prod_image = image_element['src'] if image_element and 'src' in image_element.attrs else ''

            description = soup.select_one('section.prod-desc')
            if description.find_all('li'):
                description.find_all('li')[-1].decompose()
            prod_description = description.prettify()

            print(prod_description)

            execution_time = time.time() - start_time 

            data = {
                "success": True,
                "data": {
                    "website_name": website_name,
                    "prod_name": prod_name,
                    "prod_image": prod_image,
                    "prod_URL": url,
                    "prod_currencySymbol": prod_currencySymbol,
                    "prod_currentPriceText": prod_currentPriceText,
                    "prod_currentPrice": prod_currentPrice,
                    "prod_maxPriceText": prod_maxPriceText,
                    "prod_maxPrice": prod_maxPrice,
                    "prod_rating": prod_rating,
                    "prod_reviews": prod_reviews,
                    "prod_description": prod_description,
                    "execution_time": f"{execution_time:.2f} seconds"
                }
            }  
            
            # print(data)
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
    
def convert_to_number(text):
    if not text:
        return 0
    return int(float(text.replace(',', '')))   