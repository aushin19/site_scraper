import requests
from urllib.parse import urlparse
from sites.myntra import myntra_data
from sites.ajio import ajio_data

class Links:
    def __init__(self):
        self.site_links = [
            {"url": "amazon.in", "site_name": "amazon"},
            {"url": "amzn.in", "site_name": "amazon"},
            {"url": "flipkart.com", "site_name": "flipkart"},
            {"url": "dl.flipkart.com", "site_name": "flipkart"},
            {"url": "ajio.com", "site_name": "ajio"},
            {"url": "ajio.page.link", "site_name": "ajio"},
            {"url": "luxe.ajio.com", "site_name": "ajio"},
            {"url": "myntra.com", "site_name": "myntra"},
        ]

    async def is_link_valid(self, link):
        try:
            domain = await self.extract_domain(link)
            result = next((item for item in self.site_links if item["url"] == domain), None)

            if not result:
                raise ValueError("Site not supported")

            return await self.route_to_scraper(result["site_name"], link)
        except Exception as error:
            raise ValueError(f"Invalid URL: {str(error)}")

    async def extract_domain(self, link):
        try:
            expanded_url = await self.expand_short_url(link)
            parsed_url = urlparse(expanded_url)
            domain = parsed_url.hostname

            if domain.startswith("www."):
                domain = domain[4:]

            return domain
        except Exception as error:
            raise ValueError(f"Failed to extract domain: {str(error)}")

    async def expand_short_url(self, short_url):
        try:
            response = requests.get(
                short_url,
                allow_redirects=True,
                headers={"User-Agent": "Mozilla/5.0"},
            )
            return response.url
        except Exception as error:
            raise ValueError(f"Could not expand the short URL: {str(error)}")

    async def route_to_scraper(self, site_name, url):
        if site_name == "flipkart":
            return await myntra_data(url)
        elif site_name == "ajio":
            return await ajio_data(url)
        elif site_name == "myntra":
            return await myntra_data(url)
        else:
            raise ValueError("Scraper not implemented for this site")