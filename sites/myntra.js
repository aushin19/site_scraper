const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function myntraData(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-http2',
                '--disable-gpu',
            ],
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const website_name = 'Myntra';
        const prod_name = $('h1.pdp-name').text().trim();
        const prod_affiliateURL = '';
        const prod_URL = url;
        const prod_currentPrice = $('span.pdp-price').text().trim().replace("MRP", "").replace(" ", "");
        const prod_currencySymbol = prod_currentPrice.trim().charAt(0);
        const prod_maxPrice = $('span.pdp-mrp > s:first-child').text().trim();
        const prod_rating = $('div.index-overallRating > div:first-child').text().trim();
        const prod_reviews = $('div.index-ratingsCount').text().trim();

        const prod_image_style = $('div.image-grid-image').attr('style');
        let prod_image = '';

        if (prod_image_style) {
            const urlMatch = prod_image_style.match(/url\("(.+?)"\)/);
            prod_image = urlMatch ? urlMatch[1] : '';
        }

        await browser.close();

        const productData = {
            website_name,
            prod_name,
            prod_image,
            prod_affiliateURL,
            prod_URL,
            prod_currencySymbol,
            prod_currentPrice,
            prod_maxPrice,
            prod_rating,
            prod_reviews,
        };

        return productData;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to scrape the data');
    }
}

module.exports = myntraData;