const { URL } = require('url');
const axios = require('axios'); // Ensure axios is imported
const scrapeAjio = require('../sites/ajio');
const scrapeMyntra = require('../sites/myntra');
const scrapeFlipkart = require('../sites/flipkart');

class Links {
  constructor() {
    this.siteLinks = [
      { URL: "amazon.in", siteName: "amazon" },
      { URL: "amzn.in", siteName: "amazon" },
      { URL: "flipkart.com", siteName: "flipkart" },
      { URL: "dl.flipkart.com", siteName: "flipkart" },
      { URL: "ajio.com", siteName: "ajio" },
      { URL: "ajio.page.link", siteName: "ajio" },
      { URL: "luxe.ajio.com", siteName: "ajio" },
      { URL: "myntra.com", siteName: "myntra" },
    ];
  }

  async isLinkValid(link) {
    try {
      const domain = await this.extractDomain(link); // Ensure asynchronous handling
      const result = this.siteLinks.find((element) => element.URL === domain);

      if (result) {
        return this.routeToScraper(result.siteName, link);
      } else {
        throw new Error("Site not supported");
      }
    } catch (error) {
      throw new Error("Invalid URL: " + error.message);
    }
  }

  async extractDomain(link) {
    try {
      const expandedUrl = await this.expandShortURL(link);
      const parsedUrl = new URL(expandedUrl);
      let domain = parsedUrl.hostname;

      if (domain && domain.startsWith("www.")) {
        domain = domain.substring(4);
      }

      console.log("Domain:", domain);
      return domain;
    } catch (error) {
      throw new Error("Failed to extract domain: " + error.message);
    }
  }

  async expandShortURL(shortURL) {
    try {
      const response = await axios.get(shortURL, {
        maxRedirects: 10,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
  
      // If there's a redirect, axios will give us the final URL in the response
      const originalUrl = response.request.res.responseUrl;
  
      console.log('Final expanded URL:', originalUrl); // Debugging
  
      return originalUrl;
    } catch (error) {
      console.error('Error extracting original URL:', error.message);
  
      if (error.response) {
        // This block handles the HTTP error (e.g., 404 or 500 status)
        console.error('Response data:');
        console.error('Response status:', error.response.status);
        console.error('Response headers:');
      } else if (error.request) {
        // This block handles the case when no response is received
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
  
      throw new Error("Could not expand the short URL or failed to fetch the original URL.");
    }
  }
  

  async routeToScraper(siteName, link) {
    switch (siteName) {
      case "flipkart":
        return await scrapeFlipkart(link);
      case "ajio":
        return await scrapeAjio(link);
      case "myntra":
        return await scrapeMyntra(link);
      default:
        throw new Error("Scraper not implemented for this site");
    }
  }
}

module.exports = Links;
