const { URL } = require('url');
const scrapeAjio = require('../sites/ajio');
const scrapeMyntra = require('../sites/myntra');
const scrapeFlipkart = require('../sites/flipkart');

class Links {
  constructor() {
    this.siteLinks = [
      { URL: "amazon.in", siteName: "amazon" },
      { URL: "amzn.in", siteName: "amazon" },
      { URL: "flipkart.com", siteName: "flipkart" },
      { URL: "ajio.com", siteName: "ajio" },
      { URL: "myntra.com", siteName: "myntra" },
    ];
  }

  isLinkValid(link) {
    try {
      const domain = this.extractDomain(link);
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

  extractDomain(link) {
    const parsedUrl = new URL(link);
    let domain = parsedUrl.hostname;

    if (domain) {
      if (domain.startsWith("www.")) domain = domain.substring(4);
      if (domain.startsWith("dl.")) domain = domain.substring(3);
    }

    return domain;
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